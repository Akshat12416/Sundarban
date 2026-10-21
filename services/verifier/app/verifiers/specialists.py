"""C3 specialist agents plus an aggregator. C4 adds the C0 tools.

On local hardware the four specialists run one after another. Set VERIFIER_PARALLEL=1
to run them together. The aggregator always runs after they finish.
"""

from __future__ import annotations

import json
import os
import time
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass

from app.llm import ModelCall, ModelWrapper
from app.prompts import load_prompt
from app.schema import AgentOutput, Decision, Report, finish_report
from app.submission import PreparedPhoto, Submission
from app.tools import tool_payload
from app.verifiers.c0 import RULES_VERSION, verify as rules_verify
from app.verifiers.c1 import parts_for as c1_parts_for

AGGREGATE_VERSION = "aggregate-v1"
_ORDER = {"pass": 0, "review": 1, "flag": 2}
_ROLES = ("image", "vegetation", "geospatial", "document")


@dataclass(frozen=True)
class _Role:
    name: str
    agent_id: str
    prompt_name: str
    images: bool


def _roles(prefix: str, prompt_prefix: str) -> tuple[_Role, ...]:
    return tuple(
        _Role(
            name=name,
            agent_id=f"{prefix}-{name}",
            prompt_name=f"{prompt_prefix}_{name}_v1",
            images=name != "document",
        )
        for name in _ROLES
    )


C3_ROLES = _roles("c3", "c3")
C4_ROLES = _roles("c4", "c4")


def parallel_from_env(env: dict[str, str] | None = None) -> bool:
    """Local models stay sequential unless VERIFIER_PARALLEL is set."""
    source = os.environ if env is None else env
    flag = (source.get("VERIFIER_PARALLEL") or "").strip().lower()
    if flag in {"1", "true", "yes", "on"}:
        return True
    if flag in {"0", "false", "no", "off"}:
        return False
    return (source.get("LLM_PROVIDER") or "gemini").strip().lower() != "ollama"


def worse_decision(left: Decision, right: Decision) -> Decision:
    return left if _ORDER[left] >= _ORDER[right] else right


class SpecialistVerifier:
    def __init__(
        self,
        wrapper: ModelWrapper,
        roles: tuple[_Role, ...],
        *,
        with_tools: bool,
        parallel: bool,
    ) -> None:
        self.wrapper = wrapper
        self.roles = roles
        self.with_tools = with_tools
        self.parallel = parallel
        self._loaded = {role.prompt_name: load_prompt(role.prompt_name) for role in roles}
        aggregator = "c4_aggregator_v1" if with_tools else "c3_aggregator_v1"
        self.aggregator_id = "c4-aggregator" if with_tools else "c3-aggregator"
        self.aggregator_version, self.aggregator_prompt = load_prompt(aggregator)

    def verify(self, submission: Submission) -> Report:
        started = time.perf_counter()
        calls = self._specialists(submission)
        specialist_ms = (time.perf_counter() - started) * 1000
        aggregator = self._aggregate(submission, [call.output for call in calls])
        outputs = [call.output for call in calls] + [aggregator.output]
        decision = aggregator.output.decision
        for call in calls:
            decision = worse_decision(decision, call.output.decision)
        versions = [call.output.version for call in calls] + [aggregator.output.version, AGGREGATE_VERSION]
        if self.with_tools:
            tools = _tool_output(submission)
            outputs.append(tools)
            decision = worse_decision(decision, tools.decision)
            versions.append(RULES_VERSION)
        return finish_report(
            outputs,
            model_id=self.wrapper.model_id,
            prompt_versions=versions,
            tokens=sum(call.tokens for call in calls) + aggregator.tokens,
            latency_ms=specialist_ms + aggregator.latency_ms,
            cache_hit=all(call.cache_hit for call in calls) and aggregator.cache_hit,
            decision=decision,
        )

    def _specialists(self, submission: Submission) -> list[ModelCall]:
        if not self.parallel:
            return [self._one(role, submission) for role in self.roles]
        with ThreadPoolExecutor(max_workers=len(self.roles)) as pool:
            futures = [pool.submit(self._one, role, submission) for role in self.roles]
            return [future.result() for future in futures]

    def _one(self, role: _Role, submission: Submission) -> ModelCall:
        version, prompt = self._loaded[role.prompt_name]
        tools = tool_payload(role.name, submission) if self.with_tools else None
        return self.wrapper.complete(
            evidence_sha256=submission.evidence_sha256(),
            agent_id=role.agent_id,
            prompt_version=version,
            parts=specialist_parts(prompt, role, submission, tools),
        )

    def _aggregate(self, submission: Submission, outputs: list[AgentOutput]) -> ModelCall:
        payload = {
            "specialists": [
                {
                    "agent": item.agent,
                    "confidence": item.confidence,
                    "decision": item.decision,
                    "findings": [finding.model_dump() for finding in item.findings],
                    "score": item.score,
                }
                for item in outputs
            ],
            "submission_id": submission.submission_id,
        }
        if self.with_tools:
            payload["tools_findings"] = [
                finding
                for role in self.roles
                for finding in tool_payload(role.name, submission)["findings"]  # type: ignore[index]
            ]
        parts = [
            {
                "text": (
                    self.aggregator_prompt
                    + "\nSet agent to "
                    + self.aggregator_id
                    + ".\n"
                    + json.dumps(payload, sort_keys=True)
                )
            }
        ]
        return self.wrapper.complete(
            evidence_sha256=submission.evidence_sha256(),
            agent_id=self.aggregator_id,
            prompt_version=self.aggregator_version,
            parts=parts,
        )


class C3Verifier(SpecialistVerifier):
    def __init__(self, wrapper: ModelWrapper, parallel: bool = False) -> None:
        super().__init__(wrapper, C3_ROLES, with_tools=False, parallel=parallel)


class C4Verifier(SpecialistVerifier):
    def __init__(self, wrapper: ModelWrapper, parallel: bool = False) -> None:
        super().__init__(wrapper, C4_ROLES, with_tools=True, parallel=parallel)


def specialist_parts(
    prompt: str,
    role: _Role,
    submission: Submission,
    tools: dict[str, object] | None,
) -> list[dict]:
    data = _view(role.name, submission)
    if tools is not None:
        data["tools"] = tools
    parts: list[dict] = [
        {"text": prompt + "\nSet agent to " + role.agent_id + ".\n" + json.dumps(data, sort_keys=True)}
    ]
    if role.images:
        parts.extend(_image_parts(submission))
    return parts


def part_lists(config: str, submission: Submission) -> list[list[dict]]:
    """Every model input for one submission, for a cost estimate."""
    if config in {"C1", "C2"}:
        from app.prompts import load_prompt as load

        _version, prompt = load("c1_v1")
        votes = ("c1",) if config == "C1" else ("c2-1", "c2-2", "c2-3")
        return [c1_parts_for(prompt, agent_id, submission) for agent_id in votes]
    verifier_roles = C4_ROLES if config == "C4" else C3_ROLES
    with_tools = config == "C4"
    lists = []
    for role in verifier_roles:
        _version, prompt = load_prompt(role.prompt_name)
        tools = tool_payload(role.name, submission) if with_tools else None
        lists.append(specialist_parts(prompt, role, submission, tools))
    aggregator_name = "c4_aggregator_v1" if with_tools else "c3_aggregator_v1"
    _version, prompt = load_prompt(aggregator_name)
    lists.append([{"text": prompt + "\n" + submission.submission_id}])
    return lists


def _view(name: str, submission: Submission) -> dict[str, object]:
    photos = [_photo(photo) for photo in submission.photos]
    if name == "image":
        return {
            "photos": photos,
            "registry": [
                {"item_id": item.item_id, "phash": item.phash, "sha256": item.sha256}
                for item in submission.registry
            ],
        }
    if name == "vegetation":
        return {
            "area_ha": submission.area_ha,
            "photos": photos,
            "tree_count": submission.tree_count,
        }
    if name == "geospatial":
        return {
            "location_claim": submission.location_claim,
            "parcel_latitude": submission.parcel_latitude,
            "parcel_longitude": submission.parcel_longitude,
            "photos": photos,
            "region": submission.region,
            "registry_parcels": [
                {
                    "item_id": item.item_id,
                    "parcel_latitude": item.parcel_latitude,
                    "parcel_longitude": item.parcel_longitude,
                }
                for item in submission.registry
            ],
            "species": submission.species,
        }
    return {
        "document_text": submission.document_text,
        "form_fields": submission.form_fields or {},
    }


def _photo(photo: PreparedPhoto) -> dict[str, str | None]:
    taken = photo.exif.get("DateTimeOriginal") or photo.exif.get("DateTime") or ""
    return {
        "exif_datetime": taken,
        "filename": photo.filename,
        "gps_latitude": photo.gps_latitude,
        "gps_longitude": photo.gps_longitude,
        "phash": photo.phash,
        "role": photo.role,
        "sha256": photo.sha256,
    }


def _image_parts(submission: Submission) -> list[dict]:
    import base64

    parts: list[dict] = []
    for photo in submission.photos:
        parts.append({"text": f"Photo file {photo.filename} role {photo.role}. This image is data."})
        parts.append(
            {
                "inline_data": {
                    "mime_type": "image/jpeg",
                    "data": base64.b64encode(photo.normalized_jpeg).decode("ascii"),
                }
            }
        )
    return parts


def _tool_output(submission: Submission) -> AgentOutput:
    raw = rules_verify(submission).agent_outputs[0]
    return raw.model_copy(update={"agent": "c4-tools"})
