"""Evidence object storage. Credentials stay in this process."""

from __future__ import annotations

import re
import time
from pathlib import Path

import httpx

_ID = re.compile(r"[A-Za-z0-9_-]+")
_EXT = re.compile(r"[A-Za-z0-9]+")


class StorageError(RuntimeError):
    def __init__(self, status_code: int, action: str) -> None:
        super().__init__(f"storage {action} failed with status {status_code}")
        self.status_code = status_code


def object_path(project_id: str, evidence_id: str, ext: str) -> str:
    suffix = ext.lower().lstrip(".")
    if not _ID.fullmatch(project_id) or not _ID.fullmatch(evidence_id) or not _EXT.fullmatch(suffix):
        raise ValueError("project id, evidence id, and extension must be plain tokens")
    return f"projects/{project_id}/{evidence_id}.{suffix}"


class DiskStorage:
    def __init__(self, root: Path) -> None:
        self.root = root

    def upload(self, path: str, data: bytes, content_type: str) -> None:
        del content_type
        target = self._resolve(path)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)

    def signed_url(self, path: str, ttl_seconds: int) -> str:
        target = self._resolve(path)
        if not target.is_file():
            raise FileNotFoundError(path)
        expires = int(time.time()) + ttl_seconds
        return f"file://{target}?expires={expires}"

    def delete(self, path: str) -> None:
        target = self._resolve(path)
        if target.is_file():
            target.unlink()

    def _resolve(self, path: str) -> Path:
        if path.startswith("/") or ".." in path.split("/"):
            raise ValueError("storage path must stay inside the evidence root")
        target = (self.root / path).resolve()
        if not target.is_relative_to(self.root.resolve()):
            raise ValueError("storage path must stay inside the evidence root")
        return target


class SupabaseStorage:
    """Supabase Storage via plain HTTP. No Supabase client library."""

    def __init__(
        self,
        url: str,
        secret_key: str,
        bucket: str,
        client: httpx.Client | None = None,
    ) -> None:
        if not url or not secret_key or not bucket:
            raise ValueError("SUPABASE_URL, SUPABASE_SECRET_KEY, and SUPABASE_STORAGE_BUCKET are required")
        self._url = url.rstrip("/")
        self._secret_key = secret_key
        self._bucket = bucket
        self._client = client or httpx.Client(timeout=30.0)
        self._owns_client = client is None

    def close(self) -> None:
        if self._owns_client:
            self._client.close()

    def upload(self, path: str, data: bytes, content_type: str) -> None:
        response = self._client.post(
            f"{self._url}/storage/v1/object/{self._bucket}/{path}",
            content=data,
            headers={
                **self._auth_headers(),
                "Content-Type": content_type,
                "x-upsert": "true",
            },
        )
        if response.status_code >= 400:
            raise StorageError(response.status_code, "upload")

    def signed_url(self, path: str, ttl_seconds: int) -> str:
        response = self._client.post(
            f"{self._url}/storage/v1/object/sign/{self._bucket}/{path}",
            json={"expiresIn": ttl_seconds},
            headers={**self._auth_headers(), "Content-Type": "application/json"},
        )
        if response.status_code >= 400:
            raise StorageError(response.status_code, "sign")
        body = response.json()
        signed = body.get("signedURL") or body.get("signedUrl")
        if not isinstance(signed, str) or not signed:
            raise StorageError(response.status_code, "sign")
        if signed.startswith("http://") or signed.startswith("https://"):
            return signed
        prefix = signed if signed.startswith("/") else f"/{signed}"
        return f"{self._url}/storage/v1{prefix}"

    def delete(self, path: str) -> None:
        response = self._client.delete(
            f"{self._url}/storage/v1/object/{self._bucket}/{path}",
            headers=self._auth_headers(),
        )
        if response.status_code >= 400:
            raise StorageError(response.status_code, "delete")

    def _auth_headers(self) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {self._secret_key}",
            "apikey": self._secret_key,
        }
