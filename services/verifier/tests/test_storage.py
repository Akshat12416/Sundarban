import io
import os

import httpx
from PIL import Image

from app.images import LONG_EDGE, prepare_image
from app.storage import DiskStorage, SupabaseStorage, object_path


def _jpeg(width: int, height: int, make: str | None = None) -> bytes:
    image = Image.frombytes("RGB", (width, height), os.urandom(width * height * 3))
    buffer = io.BytesIO()
    if make is None:
        image.save(buffer, format="JPEG", quality=95)
    else:
        exif = Image.Exif()
        exif[271] = make
        image.save(buffer, format="JPEG", quality=95, exif=exif)
    return buffer.getvalue()


def test_prepare_reads_exif_before_normalising_and_hashes_the_original() -> None:
    original = _jpeg(2000, 1000, make="SundarbanCam")
    prepared = prepare_image(original, "image/jpeg")
    assert prepared.sha256 == __import__("hashlib").sha256(original).hexdigest()
    assert prepared.exif["Make"] == "SundarbanCam"
    assert len(prepared.phash) == 16
    normalized = Image.open(io.BytesIO(prepared.normalized_jpeg))
    assert max(normalized.size) == LONG_EDGE
    assert prepare_image(original, "image/jpeg").phash == prepared.phash


def test_disk_storage_round_trip(tmp_path) -> None:
    storage = DiskStorage(tmp_path)
    path = object_path("project1", "evidence1", "jpg")
    storage.upload(path, b"original-bytes", "image/jpeg")
    assert (tmp_path / path).read_bytes() == b"original-bytes"
    url = storage.signed_url(path, 120)
    assert url.startswith("file://")
    assert "expires=" in url
    storage.delete(path)
    assert not (tmp_path / path).is_file()


def test_supabase_storage_uses_http_and_keeps_the_secret_out_of_the_url() -> None:
    secret = "supabase-secret-for-test"
    seen: list[httpx.Request] = []

    def handler(request: httpx.Request) -> httpx.Response:
        seen.append(request)
        if request.url.path.endswith("/object/sign/evidence/projects/project1/evidence1.jpg"):
            return httpx.Response(
                200,
                json={"signedURL": "/object/sign/evidence/projects/project1/evidence1.jpg?token=short"},
            )
        return httpx.Response(200, json={"ok": True})

    client = httpx.Client(transport=httpx.MockTransport(handler))
    storage = SupabaseStorage("https://example.supabase.co", secret, "evidence", client=client)
    path = object_path("project1", "evidence1", "JPG")
    storage.upload(path, b"original-bytes", "image/jpeg")
    url = storage.signed_url(path, 120)
    storage.delete(path)
    assert url == (
        "https://example.supabase.co/storage/v1/object/sign/"
        "evidence/projects/project1/evidence1.jpg?token=short"
    )
    assert secret not in url
    assert [request.method for request in seen] == ["POST", "POST", "DELETE"]
    assert seen[0].url.path == "/storage/v1/object/evidence/projects/project1/evidence1.jpg"
    assert seen[0].headers["authorization"] == f"Bearer {secret}"
    assert seen[0].headers["apikey"] == secret
    assert b"original-bytes" == seen[0].content
    assert json_expires(seen[1]) == 120


def json_expires(request: httpx.Request) -> int:
    import json

    return json.loads(request.content)["expiresIn"]
