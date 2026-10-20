from app.cache import AnalysisCache, FirestoreCache, MemoryCache, SqliteCache, cache_key


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


class _Collection:
    def __init__(self) -> None:
        self.rows: dict[str, dict] = {}

    def document(self, key: str) -> _Doc:
        return _Doc(self.rows, key)


class _Client:
    def __init__(self) -> None:
        self.collections: dict[str, _Collection] = {}

    def collection(self, name: str) -> _Collection:
        return self.collections.setdefault(name, _Collection())


def test_cache_key_is_the_concatenation_from_agents() -> None:
    assert cache_key("sha", "agent", "prompt-v1", "model") == "shaagentprompt-v1model"


def test_second_analysis_makes_no_model_call(tmp_path) -> None:
    for store in (MemoryCache(), SqliteCache(tmp_path / "cache.sqlite")):
        cache = AnalysisCache(store)
        calls = {"n": 0}

        def call_model() -> dict[str, str]:
            calls["n"] += 1
            return {"decision": "pass"}

        first = cache.analyse("sha", "agent", "v1", "model", call_model)
        second = cache.analyse("sha", "agent", "v1", "model", call_model)
        assert first == second == {"decision": "pass"}
        assert calls["n"] == 1
        assert cache.counters() == {"hits": 1, "misses": 1}
        cache.analyse("sha", "agent", "v2", "model", call_model)
        assert calls["n"] == 2
        assert cache.counters()["misses"] == 2


def test_firestore_cache_round_trip() -> None:
    cache = AnalysisCache(FirestoreCache(_Client()))
    calls = {"n": 0}

    def call_model() -> dict[str, int]:
        calls["n"] += 1
        return {"n": 1}

    cache.analyse("sha", "agent", "v1", "model", call_model)
    cache.analyse("sha", "agent", "v1", "model", call_model)
    assert calls["n"] == 1
    assert cache.hits == 1
