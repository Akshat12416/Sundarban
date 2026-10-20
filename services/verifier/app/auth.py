"""Firebase ID token dependency. The role comes from the custom claim."""

from __future__ import annotations

from dataclasses import dataclass

from fastapi import Depends, Header, HTTPException


@dataclass(frozen=True)
class Principal:
    uid: str
    role: str | None


def verify_id_token(token: str) -> dict:
    from firebase_admin import auth

    return auth.verify_id_token(token)


def get_current_user(authorization: str | None = Header(default=None)) -> Principal:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="bearer token required")
    token = authorization.removeprefix("Bearer ").strip()
    if not token:
        raise HTTPException(status_code=401, detail="bearer token required")
    try:
        decoded = verify_id_token(token)
    except Exception as exc:
        raise HTTPException(status_code=401, detail="invalid token") from exc
    uid = decoded.get("uid") or decoded.get("user_id")
    if not isinstance(uid, str) or not uid:
        raise HTTPException(status_code=401, detail="invalid token")
    role = decoded.get("role")
    return Principal(uid=uid, role=role if isinstance(role, str) else None)


def require_admin(user: Principal = Depends(get_current_user)) -> Principal:
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="admin role required")
    return user
