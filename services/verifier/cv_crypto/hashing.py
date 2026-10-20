from __future__ import annotations

import hashlib
import json
from typing import Any


def _reject_floats(value: Any) -> None:
    if isinstance(value, bool):
        return
    if isinstance(value, float):
        raise TypeError("floats are not canonical; use a string with fixed decimals")
    if isinstance(value, dict):
        for item in value.values():
            _reject_floats(item)
    elif isinstance(value, list):
        for item in value:
            _reject_floats(item)


def canonical_json(value: Any) -> str:
    """Sorted keys, UTF-8, no whitespace. Floats are rejected."""
    _reject_floats(value)
    return json.dumps(
        value,
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=False,
        allow_nan=False,
    )


def sha256(data: bytes) -> bytes:
    return hashlib.sha256(data).digest()


def metadata_hash(metadata: dict[str, Any]) -> bytes:
    return sha256(canonical_json(metadata).encode("utf-8"))


def leaf_hash(image_sha256: bytes, metadata: dict[str, Any], signature: bytes) -> bytes:
    if len(image_sha256) != 32:
        raise ValueError("image_sha256 must be 32 bytes")
    return sha256(b"\x00" + image_sha256 + metadata_hash(metadata) + signature)


def merkle_root(leaves: list[bytes]) -> bytes:
    if not leaves:
        raise ValueError("a Merkle tree needs at least one leaf")
    level = [_as_leaf(leaf) for leaf in leaves]
    while len(level) > 1:
        if len(level) % 2 == 1:
            level.append(level[-1])
        level = [
            sha256(b"\x01" + level[i] + level[i + 1]) for i in range(0, len(level), 2)
        ]
    return level[0]


def merkle_proof(leaves: list[bytes], index: int) -> list[tuple[str, bytes]]:
    """Sibling hashes from the leaf up to the root.

    Each step is ("left", sibling) when the sibling is on the left, or
    ("right", sibling) when it is on the right. An odd level duplicates its
    last node, matching merkle_root. A single leaf has an empty proof.
    """
    if not leaves:
        raise ValueError("a Merkle tree needs at least one leaf")
    if index < 0 or index >= len(leaves):
        raise ValueError("leaf index out of range")
    level = [_as_leaf(leaf) for leaf in leaves]
    cursor = index
    steps: list[tuple[str, bytes]] = []
    while len(level) > 1:
        if len(level) % 2 == 1:
            level.append(level[-1])
        if cursor % 2 == 0:
            steps.append(("right", level[cursor + 1]))
        else:
            steps.append(("left", level[cursor - 1]))
        level = [
            sha256(b"\x01" + level[i] + level[i + 1]) for i in range(0, len(level), 2)
        ]
        cursor //= 2
    return steps


def verify_merkle_proof(
    leaf: bytes,
    proof: list[tuple[str, bytes]],
    root: bytes,
) -> bool:
    current = _as_leaf(leaf)
    for side, sibling in proof:
        if len(sibling) != 32:
            raise ValueError("each sibling must be 32 bytes")
        if side == "left":
            current = sha256(b"\x01" + sibling + current)
        elif side == "right":
            current = sha256(b"\x01" + current + sibling)
        else:
            raise ValueError("proof side must be 'left' or 'right'")
    return current == root


def _as_leaf(leaf: bytes) -> bytes:
    if len(leaf) != 32:
        raise ValueError("each leaf must be 32 bytes")
    return leaf
