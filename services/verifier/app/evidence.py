"""Accept one evidence item: verify, store the original, keep hashes in Firestore."""

from __future__ import annotations

import re
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Protocol

from cryptography.exceptions import InvalidSignature
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec

from app.images import prepare_image
from app.nonces import NonceError, NonceService
from app.storage import object_path
from cv_crypto.hashing import leaf_hash, metadata_hash

_LATITUDE = re.compile(r"^-?\d+\.\d{6}$")
_ACCURACY = re.compile(r"^\d+\.\d$")
_KINDS = frozenset({"before", "after", "document"})
_IMAGE_TYPES = frozenset({"image/jpeg", "image/jpg", "image/png", "image/webp"})


class EvidenceError(ValueError):
    pass


class ProjectStore(Protocol):
    def get(self, project_id: str) -> dict[str, Any] | None: ...


class DeviceStore(Protocol):
    def get(self, device_id: str) -> dict[str, Any] | None: ...

    def put(self, device_id: str, record: dict[str, Any]) -> None: ...


class EvidenceStore(Protocol):
    def put(self, project_id: str, evidence_id: str, record: dict[str, Any]) -> None: ...

    def get_index(self, evidence_id: str) -> dict[str, Any] | None: ...


class ObjectStore(Protocol):
    def upload(self, path: str, data: bytes, content_type: str) -> None: ...

    def signed_url(self, path: str, ttl_seconds: int) -> str: ...

    def delete(self, path: str) -> None: ...


class InMemoryProjectStore:
    def __init__(self) -> None:
        self.rows: dict[str, dict[str, Any]] = {}

    def get(self, project_id: str) -> dict[str, Any] | None:
        return self.rows.get(project_id)


class InMemoryDeviceStore:
    def __init__(self) -> None:
        self.rows: dict[str, dict[str, Any]] = {}

    def get(self, device_id: str) -> dict[str, Any] | None:
        return self.rows.get(device_id)

    def put(self, device_id: str, record: dict[str, Any]) -> None:
        self.rows[device_id] = record


class InMemoryEvidenceStore:
    def __init__(self) -> None:
        self.rows: dict[tuple[str, str], dict[str, Any]] = {}
        self.index: dict[str, dict[str, Any]] = {}

    def put(self, project_id: str, evidence_id: str, record: dict[str, Any]) -> None:
        self.rows[(project_id, evidence_id)] = record
        self.index[evidence_id] = record

    def get_index(self, evidence_id: str) -> dict[str, Any] | None:
        return self.index.get(evidence_id)


class FirestoreProjectStore:
    def __init__(self, client: Any) -> None:
        self._client = client

    def get(self, project_id: str) -> dict[str, Any] | None:
        snapshot = self._client.collection("projects").document(project_id).get()
        if not snapshot.exists:
            return None
        return snapshot.to_dict() or {}


class FirestoreDeviceStore:
    def __init__(self, client: Any) -> None:
        self._client = client

    def get(self, device_id: str) -> dict[str, Any] | None:
        snapshot = self._client.collection("devices").document(device_id).get()
        if not snapshot.exists:
            return None
        return snapshot.to_dict() or {}

    def put(self, device_id: str, record: dict[str, Any]) -> None:
        self._client.collection("devices").document(device_id).set(record)


class FirestoreEvidenceStore:
    def __init__(self, client: Any) -> None:
        self._client = client

    def put(self, project_id: str, evidence_id: str, record: dict[str, Any]) -> None:
        (
            self._client.collection("projects")
            .document(project_id)
            .collection("evidence")
            .document(evidence_id)
            .set(record)
        )
        self._client.collection("evidenceIndex").document(evidence_id).set(
            {"projectId": project_id, "storagePath": record["storagePath"]}
        )

    def get_index(self, evidence_id: str) -> dict[str, Any] | None:
        snapshot = self._client.collection("evidenceIndex").document(evidence_id).get()
        if not snapshot.exists:
            return None
        data = snapshot.to_dict() or {}
        project_id = data.get("projectId")
        if not isinstance(project_id, str):
            return None
        item = (
            self._client.collection("projects")
            .document(project_id)
            .collection("evidence")
            .document(evidence_id)
            .get()
        )
        if not item.exists:
            return None
        return item.to_dict() or {}


@dataclass(frozen=True)
class AcceptedEvidence:
    evidence_id: str
    storage_path: str
    sha256: str
    phash: str | None
    leaf: str


def enrol_device(
    devices: DeviceStore,
    uid: str,
    device_id: str,
    public_key_pem: str,
    security_level: str,
) -> None:
    _require_p256(public_key_pem)
    if not device_id or "/" in device_id:
        raise EvidenceError("device id is invalid")
    devices.put(
        device_id,
        {
            "uid": uid,
            "publicKey": public_key_pem,
            "securityLevel": security_level,
            "enrolledAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        },
    )


def accept_evidence(
    *,
    projects: ProjectStore,
    devices: DeviceStore,
    evidence: EvidenceStore,
    storage: ObjectStore,
    nonces: NonceService,
    project_id: str,
    uid: str,
    kind: str,
    original: bytes,
    content_type: str,
    filename: str,
    metadata: dict[str, Any],
    signature: bytes,
) -> AcceptedEvidence:
    if kind not in _KINDS:
        raise EvidenceError("kind must be before, after, or document")
    project = projects.get(project_id)
    if project is None:
        raise EvidenceError("project not found")
    if project.get("ownerUid") != uid:
        raise EvidenceError("project not found")
    _validate_metadata(metadata, project_id)
    try:
        nonces.consume(str(metadata["nonce"]), project_id, uid)
    except NonceError as exc:
        raise EvidenceError(str(exc)) from exc
    device = devices.get(str(metadata["deviceId"]))
    if device is None or device.get("uid") != uid:
        raise EvidenceError("device is not enrolled for this user")
    public_key = device.get("publicKey")
    if not isinstance(public_key, str):
        raise EvidenceError("device is not enrolled for this user")

    phash: str | None = None
    if kind in {"before", "after"}:
        if content_type not in _IMAGE_TYPES:
            raise EvidenceError("before and after evidence must be an image")
        prepared = prepare_image(original, content_type)
        image_sha = bytes.fromhex(prepared.sha256)
        phash = prepared.phash
    else:
        import hashlib

        image_sha = hashlib.sha256(original).digest()

    if not _signature_ok(public_key, image_sha, metadata, signature):
        raise EvidenceError("signature rejected")

    evidence_id = uuid.uuid4().hex
    ext = _extension(filename, content_type)
    path = object_path(project_id, evidence_id, ext)
    storage.upload(path, original, content_type or "application/octet-stream")
    leaf = leaf_hash(image_sha, metadata, signature).hex()
    record = {
        "kind": kind,
        "storagePath": path,
        "sha256": image_sha.hex(),
        "phash": phash,
        "metadata": metadata,
        "signature": signature.hex(),
        "attested": True,
        "leaf": leaf,
    }
    evidence.put(project_id, evidence_id, record)
    return AcceptedEvidence(evidence_id, path, image_sha.hex(), phash, leaf)


def _validate_metadata(metadata: dict[str, Any], project_id: str) -> None:
    required = ("latitude", "longitude", "accuracy", "capturedAt", "deviceId", "projectId", "nonce")
    missing = [name for name in required if name not in metadata]
    if missing:
        raise EvidenceError("metadata missing " + ", ".join(missing))
    for name in ("latitude", "longitude"):
        value = metadata[name]
        if not isinstance(value, str) or not _LATITUDE.fullmatch(value):
            raise EvidenceError(f"{name} must be a 6-decimal string")
    accuracy = metadata["accuracy"]
    if not isinstance(accuracy, str) or not _ACCURACY.fullmatch(accuracy):
        raise EvidenceError("accuracy must be a one-decimal string")
    if metadata["projectId"] != project_id:
        raise EvidenceError("metadata project does not match the path")
    for name in ("capturedAt", "deviceId", "nonce"):
        if not isinstance(metadata[name], str) or not metadata[name]:
            raise EvidenceError(f"{name} must be a string")


def _signature_ok(public_key_pem: str, image_sha256: bytes, metadata: dict[str, Any], signature: bytes) -> bool:
    try:
        key = serialization.load_pem_public_key(public_key_pem.encode("utf-8"))
        key.verify(signature, image_sha256 + metadata_hash(metadata), ec.ECDSA(hashes.SHA256()))
    except (InvalidSignature, ValueError):
        return False
    return True


def _require_p256(public_key_pem: str) -> None:
    try:
        key = serialization.load_pem_public_key(public_key_pem.encode("utf-8"))
    except ValueError as exc:
        raise EvidenceError("public key must be PEM") from exc
    if not isinstance(key, ec.EllipticCurvePublicKey) or not isinstance(key.curve, ec.SECP256R1):
        raise EvidenceError("public key must be P-256")


def _extension(filename: str, content_type: str) -> str:
    if "." in filename:
        suffix = filename.rsplit(".", 1)[-1].lower()
        if suffix.isalnum():
            return "jpg" if suffix == "jpeg" else suffix
    if content_type in {"image/jpeg", "image/jpg"}:
        return "jpg"
    if content_type == "image/png":
        return "png"
    if content_type == "image/webp":
        return "webp"
    return "bin"
