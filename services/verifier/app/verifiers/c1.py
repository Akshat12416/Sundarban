"""C1: one multimodal call over the whole submission."""

from __future__ import annotations

import base64
import json

from app.llm import ModelWrapper
from app.prompts import load_prompt
from app.schema import Report, finish_report
from app.submission import Submission

PROMPT_NAME = "c1_v1"
AGENT_ID = "c1"


class C1Verifier:
    def __init__(self, wrapper: ModelWrapper, prompt_name: str = PROMPT_NAME, agent_id: str = AGENT_ID) -> None:
        self.wrapper = wrapper
        self.agent_id = agent_id
        self.version, self.prompt = load_prompt(prompt_name)

    def verify(self, submission: Submission) -> Report:
        call = self.wrapper.complete(
            evidence_sha256=submission.evidence_sha256(),
            agent_id=self.agent_id,
            prompt_version=self.version,
            parts=parts_for(self.prompt, self.agent_id, submission),
        )
        return finish_report(
            [call.output],
            model_id=call.model_id,
            prompt_versions=[self.version],
            tokens=call.tokens,
            latency_ms=call.latency_ms,
            cache_hit=call.cache_hit,
            decision=call.output.decision,
        )


def parts_for(prompt: str, agent_id: str, submission: Submission) -> list[dict]:
    data = {
        "submission_id": submission.submission_id,
        "agent": agent_id,
        "parcel_latitude": submission.parcel_latitude,
        "parcel_longitude": submission.parcel_longitude,
        "location_claim": submission.location_claim,
        "tree_count": submission.tree_count,
        "area_ha": submission.area_ha,
        "species": submission.species,
        "region": submission.region,
        "document_text": submission.document_text,
        "form_fields": submission.form_fields or {},
        "registry": [
            {
                "item_id": item.item_id,
                "sha256": item.sha256,
                "phash": item.phash,
                "parcel_latitude": item.parcel_latitude,
                "parcel_longitude": item.parcel_longitude,
            }
            for item in submission.registry
        ],
        "photos": [
            {
                "filename": photo.filename,
                "role": photo.role,
                "sha256": photo.sha256,
                "phash": photo.phash,
                "gps_latitude": photo.gps_latitude,
                "gps_longitude": photo.gps_longitude,
            }
            for photo in submission.photos
        ],
    }
    parts: list[dict] = [
        {"text": prompt + "\nSet agent to " + agent_id + ".\n" + json.dumps(data, sort_keys=True)}
    ]
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
