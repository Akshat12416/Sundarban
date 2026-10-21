import io
import json
from pathlib import Path

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec
from fastapi.testclient import TestClient
from PIL import Image

from app.evidence import InMemoryProjectStore
from app.main import app
from app.storage import DiskStorage
from cv_crypto.hashing import metadata_hash


def _jpeg() -> bytes:
    image = Image.new("RGB", (32, 24), (20, 80, 40))
    buffer = io.BytesIO()
    image.save(buffer, format="JPEG")
    return buffer.getvalue()


def _keys() -> tuple[ec.EllipticCurvePrivateKey, str]:
    private = ec.generate_private_key(ec.SECP256R1())
    public = private.public_key().public_bytes(
        serialization.Encoding.PEM,
        serialization.PublicFormat.SubjectPublicKeyInfo,
    ).decode("utf-8")
    return private, public


def _sign(private: ec.EllipticCurvePrivateKey, image: bytes, metadata: dict) -> str:
    import hashlib

    digest = hashlib.sha256(image).digest()
    signature = private.sign(digest + metadata_hash(metadata), ec.ECDSA(hashes.SHA256()))
    return signature.hex()


def test_evidence_flow_and_admin_file_gate(tmp_path, monkeypatch) -> None:
    tokens = {
        "user": {"uid": "user-1", "role": "contributor"},
        "admin": {"uid": "admin-1", "role": "admin"},
        "other": {"uid": "user-2", "role": "contributor"},
    }

    def verify(token: str) -> dict:
        if token not in tokens:
            raise ValueError("bad token")
        return tokens[token]

    monkeypatch.setattr("app.auth.verify_id_token", verify)
    image = _jpeg()
    private, public = _keys()
    with TestClient(app) as client:
        services = app.state.services
        assert isinstance(services.projects, InMemoryProjectStore)
        services.projects.rows["project1"] = {"ownerUid": "user-1", "status": "draft"}
        services.storage = DiskStorage(tmp_path)
        user = {"Authorization": "Bearer user"}
        enrolled = client.post(
            "/v1/devices",
            headers=user,
            json={"deviceId": "device1", "publicKey": public, "securityLevel": "software"},
        )
        assert enrolled.status_code == 200
        issued = client.post("/v1/nonce", headers=user, json={"projectId": "project1"})
        assert issued.status_code == 200
        nonce = issued.json()["nonce"]
        metadata = {
            "latitude": "22.500001",
            "longitude": "88.300001",
            "accuracy": "4.0",
            "capturedAt": "2026-10-21T00:00:00Z",
            "deviceId": "device1",
            "projectId": "project1",
            "nonce": nonce,
        }
        uploaded = client.post(
            "/v1/projects/project1/evidence",
            headers=user,
            data={"metadata": json.dumps(metadata), "signature": _sign(private, image, metadata), "kind": "before"},
            files={"file": ("plot.jpg", image, "image/jpeg")},
        )
        assert uploaded.status_code == 200, uploaded.text
        body = uploaded.json()
        assert body["accepted"] is True
        stored = services.evidence.get_index(body["evidenceId"])
        assert stored is not None
        assert set(stored) == {
            "kind",
            "storagePath",
            "sha256",
            "phash",
            "metadata",
            "signature",
            "attested",
            "leaf",
        }
        assert stored["storagePath"] == f"projects/project1/{body['evidenceId']}.jpg"
        assert Path(tmp_path / stored["storagePath"]).read_bytes() == image
        assert "Make" not in stored
        reused = client.post(
            "/v1/projects/project1/evidence",
            headers=user,
            data={"metadata": json.dumps(metadata), "signature": _sign(private, image, metadata), "kind": "before"},
            files={"file": ("plot.jpg", image, "image/jpeg")},
        )
        assert reused.status_code == 400
        assert "already used" in reused.json()["detail"]
        refused = client.get(f"/v1/files/{body['evidenceId']}", headers=user)
        assert refused.status_code == 403
        missing_role = client.get(
            f"/v1/files/{body['evidenceId']}",
            headers={"Authorization": "Bearer other"},
        )
        assert missing_role.status_code == 403
        opened = client.get(
            f"/v1/files/{body['evidenceId']}",
            headers={"Authorization": "Bearer admin"},
        )
        assert opened.status_code == 200
        assert opened.json()["expiresIn"] == services.signed_url_ttl_seconds
        assert opened.json()["url"].startswith("file://")
        assert services.storage.__dict__.get("_secret_key", "supabase") not in opened.json()["url"]


def test_owner_submit_sets_status(monkeypatch) -> None:
    tokens = {
        "user": {"uid": "user-1", "role": "contributor"},
        "other": {"uid": "user-2", "role": "contributor"},
    }

    def verify(token: str) -> dict:
        if token not in tokens:
            raise ValueError("bad token")
        return tokens[token]

    monkeypatch.setattr("app.auth.verify_id_token", verify)
    with TestClient(app) as client:
        services = app.state.services
        services.projects.rows["plot"] = {
            "ownerUid": "user-1",
            "status": "awaiting_after",
            "species": "mangrove",
        }
        refused = client.post("/v1/projects/plot/submit", headers={"Authorization": "Bearer other"})
        assert refused.status_code == 404
        submitted = client.post("/v1/projects/plot/submit", headers={"Authorization": "Bearer user"})
        assert submitted.status_code == 200
        assert services.projects.rows["plot"]["status"] == "submitted"
        assert services.projects.rows["plot"]["species"] == "mangrove"
        again = client.post("/v1/projects/plot/submit", headers={"Authorization": "Bearer user"})
        assert again.status_code == 200
        services.projects.rows["plot"]["status"] = "approved"
        closed = client.post("/v1/projects/plot/submit", headers={"Authorization": "Bearer user"})
        assert closed.status_code == 400
