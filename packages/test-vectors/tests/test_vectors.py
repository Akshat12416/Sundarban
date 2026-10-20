import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from reference import (  # noqa: E402
    canonical_json,
    leaf_hash,
    merkle_root,
    metadata_hash,
)

VECTORS = ROOT / "vectors.json"


def _load() -> dict:
    return json.loads(VECTORS.read_text(encoding="utf-8"))


def test_each_group_has_at_least_ten_cases() -> None:
    data = _load()
    for name in ("canonicalJson", "metadataHash", "leafHash", "merkleRoot"):
        assert len(data[name]) >= 10


def test_canonical_json_matches_reference() -> None:
    for case in _load()["canonicalJson"]:
        assert canonical_json(case["value"]) == case["canonical"]
        assert ": " not in case["canonical"]
        assert ", " not in case["canonical"]


def test_metadata_hash_matches_reference() -> None:
    for case in _load()["metadataHash"]:
        assert metadata_hash(case["metadata"]).hex() == case["sha256"]
        assert len(case["sha256"]) == 64


def test_leaf_hash_matches_reference() -> None:
    for case in _load()["leafHash"]:
        leaf = leaf_hash(
            bytes.fromhex(case["imageSha256"]),
            case["metadata"],
            bytes.fromhex(case["signature"]),
        )
        assert leaf.hex() == case["leaf"]


def test_merkle_roots_cover_odd_and_even_counts() -> None:
    cases = _load()["merkleRoot"]
    counts = {case["leafCount"] for case in cases}
    assert any(count % 2 == 1 for count in counts)
    assert any(count % 2 == 0 for count in counts)
    for case in cases:
        leaves = [bytes.fromhex(item) for item in case["leaves"]]
        assert len(leaves) == case["leafCount"]
        assert merkle_root(leaves).hex() == case["root"]


def test_single_leaf_root_is_the_leaf() -> None:
    case = next(item for item in _load()["merkleRoot"] if item["leafCount"] == 1)
    assert case["root"] == case["leaves"][0]


def test_floats_are_rejected() -> None:
    try:
        canonical_json({"latitude": 22.5})
    except TypeError:
        return
    raise AssertionError("float should be rejected")
