import pytest

from app.duplicates import DuplicateIndex, RegistryItem, hamming_hex


def _item(item_id: str, sha: str, phash: str) -> RegistryItem:
    return RegistryItem(item_id, sha, phash)


def test_exact_and_near_matches_use_only_the_given_registry() -> None:
    left = DuplicateIndex(
        [
            _item("known", "aa", "0000000000000000"),
            _item("close", "bb", "0000000000000007"),
            _item("far", "cc", "ffffffffffffffff"),
        ],
        hamming_threshold=8,
    )
    other = DuplicateIndex([_item("other", "aa", "0000000000000000")], hamming_threshold=8)
    found = left.lookup("aa", "0000000000000001")
    assert found.exact == ["known"]
    assert [(item.item_id, item.distance) for item in found.near] == [("close", 2)]
    assert other.lookup("aa", "0000000000000001").exact == ["other"]
    assert other.lookup("aa", "0000000000000001").near == []
    assert hamming_hex("0000000000000000", "0000000000000007") == 3


def test_threshold_is_configurable_and_scope_can_be_empty() -> None:
    index = DuplicateIndex(
        [_item("close", "bb", "0000000000000007")],
        hamming_threshold=2,
    )
    assert index.lookup("zz", "0000000000000000").near == []
    assert DuplicateIndex([], hamming_threshold=8).lookup("aa", "0000000000000000").exact == []
    with pytest.raises(ValueError):
        DuplicateIndex([], hamming_threshold=-1)
