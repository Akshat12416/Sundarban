"""Load the real-photo catalogue and the pre-made A4 log."""

import csv
from pathlib import Path


def repo_root() -> Path:
    return Path(__file__).resolve().parents[1]


def load_sources(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8") as handle:
        rows = list(csv.DictReader(handle))
    required = ["filename", "source_url", "author", "licence", "accessed_on", "notes"]
    if rows and any(name not in rows[0] for name in required):
        missing = [name for name in required if name not in rows[0]]
        raise ValueError(f"sources.csv missing columns: {missing}")
    return rows


def load_ai_log(path: Path) -> list[dict[str, str]]:
    if not path.is_file():
        return []
    with path.open(newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def a4_directory(root: Path) -> Path:
    """Prefer the name in the task, then the directory that is actually on disk."""
    preferred = root / "bench" / "data" / "attacks_raw" / "a4"
    actual = root / "bench" / "data" / "attack_raw" / "a4"
    if preferred.is_dir():
        return preferred
    return actual
