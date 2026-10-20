import os

import httpx
import pytest

from app.settings import get_settings
from app.storage import SupabaseStorage, object_path


@pytest.mark.skipif(os.environ.get("SUPABASE_LIVE_TEST") != "1", reason="set SUPABASE_LIVE_TEST=1")
def test_live_supabase_upload_sign_delete() -> None:
    settings = get_settings()
    storage = SupabaseStorage(
        settings.supabase_url or "",
        settings.supabase_secret_key or "",
        settings.supabase_storage_bucket,
    )
    path = object_path("healthcheck", "phase3live", "txt")
    payload = b"sundarban-live-check"
    storage.upload(path, payload, "text/plain")
    url = storage.signed_url(path, 60)
    assert url.startswith("https://")
    assert settings.supabase_secret_key not in url
    fetched = httpx.get(url, timeout=30.0)
    assert fetched.status_code == 200
    assert fetched.content == payload
    storage.delete(path)
    storage.close()
