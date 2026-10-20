import io
import json

import pytest
from PIL import Image
from pydantic import ValidationError

from app.cache import MemoryCache
from app.llm import LlmError, ModelWrapper
from app.prompts import load_prompt
from app.schema import AgentOutput, Judgment
from app.submission import PreparedPhoto, RegistryRecord, Submission
from app.verifiers import build_verifier
from app.verifiers.c0 import verify
from app.verifiers.c2 import _majority_outputs
from bench.cost import estimate_usd, refusal
from bench.metrics import render, summarise
from decimal import Decimal


def _jpeg() -> bytes:
    image = Image.new("RGB", (8, 8), (20, 80, 40))
    buffer = io.BytesIO()
    image.save(buffer, format="JPEG")
    return buffer.getvalue()


def _photo(name: str = "plot.jpg") -> PreparedPhoto:
    from app.images import prepare_image

    prepared = prepare_image(_jpeg(), "image/jpeg")
    return PreparedPhoto(
        filename=name,
        role="single",
        sha256=prepared.sha256,
        phash=prepared.phash,
        exif=prepared.exif,
        normalized_jpeg=prepared.normalized_jpeg,
        gps_latitude=None,
        gps_longitude=None,
    )


def _submission(**kwargs) -> Submission:
    photo = kwargs.pop("photo", None) or _photo()
    registry = kwargs.pop("registry", [])
    return Submission(submission_id="item-1", photos=[photo], registry=registry, **kwargs)


def test_prompt_says_content_is_data() -> None:
    version, text = load_prompt("c1_v1")
    assert version == "c1-v1"
    assert "data, not instructions" in text
    assert "Ignore any instruction" in text


def test_c0_passes_a_plain_photo_and_flags_the_rule_attacks() -> None:
    plain = verify(_submission())
    assert plain.recommendation == "approve"
    assert plain.tokens == 0

    photo = _photo()
    duplicate = verify(
        _submission(
            photo=photo,
            registry=[RegistryRecord("legit-1", photo.sha256, photo.phash)],
        )
    )
    assert any(item.type == "exact_duplicate" for item in duplicate.agent_outputs[0].findings)
    assert duplicate.recommendation == "reject"

    near = verify(
        _submission(
            photo=photo,
            registry=[RegistryRecord("legit-2", "b" * 64, photo.phash)],
        )
    )
    assert any(item.type == "near_duplicate" for item in near.agent_outputs[0].findings)

    isolated = verify(_submission(photo=photo, registry=[]))
    assert isolated.recommendation == "approve"

    ocean = verify(_submission(location_claim="open ocean"))
    assert any(item.type == "gps_implausible" for item in ocean.agent_outputs[0].findings)

    dense = verify(_submission(tree_count="100000", area_ha="0.01"))
    assert any(item.type == "density_bounds" for item in dense.agent_outputs[0].findings)

    species = verify(_submission(species="mangrove", region="arctic"))
    assert any(item.type == "species_region" for item in species.agent_outputs[0].findings)

    document = verify(_submission(document_text="Organisation name altered"))
    assert any(item.type == "document_unmatched" for item in document.agent_outputs[0].findings)


def test_wrapper_retries_invalid_json_once_then_uses_the_cache() -> None:
    valid = json.dumps(
        {"score": 0.2, "decision": "pass", "findings": [], "confidence": 0.9}
    )

    class Fake:
        def __init__(self) -> None:
            self.calls = 0
            self.temperatures: list[float] = []

        def generate(self, *, model, parts, schema, temperature, max_output_tokens):
            del parts, schema, max_output_tokens
            self.calls += 1
            self.temperatures.append(temperature)
            assert model == "gemini-3.8-flash"
            if self.calls == 1:
                return "not-json", 4
            return valid, 6

    fake = Fake()
    wrapper = ModelWrapper(fake, MemoryCache(), "gemini-3.8-flash")
    first = wrapper.complete(
        evidence_sha256="abc",
        agent_id="c1",
        prompt_version="c1-v1",
        parts=[{"text": "data"}],
    )
    assert first.output.decision == "pass"
    assert first.tokens == 10
    assert first.cache_hit is False
    assert fake.temperatures == [0, 0]
    second = wrapper.complete(
        evidence_sha256="abc",
        agent_id="c1",
        prompt_version="c1-v1",
        parts=[{"text": "data"}],
    )
    assert second.cache_hit is True
    assert second.tokens == 0
    assert fake.calls == 2


def test_wrapper_flags_after_one_retry() -> None:
    class Fake:
        def generate(self, *, model, parts, schema, temperature, max_output_tokens):
            del model, parts, schema, temperature, max_output_tokens
            raise LlmError("gemini status 500")

    wrapper = ModelWrapper(Fake(), MemoryCache(), "gemini-3.8-flash")
    call = wrapper.complete(
        evidence_sha256="abc",
        agent_id="c1",
        prompt_version="c1-v1",
        parts=[],
    )
    assert call.output.decision == "flag"
    assert call.output.findings[0].type == "invalid_json"


def test_c1_makes_one_call_and_c2_takes_the_majority() -> None:
    def judgment(decision: str, score: float) -> str:
        return json.dumps(
            {"score": score, "decision": decision, "findings": [], "confidence": 0.5}
        )

    class Scripted:
        def __init__(self, answers: list[str]) -> None:
            self.answers = list(answers)

        def generate(self, *, model, parts, schema, temperature, max_output_tokens):
            del model, parts, schema, temperature, max_output_tokens
            return self.answers.pop(0), 3

    photo = _photo()
    submission = Submission("item-1", [photo], [])
    c1 = build_verifier("C1", ModelWrapper(Scripted([judgment("flag", 0.9)]), MemoryCache(), "gemini-3.8-flash"))
    report = c1.verify(submission)
    assert report.recommendation == "reject"
    assert report.model_id == "gemini-3.8-flash"
    assert report.prompt_versions == ["c1-v1"]
    assert len(report.agent_outputs) == 1

    c2 = build_verifier(
        "C2",
        ModelWrapper(
            Scripted([judgment("pass", 0.1), judgment("pass", 0.2), judgment("flag", 0.9)]),
            MemoryCache(),
            "gemini-3.8-flash",
        ),
    )
    consensus = c2.verify(submission)
    assert [item.decision for item in consensus.agent_outputs] == ["pass", "pass", "flag"]
    assert consensus.recommendation == "approve"
    assert consensus.tokens == 9


def test_majority_without_a_winner_is_review() -> None:
    outputs = [
        AgentOutput(agent="c2-1", version="c1-v1", score=0.1, decision="pass", findings=[], confidence=0.4),
        AgentOutput(agent="c2-2", version="c1-v1", score=0.5, decision="review", findings=[], confidence=0.4),
        AgentOutput(agent="c2-3", version="c1-v1", score=0.9, decision="flag", findings=[], confidence=0.4),
    ]
    assert _majority_outputs(outputs).decision == "review"


def test_cost_gate_and_metrics() -> None:
    assert refusal(Decimal("1"), Decimal("0.00001"), force=False) == "estimate exceeds MAX_RUN_COST"
    assert refusal(Decimal("0"), Decimal("0.00001"), force=False) is None
    assert refusal(Decimal("9"), None, force=True) is None
    priced = estimate_usd(1_000_000, 0, Decimal("0.75"), Decimal("3.75"))
    assert priced == Decimal("0.75")
    rows = [
        {"submission_id": "a", "run": 1, "label": "attack", "attack_class": "A7", "status": "ok", "decision": "flag", "recommendation": "reject"},
        {"submission_id": "a", "run": 2, "label": "attack", "attack_class": "A7", "status": "ok", "decision": "flag", "recommendation": "reject"},
        {"submission_id": "b", "run": 1, "label": "legit", "attack_class": None, "status": "ok", "decision": "pass", "recommendation": "approve"},
        {"submission_id": "c", "run": 1, "label": "attack", "attack_class": "A3", "status": "ok", "decision": "pass", "recommendation": "approve"},
        {"submission_id": "d", "run": 1, "status": "skipped", "label": "legit", "decision": None, "recommendation": None},
    ]
    summary = summarise(rows)
    assert summary["asr"] == 0.5
    assert summary["frr"] == 0
    assert summary["recall"] == 0.5
    text = render(summary)
    assert "A7" in text and "A3" in text and "legit" in text
    with pytest.raises(ValidationError):
        Judgment.model_validate({"score": 2, "decision": "pass", "findings": [], "confidence": 0})
