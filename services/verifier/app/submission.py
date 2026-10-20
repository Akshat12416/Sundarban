"""One submission handed to every verifier. Ground truth is not included."""

from __future__ import annotations

import hashlib
from dataclasses import dataclass

from cv_crypto.hashing import canonical_json


@dataclass(frozen=True)
class PreparedPhoto:
    filename: str
    role: str
    sha256: str
    phash: str
    exif: dict[str, str]
    normalized_jpeg: bytes
    gps_latitude: str | None
    gps_longitude: str | None


@dataclass(frozen=True)
class RegistryRecord:
    item_id: str
    sha256: str
    phash: str
    parcel_latitude: str | None = None
    parcel_longitude: str | None = None


@dataclass(frozen=True)
class Submission:
    submission_id: str
    photos: list[PreparedPhoto]
    registry: list[RegistryRecord]
    parcel_latitude: str | None = None
    parcel_longitude: str | None = None
    location_claim: str | None = None
    tree_count: str | None = None
    area_ha: str | None = None
    species: str | None = None
    region: str | None = None
    document_text: str | None = None
    form_fields: dict[str, str] | None = None

    def evidence_sha256(self) -> str:
        payload = {
            "area_ha": self.area_ha,
            "document_text": self.document_text,
            "form_fields": self.form_fields or {},
            "id": self.submission_id,
            "location_claim": self.location_claim,
            "parcel_latitude": self.parcel_latitude,
            "parcel_longitude": self.parcel_longitude,
            "photos": [
                {"filename": photo.filename, "role": photo.role, "sha256": photo.sha256}
                for photo in self.photos
            ],
            "region": self.region,
            "registry": [
                {
                    "item_id": item.item_id,
                    "parcel_latitude": item.parcel_latitude,
                    "parcel_longitude": item.parcel_longitude,
                    "phash": item.phash,
                    "sha256": item.sha256,
                }
                for item in self.registry
            ],
            "species": self.species,
            "tree_count": self.tree_count,
        }
        return hashlib.sha256(canonical_json(payload).encode("utf-8")).hexdigest()
