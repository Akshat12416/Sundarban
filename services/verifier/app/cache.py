"""Content-addressed analysis cache.

Key = sha256(evidence) + agent id + prompt version + model id.
The service stores rows in Firestore. Bench runs use SQLite.
"""

from __future__ import annotations

import json
import sqlite3
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Protocol


def cache_key(evidence_sha256: str, agent_id: str, prompt_version: str, model_id: str) -> str:
    return evidence_sha256 + agent_id + prompt_version + model_id


@dataclass(frozen=True)
class CacheHit:
    value: Any


class CacheStore(Protocol):
    def get(self, key: str) -> CacheHit | None: ...

    def put(self, key: str, value: Any) -> None: ...


class MemoryCache:
    def __init__(self) -> None:
        self.rows: dict[str, Any] = {}

    def get(self, key: str) -> CacheHit | None:
        if key not in self.rows:
            return None
        return CacheHit(self.rows[key])

    def put(self, key: str, value: Any) -> None:
        self.rows[key] = value


class SqliteCache:
    def __init__(self, path: Path) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        self._conn = sqlite3.connect(path)
        self._conn.execute(
            "create table if not exists analysis_cache ("
            "cache_key text primary key, payload text not null)"
        )
        self._conn.commit()

    def get(self, key: str) -> CacheHit | None:
        row = self._conn.execute(
            "select payload from analysis_cache where cache_key = ?",
            (key,),
        ).fetchone()
        if row is None:
            return None
        return CacheHit(json.loads(row[0]))

    def put(self, key: str, value: Any) -> None:
        self._conn.execute(
            "insert or replace into analysis_cache (cache_key, payload) values (?, ?)",
            (key, json.dumps(value, sort_keys=True, separators=(",", ":"))),
        )
        self._conn.commit()

    def close(self) -> None:
        self._conn.close()


class FirestoreCache:
    def __init__(self, client: Any, collection: str = "analysisCache") -> None:
        self._collection = client.collection(collection)

    def get(self, key: str) -> CacheHit | None:
        snapshot = self._collection.document(_doc_id(key)).get()
        if not snapshot.exists:
            return None
        data = snapshot.to_dict() or {}
        if data.get("cacheKey") != key:
            return None
        return CacheHit(data.get("payload"))

    def put(self, key: str, value: Any) -> None:
        self._collection.document(_doc_id(key)).set({"cacheKey": key, "payload": value})


class AnalysisCache:
    def __init__(self, store: CacheStore) -> None:
        self.store = store
        self.hits = 0
        self.misses = 0

    def counters(self) -> dict[str, int]:
        return {"hits": self.hits, "misses": self.misses}

    def analyse(
        self,
        evidence_sha256: str,
        agent_id: str,
        prompt_version: str,
        model_id: str,
        call_model: Any,
    ) -> Any:
        key = cache_key(evidence_sha256, agent_id, prompt_version, model_id)
        found = self.store.get(key)
        if found is not None:
            self.hits += 1
            return found.value
        self.misses += 1
        value = call_model()
        self.store.put(key, value)
        return value


def _doc_id(key: str) -> str:
    import hashlib

    return hashlib.sha256(key.encode("utf-8")).hexdigest()
