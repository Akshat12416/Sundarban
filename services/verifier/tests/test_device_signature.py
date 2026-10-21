"""The phone signs SHA-256(image) || SHA-256(canonical metadata) with ECDSA-SHA256 DER."""

import hashlib

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec

from app.evidence import _signature_ok
from cv_crypto.hashing import leaf_hash, metadata_hash


def test_python_verifies_the_app_signature_format() -> None:
    metadata = {
        "accuracy": "4.0",
        "capturedAt": "2026-10-21T03:00:00.000Z",
        "deviceId": "cv_device_key",
        "latitude": "22.500001",
        "longitude": "88.300001",
        "mockLocation": False,
        "nonce": "nonce-1",
        "projectId": "project-1",
    }
    image = b"captured-jpeg"
    image_hash = hashlib.sha256(image).digest()
    private = ec.generate_private_key(ec.SECP256R1())
    signature = private.sign(image_hash + metadata_hash(metadata), ec.ECDSA(hashes.SHA256()))
    public = private.public_key().public_bytes(
        serialization.Encoding.PEM,
        serialization.PublicFormat.SubjectPublicKeyInfo,
    ).decode("utf-8")
    assert _signature_ok(public, image_hash, metadata, signature)
    assert not _signature_ok(public, hashlib.sha256(b"edited-jpeg").digest(), metadata, signature)
    assert len(leaf_hash(image_hash, metadata, signature)) == 32
