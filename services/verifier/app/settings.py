from functools import lru_cache
from pathlib import Path

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_ALLOWED_BACKENDS = frozenset({"disk", "supabase"})
_REPO_ROOT = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )

    firebase_project_id: str = "sundarban-a64ea"
    google_application_credentials: str | None = None
    storage_backend: str = "disk"
    supabase_url: str | None = None
    supabase_secret_key: str | None = None
    supabase_storage_bucket: str = "evidence"
    disk_storage_dir: str = "services/verifier/data"
    signed_url_ttl_seconds: int = 120
    phash_hamming_threshold: int = 8
    nonce_ttl_seconds: int = 600
    firestore_emulator_host: str | None = Field(default=None)
    firebase_auth_emulator_host: str | None = Field(default=None)

    @field_validator("storage_backend")
    @classmethod
    def storage_backend_is_known(cls, value: str) -> str:
        backend = value.strip().lower()
        if backend not in _ALLOWED_BACKENDS:
            raise ValueError(
                "STORAGE_BACKEND must be 'disk' or 'supabase'. "
                "Firebase Storage is not used."
            )
        return backend


@lru_cache
def get_settings() -> Settings:
    return Settings()


def resolve_credentials(path: str) -> Path:
    """Find the service account file from the repo root or the process cwd."""
    candidate = Path(path)
    if candidate.is_file():
        return candidate
    rooted = _REPO_ROOT / candidate
    if rooted.is_file():
        return rooted
    return candidate
