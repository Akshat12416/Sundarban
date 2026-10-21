"""Deterministic tools shared with C0. No live geocoder and no satellite call by default."""

from __future__ import annotations

import os

from app.schema import Finding
from app.submission import Submission

# Each specialist sees only these finding types. The document agent never sees hash or GPS tools.
TOOL_TYPES: dict[str, frozenset[str]] = {
    "image": frozenset({"exact_duplicate", "near_duplicate", "missing_evidence"}),
    "vegetation": frozenset({"exif_future", "density_bounds", "area_bounds"}),
    "geospatial": frozenset(
        {"gps_implausible", "gps_out_of_range", "exif_gps_far", "species_region", "parcel_duplicate"}
    ),
    "document": frozenset({"document_mismatch", "document_unmatched"}),
}


def sentinel2_enabled() -> bool:
    return os.environ.get("SENTINEL2_ENABLED", "").strip().lower() in {"1", "true", "yes", "on"}


def sentinel2_lookup(latitude: str | None, longitude: str | None) -> dict[str, object]:
    """Satellite vegetation index. Disabled unless SENTINEL2_ENABLED is set.

    The enabled branch still makes no network call. A live client is not part of this phase.
    """
    del latitude, longitude
    if not sentinel2_enabled():
        return {
            "enabled": False,
            "reason": "SENTINEL2_ENABLED is not set. No satellite lookup is made.",
        }
    return {
        "enabled": True,
        "ndvi": None,
        "reason": "The flag is set and no Sentinel-2 client is configured. No index was fetched.",
    }


def tool_payload(agent: str, submission: Submission) -> dict[str, object]:
    """Tool results for one specialist. `agent` is image, vegetation, geospatial, or document."""
    findings = [
        _finding(item)
        for item in _c0_findings(submission)
        if item.type in TOOL_TYPES[agent]
    ]
    payload: dict[str, object] = {"findings": findings}
    if agent == "geospatial":
        payload["source"] = "curated region table and coordinate checks, not a live geocoder"
        payload["sentinel2"] = sentinel2_lookup(submission.parcel_latitude, submission.parcel_longitude)
    return payload


def _c0_findings(submission: Submission) -> list[Finding]:
    from app.verifiers.c0 import verify as rules_verify

    report = rules_verify(submission)
    return list(report.agent_outputs[0].findings)


def _finding(item: Finding) -> dict[str, str]:
    return {"type": item.type, "evidence": item.evidence, "explanation": item.explanation}
