"""C0: deterministic checks. No model call."""

from __future__ import annotations

from decimal import Decimal, InvalidOperation

from app.duplicates import DuplicateIndex, RegistryItem
from app.rules_config import (
    DOCUMENT_FIELDS,
    GPS_RADIUS_M,
    IMPLAUSIBLE_LOCATION_WORDS,
    MAX_AREA_HA,
    MAX_TREES_PER_HA,
    MIN_AREA_HA,
    PHASH_THRESHOLD,
    SPECIES_REGIONS,
)
from app.schema import AgentOutput, Finding, Report, finish_report
from app.submission import Submission

RULES_VERSION = "c0-v1"


def verify(submission: Submission) -> Report:
    findings: list[tuple[Finding, Decimal]] = []
    if not submission.photos:
        findings.append(
            (
                Finding(
                    type="missing_evidence",
                    evidence=submission.submission_id,
                    explanation="The submission has no photos.",
                ),
                Decimal("0.4"),
            )
        )
    findings.extend(_duplicates(submission))
    findings.extend(_gps(submission))
    findings.extend(_exif(submission))
    findings.extend(_density(submission))
    findings.extend(_species(submission))
    findings.extend(_document(submission))
    output = _output(findings)
    return finish_report(
        [output],
        model_id="",
        prompt_versions=[RULES_VERSION],
        tokens=0,
        latency_ms=0,
        cache_hit=False,
        decision=output.decision,
    )


def _duplicates(submission: Submission) -> list[tuple[Finding, Decimal]]:
    index = DuplicateIndex(
        [
            RegistryItem(item.item_id, item.sha256, item.phash)
            for item in submission.registry
            if item.sha256 and item.phash
        ],
        PHASH_THRESHOLD,
    )
    found: list[tuple[Finding, Decimal]] = []
    for photo in submission.photos:
        lookup = index.lookup(photo.sha256, photo.phash)
        if lookup.exact:
            found.append(
                (
                    Finding(
                        type="exact_duplicate",
                        evidence=photo.filename,
                        explanation="SHA-256 matches registry item " + ", ".join(lookup.exact),
                    ),
                    Decimal("1"),
                )
            )
        elif lookup.near:
            nearest = min(lookup.near, key=lambda item: item.distance)
            found.append(
                (
                    Finding(
                        type="near_duplicate",
                        evidence=photo.filename,
                        explanation=(
                            f"Perceptual hash is {nearest.distance} bits from registry item {nearest.item_id}"
                        ),
                    ),
                    Decimal("0.8"),
                )
            )
    for item in submission.registry:
        if not item.parcel_latitude or not submission.parcel_latitude:
            continue
        if (
            item.parcel_latitude == submission.parcel_latitude
            and item.parcel_longitude == submission.parcel_longitude
        ):
            found.append(
                (
                    Finding(
                        type="parcel_duplicate",
                        evidence=item.item_id,
                        explanation="Declared parcel matches a registry item",
                    ),
                    Decimal("0.9"),
                )
            )
            break
    return found


def _gps(submission: Submission) -> list[tuple[Finding, Decimal]]:
    found: list[tuple[Finding, Decimal]] = []
    claim = (submission.location_claim or "").casefold()
    if any(word in claim for word in IMPLAUSIBLE_LOCATION_WORDS):
        found.append(
            (
                Finding(
                    type="gps_implausible",
                    evidence="location_claim",
                    explanation="The location claim is not a land parcel",
                ),
                Decimal("1"),
            )
        )
    for name, value, limit in (
        ("parcel_latitude", submission.parcel_latitude, Decimal("90")),
        ("parcel_longitude", submission.parcel_longitude, Decimal("180")),
    ):
        if value is None:
            continue
        parsed = _decimal(value)
        if parsed is None or abs(parsed) > limit:
            found.append(
                (
                    Finding(
                        type="gps_out_of_range",
                        evidence=name,
                        explanation="Coordinate is missing or outside the valid range",
                    ),
                    Decimal("1"),
                )
            )
    if submission.parcel_latitude and submission.parcel_longitude:
        for photo in submission.photos:
            if not photo.gps_latitude or not photo.gps_longitude:
                continue
            distance = _metres(
                submission.parcel_latitude,
                submission.parcel_longitude,
                photo.gps_latitude,
                photo.gps_longitude,
            )
            if distance is not None and distance > GPS_RADIUS_M:
                found.append(
                    (
                        Finding(
                            type="exif_gps_far",
                            evidence=photo.filename,
                            explanation=f"EXIF GPS is {int(distance)} m from the declared parcel",
                        ),
                        Decimal("0.8"),
                    )
                )
    return found


def _exif(submission: Submission) -> list[tuple[Finding, Decimal]]:
    found: list[tuple[Finding, Decimal]] = []
    for photo in submission.photos:
        taken = photo.exif.get("DateTime") or photo.exif.get("DateTimeOriginal")
        if taken and taken[:4].isdigit() and int(taken[:4]) > 2026:
            found.append(
                (
                    Finding(
                        type="exif_future",
                        evidence=photo.filename,
                        explanation="EXIF timestamp is in the future",
                    ),
                    Decimal("0.7"),
                )
            )
    return found


def _density(submission: Submission) -> list[tuple[Finding, Decimal]]:
    area = _decimal(submission.area_ha) if submission.area_ha else None
    trees = _decimal(submission.tree_count) if submission.tree_count else None
    found: list[tuple[Finding, Decimal]] = []
    if area is not None and (area < MIN_AREA_HA or area > MAX_AREA_HA):
        found.append(
            (
                Finding(
                    type="area_bounds",
                    evidence="area_ha",
                    explanation="Declared area is outside the configured bounds",
                ),
                Decimal("1"),
            )
        )
    if area is not None and trees is not None and area > 0 and trees / area > MAX_TREES_PER_HA:
        found.append(
            (
                Finding(
                    type="density_bounds",
                    evidence="tree_count",
                    explanation="Declared trees per hectare exceed the configured bound",
                ),
                Decimal("1"),
            )
        )
    return found


def _species(submission: Submission) -> list[tuple[Finding, Decimal]]:
    species = (submission.species or "").casefold().strip()
    region = (submission.region or "").casefold().strip()
    allowed = SPECIES_REGIONS.get(species)
    if not allowed or not region:
        return []
    if any(word in region for word in allowed):
        return []
    return [
        (
            Finding(
                type="species_region",
                evidence="species",
                explanation=f"{submission.species} is not in the table for region {submission.region}",
            ),
            Decimal("1"),
        )
    ]


def _document(submission: Submission) -> list[tuple[Finding, Decimal]]:
    text = submission.document_text or ""
    if not text.strip():
        return []
    fields = submission.form_fields or {}
    comparable = [
        value.strip()
        for name in DOCUMENT_FIELDS
        if (value := str(fields.get(name) or "")).strip() and len(value.strip()) >= 3
    ]
    folded = text.casefold()
    if not comparable:
        return [
            (
                Finding(
                    type="document_unmatched",
                    evidence="document_text",
                    explanation="The document has no declared form field to match",
                ),
                Decimal("1"),
            )
        ]
    missing = [value for value in comparable if value.casefold() not in folded]
    if not missing:
        return []
    return [
        (
            Finding(
                type="document_mismatch",
                evidence="document_text",
                explanation="The document does not contain declared field " + ", ".join(missing),
            ),
            Decimal("1"),
        )
    ]


def _output(findings: list[tuple[Finding, Decimal]]) -> AgentOutput:
    if not findings:
        return AgentOutput(
            agent="c0",
            version=RULES_VERSION,
            score=0,
            decision="pass",
            findings=[],
            confidence=1,
        )
    weight = max(item[1] for item in findings)
    decision = "flag" if weight >= Decimal("0.7") else "review"
    return AgentOutput(
        agent="c0",
        version=RULES_VERSION,
        score=float(min(weight, Decimal("1"))),
        decision=decision,  # type: ignore[arg-type]
        findings=[item[0] for item in findings],
        confidence=1,
    )


def _decimal(value: str | None) -> Decimal | None:
    if value is None or value == "":
        return None
    try:
        return Decimal(value)
    except InvalidOperation:
        return None


def _metres(lat1: str, lon1: str, lat2: str, lon2: str) -> float | None:
    import math

    first = (_decimal(lat1), _decimal(lon1), _decimal(lat2), _decimal(lon2))
    if any(item is None for item in first):
        return None
    a_lat, a_lon, b_lat, b_lon = (float(item) for item in first if item is not None)
    radius = 6371000
    phi1, phi2 = math.radians(a_lat), math.radians(b_lat)
    d_phi = math.radians(b_lat - a_lat)
    d_lambda = math.radians(b_lon - a_lon)
    haversine = math.sin(d_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    return 2 * radius * math.asin(min(1, math.sqrt(haversine)))
