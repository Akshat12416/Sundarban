"""SQLite analysis cache for bench runs.

The verifier service stores the same key in Firestore. Bench runs stay on a
local file so one submission's registry is not shared process state.
"""

from __future__ import annotations

import sys
from pathlib import Path

_VERIFIER = Path(__file__).resolve().parents[1] / "services" / "verifier"
if str(_VERIFIER) not in sys.path:
    sys.path.insert(0, str(_VERIFIER))

from app.cache import AnalysisCache, SqliteCache, cache_key

__all__ = ["AnalysisCache", "SqliteCache", "cache_key"]
