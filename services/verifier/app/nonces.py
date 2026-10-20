"""Single-use project nonces with an expiry."""

from __future__ import annotations

import secrets
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any, Protocol


class NonceError(ValueError):
    pass


@dataclass
class NonceRecord:
    nonce: str
    project_id: str
    uid: str
    expires_at: str
    used: bool


class NonceStore(Protocol):
    def put(self, record: NonceRecord) -> None: ...

    def get(self, nonce: str) -> NonceRecord | None: ...

    def mark_used(self, nonce: str) -> None: ...


class InMemoryNonceStore:
    def __init__(self) -> None:
        self.rows: dict[str, NonceRecord] = {}

    def put(self, record: NonceRecord) -> None:
        self.rows[record.nonce] = record

    def get(self, nonce: str) -> NonceRecord | None:
        return self.rows.get(nonce)

    def mark_used(self, nonce: str) -> None:
        record = self.rows[nonce]
        self.rows[nonce] = NonceRecord(
            record.nonce, record.project_id, record.uid, record.expires_at, True
        )


class FirestoreNonceStore:
    def __init__(self, client: Any) -> None:
        self._collection = client.collection("nonces")

    def put(self, record: NonceRecord) -> None:
        self._collection.document(record.nonce).set(_as_dict(record))

    def get(self, nonce: str) -> NonceRecord | None:
        snapshot = self._collection.document(nonce).get()
        if not snapshot.exists:
            return None
        return _from_dict(nonce, snapshot.to_dict() or {})

    def mark_used(self, nonce: str) -> None:
        self._collection.document(nonce).update({"used": True})


class NonceService:
    def __init__(self, store: NonceStore, ttl_seconds: int) -> None:
        self.store = store
        self.ttl_seconds = ttl_seconds

    def issue(self, project_id: str, uid: str, now: datetime | None = None) -> NonceRecord:
        moment = now or datetime.now(timezone.utc)
        expires = moment + timedelta(seconds=self.ttl_seconds)
        record = NonceRecord(
            nonce=secrets.token_hex(16),
            project_id=project_id,
            uid=uid,
            expires_at=_stamp(expires),
            used=False,
        )
        self.store.put(record)
        return record

    def assert_usable(self, nonce: str, project_id: str, uid: str, now: datetime | None = None) -> None:
        self._check(nonce, project_id, uid, now)

    def consume(self, nonce: str, project_id: str, uid: str, now: datetime | None = None) -> None:
        self._check(nonce, project_id, uid, now)
        self.store.mark_used(nonce)

    def _check(self, nonce: str, project_id: str, uid: str, now: datetime | None) -> None:
        record = self.store.get(nonce)
        moment = now or datetime.now(timezone.utc)
        if record is None:
            raise NonceError("nonce not found")
        if record.used:
            raise NonceError("nonce already used")
        if record.project_id != project_id or record.uid != uid:
            raise NonceError("nonce does not belong to this project")
        if _parse(record.expires_at) <= moment:
            raise NonceError("nonce expired")


def _stamp(moment: datetime) -> str:
    return moment.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _parse(value: str) -> datetime:
    return datetime.strptime(value, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)


def _as_dict(record: NonceRecord) -> dict[str, object]:
    return {
        "projectId": record.project_id,
        "uid": record.uid,
        "expiresAt": record.expires_at,
        "used": record.used,
    }


def _from_dict(nonce: str, data: dict[str, Any]) -> NonceRecord:
    return NonceRecord(
        nonce=nonce,
        project_id=str(data["projectId"]),
        uid=str(data["uid"]),
        expires_at=str(data["expiresAt"]),
        used=bool(data["used"]),
    )
