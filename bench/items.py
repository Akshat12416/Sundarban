"""Turn manifest rows into verifier submissions.

The duplicate registry for a row is built only from that row's registry_context.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

_VERIFIER = Path(__file__).resolve().parents[1] / "services" / "verifier"
if str(_VERIFIER) not in sys.path:
    sys.path.insert(0, str(_VERIFIER))

from app.images import prepare_image
from app.submission import PreparedPhoto, RegistryRecord, Submission
from bench.catalog import a4_directory, repo_root
from bench.generate import resolve_raw


def load_manifest(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def locate_photo(root: Path, filename: str) -> Path | None:
    for folder in (
        root / "bench" / "data" / "derived",
        a4_directory(root),
        root / "bench" / "data" / "raw",
    ):
        candidate = folder / filename
        if candidate.is_file():
            return candidate
    return resolve_raw(root, filename)


def build_submission(row: dict, by_id: dict[str, dict], root: Path | None = None) -> tuple[Submission | None, str | None]:
    root = root or repo_root()
    photos: list[PreparedPhoto] = []
    for photo in row.get("photos") or []:
        path = locate_photo(root, photo["filename"])
        if path is None:
            return None, f"missing file {photo['filename']}"
        prepared = prepare_image(path.read_bytes(), "image/jpeg")
        photos.append(
            PreparedPhoto(
                filename=photo["filename"],
                role=photo.get("role") or "single",
                sha256=prepared.sha256,
                phash=prepared.phash,
                exif=prepared.exif,
                normalized_jpeg=prepared.normalized_jpeg,
                gps_latitude=prepared.gps_latitude,
                gps_longitude=prepared.gps_longitude,
            )
        )
    registry: list[RegistryRecord] = []
    for cited in row.get("registry_context") or []:
        source = by_id.get(cited)
        if source is None:
            continue
        for photo in source.get("photos") or []:
            path = locate_photo(root, photo["filename"])
            if path is None:
                continue
            prepared = prepare_image(path.read_bytes(), "image/jpeg")
            registry.append(
                RegistryRecord(
                    item_id=cited,
                    sha256=prepared.sha256,
                    phash=prepared.phash,
                    parcel_latitude=source.get("parcel_latitude"),
                    parcel_longitude=source.get("parcel_longitude"),
                )
            )
    form = {
        name: str(row[name])
        for name in ("organisation", "owner_name", "species", "region")
        if row.get(name)
    }
    return (
        Submission(
            submission_id=row["id"],
            photos=photos,
            registry=registry,
            parcel_latitude=row.get("parcel_latitude"),
            parcel_longitude=row.get("parcel_longitude"),
            location_claim=row.get("location_claim"),
            tree_count=row.get("tree_count"),
            area_ha=row.get("area_ha"),
            species=row.get("species"),
            region=row.get("region"),
            document_text=row.get("document_text"),
            form_fields=form,
            attestation=row.get("attestation") or "valid",
        ),
        None,
    )
