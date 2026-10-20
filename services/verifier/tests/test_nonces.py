from datetime import datetime, timedelta, timezone

import pytest

from app.nonces import FirestoreNonceStore, InMemoryNonceStore, NonceError, NonceRecord, NonceService


class _Snap:
    def __init__(self, data: dict | None) -> None:
        self._data = data
        self.exists = data is not None

    def to_dict(self) -> dict | None:
        return self._data


class _Doc:
    def __init__(self, rows: dict, key: str) -> None:
        self.rows = rows
        self.key = key

    def get(self) -> _Snap:
        return _Snap(self.rows.get(self.key))

    def set(self, data: dict) -> None:
        self.rows[self.key] = dict(data)

    def update(self, data: dict) -> None:
        self.rows[self.key].update(data)


class _Client:
    def __init__(self) -> None:
        self.rows: dict[str, dict] = {}

    def collection(self, name: str) -> "_Client":
        assert name == "nonces"
        return self

    def document(self, key: str) -> _Doc:
        return _Doc(self.rows, key)


def test_nonce_is_single_use_and_expires() -> None:
    service = NonceService(InMemoryNonceStore(), ttl_seconds=600)
    issued = service.issue("project1", "user-1")
    service.consume(issued.nonce, "project1", "user-1")
    with pytest.raises(NonceError, match="already used"):
        service.consume(issued.nonce, "project1", "user-1")
    with pytest.raises(NonceError, match="does not belong"):
        service.consume(service.issue("project1", "user-1").nonce, "other", "user-1")
    expired = NonceService(InMemoryNonceStore(), ttl_seconds=0)
    record = expired.issue("project1", "user-1")
    with pytest.raises(NonceError, match="expired"):
        expired.consume(record.nonce, "project1", "user-1")


def test_firestore_nonce_store_round_trip() -> None:
    store = FirestoreNonceStore(_Client())
    record = NonceRecord(
        "abc",
        "project1",
        "user-1",
        (datetime.now(timezone.utc) + timedelta(minutes=5)).strftime("%Y-%m-%dT%H:%M:%SZ"),
        False,
    )
    store.put(record)
    service = NonceService(store, ttl_seconds=600)
    service.consume("abc", "project1", "user-1")
    assert store.get("abc") is not None
    assert store.get("abc").used is True
