"""Sets the admin custom claim. Works against the Auth emulator or the real project."""

from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Set role=admin on one Firebase user.")
    parser.add_argument("--email", help="Account email. Use this or --uid.")
    parser.add_argument("--uid", help="Account uid. Use this or --email.")
    return parser


def set_admin_claim(auth_client: object, *, email: str | None, uid: str | None) -> str:
    if bool(email) == bool(uid):
        raise SystemExit("pass exactly one of --email or --uid")
    if email:
        user = auth_client.get_user_by_email(email)  # type: ignore[attr-defined]
        target = user.uid
    else:
        target = uid or ""
        auth_client.get_user(target)  # type: ignore[attr-defined]
    auth_client.set_custom_user_claims(target, {"role": "admin"})  # type: ignore[attr-defined]
    return target


def initialise(admin_module: object, env: dict[str, str]) -> None:
    apps = getattr(admin_module, "_apps", {})
    if apps:
        return
    project_id = env.get("FIREBASE_PROJECT_ID") or "sundarban-a64ea"
    if env.get("FIREBASE_AUTH_EMULATOR_HOST"):
        admin_module.initialize_app(options={"projectId": project_id})  # type: ignore[attr-defined]
        return
    raw = env.get("GOOGLE_APPLICATION_CREDENTIALS")
    if not raw:
        raise SystemExit("GOOGLE_APPLICATION_CREDENTIALS is not set")
    path = Path(raw)
    if not path.is_file():
        rooted = Path(__file__).resolve().parents[1] / raw
        path = rooted if rooted.is_file() else path
    if not path.is_file():
        raise SystemExit("GOOGLE_APPLICATION_CREDENTIALS does not point at a file")
    certificate = admin_module.credentials.Certificate(str(path))  # type: ignore[attr-defined]
    admin_module.initialize_app(certificate, {"projectId": project_id})  # type: ignore[attr-defined]


def run(argv: list[str], env: dict[str, str], admin_module: object) -> str:
    args = build_parser().parse_args(argv)
    initialise(admin_module, env)
    return set_admin_claim(admin_module.auth, email=args.email, uid=args.uid)  # type: ignore[attr-defined]


def main(argv: list[str] | None = None) -> int:
    import firebase_admin

    _load_env_file()
    uid = run(argv if argv is not None else sys.argv[1:], dict(os.environ), firebase_admin)
    print(f"role=admin set for uid {uid}")
    return 0


def _load_env_file() -> None:
    path = Path(__file__).resolve().parents[1] / "services" / "verifier" / ".env"
    if not path.is_file():
        return
    for line in path.read_text().splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        key, value = stripped.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


if __name__ == "__main__":
    raise SystemExit(main())
