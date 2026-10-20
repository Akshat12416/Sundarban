from fastapi.testclient import TestClient

from app.main import app


def test_health_returns_disk_backend() -> None:
    with TestClient(app) as client:
        response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["storageBackend"] == "disk"
    assert body["firebaseProjectId"] == "sundarban-a64ea"
    assert body["firebaseAdmin"] in {"ready", "not_configured"}
