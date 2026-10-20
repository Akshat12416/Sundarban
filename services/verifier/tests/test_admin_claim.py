import importlib.util
from pathlib import Path
from types import SimpleNamespace

import pytest

_PATH = Path(__file__).resolve().parents[3] / "scripts" / "set_admin_claim.py"
_SPEC = importlib.util.spec_from_file_location("set_admin_claim", _PATH)
assert _SPEC is not None and _SPEC.loader is not None
claims = importlib.util.module_from_spec(_SPEC)
_SPEC.loader.exec_module(claims)


class _Auth:
    def __init__(self) -> None:
        self.claims: tuple[str, dict] | None = None

    def get_user_by_email(self, email: str) -> SimpleNamespace:
        assert email == "admin@example.com"
        return SimpleNamespace(uid="uid-from-email")

    def get_user(self, uid: str) -> SimpleNamespace:
        return SimpleNamespace(uid=uid)

    def set_custom_user_claims(self, uid: str, claim: dict) -> None:
        self.claims = (uid, claim)


class _Admin:
    def __init__(self) -> None:
        self.auth = _Auth()
        self._apps: dict = {}
        self.initialised: tuple | None = None
        self.credentials = self

    def Certificate(self, path: str) -> dict:
        return {"certificate": path}

    def initialize_app(self, cred=None, options=None) -> None:
        self.initialised = (cred, options)
        self._apps["default"] = True


def test_email_sets_admin_claim_on_the_emulator() -> None:
    admin = _Admin()
    uid = claims.run(
        ["--email", "admin@example.com"],
        {"FIREBASE_AUTH_EMULATOR_HOST": "127.0.0.1:9099", "FIREBASE_PROJECT_ID": "sundarban-a64ea"},
        admin,
    )
    assert uid == "uid-from-email"
    assert admin.initialised == (None, {"projectId": "sundarban-a64ea"})
    assert admin.auth.claims == ("uid-from-email", {"role": "admin"})


def test_uid_uses_the_service_account_outside_the_emulator(tmp_path) -> None:
    key = tmp_path / "firebase-admin.json"
    key.write_text("{}", encoding="utf-8")
    admin = _Admin()
    uid = claims.run(
        ["--uid", "uid-9"],
        {"GOOGLE_APPLICATION_CREDENTIALS": str(key), "FIREBASE_PROJECT_ID": "sundarban-a64ea"},
        admin,
    )
    assert uid == "uid-9"
    assert admin.initialised == ({"certificate": str(key)}, {"projectId": "sundarban-a64ea"})
    assert admin.auth.claims == ("uid-9", {"role": "admin"})


def test_email_and_uid_together_are_rejected() -> None:
    with pytest.raises(SystemExit):
        claims.set_admin_claim(_Auth(), email="a@example.com", uid="uid-9")
