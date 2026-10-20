"""Reference encoding for the attestation hashes in plan section 5.1.

Canonical JSON: keys sorted at every object, UTF-8, no whitespace.
Floats are rejected. Latitude and longitude are decimal strings.

Leaf = SHA-256(0x00 || h || SHA-256(m_canonical) || signature)
where h is SHA-256(image bytes), already 32 bytes.

Merkle: leaves in order. Internal node = SHA-256(0x01 || left || right).
A level with an odd count duplicates its last node. One leaf is its own root.
"""

from __future__ import annotations

import hashlib
import json
from typing import Any


def _reject_floats(value: Any) -> None:
    if isinstance(value, bool):
        return
    if isinstance(value, float):
        raise TypeError(
            "floats are not canonical; use a string with fixed decimals"
        )
    if isinstance(value, dict):
        for item in value.values():
            _reject_floats(item)
    elif isinstance(value, list):
        for item in value:
            _reject_floats(item)


def canonical_json(value: Any) -> str:
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
    for leaf in leaves:
        if len(leaf) != 32:
            raise ValueError("each leaf must be 32 bytes")
    level = list(leaves)
    while len(level) > 1:
        if len(level) % 2 == 1:
            level.append(level[-1])
        level = [
            sha256(b"\x01" + level[i] + level[i + 1])
            for i in range(0, len(level), 2)
        ]
    return level[0]


def _hex(data: bytes) -> str:
    return data.hex()


def _metadata(index: int) -> dict[str, Any]:
    return {
        "accuracyM": 3 + index,
        "capturedAt": f"2026-10-20T12:{index:02d}:00Z",
        "deviceId": f"device-{index}",
        "latitude": f"{22.500000 + index / 1_000_000:.6f}",
        "longitude": f"{88.300000 + index / 1_000_000:.6f}",
        "nonce": f"nonce-{index}",
        "projectId": f"project-{index}",
    }


def build_vectors() -> dict[str, list[dict[str, Any]]]:
    canonical_cases: list[dict[str, Any]] = [
        {"name": "empty-object", "value": {}},
        {"name": "key-order", "value": {"b": 1, "a": 2}},
        {"name": "nested-key-order", "value": {"z": {"b": 1, "a": 2}}},
        {"name": "array", "value": {"items": [3, 1, {"b": True, "a": None}]}},
        {"name": "unicode", "value": {"place": "Sundarban mangrove"}},
        {"name": "escaped-string", "value": {"note": 'line\n"quote"'}},
        {"name": "bool-and-null", "value": {"ok": True, "missing": None, "no": False}},
        {"name": "integers", "value": {"n": 0, "neg": -12, "big": 1600}},
        {"name": "metadata-shape", "value": _metadata(1)},
        {
            "name": "mixed",
            "value": {
                "tags": ["before", "after"],
                "owner": {"name": "Ada", "id": "u1"},
                "count": 4,
            },
        },
    ]
    canonical = [
        {
            "name": case["name"],
            "value": case["value"],
            "canonical": canonical_json(case["value"]),
        }
        for case in canonical_cases
    ]

    metadata = []
    for index in range(10):
        body = _metadata(index)
        metadata.append(
            {
                "name": f"metadata-{index}",
                "metadata": body,
                "sha256": _hex(metadata_hash(body)),
            }
        )

    leaves = []
    for index in range(10):
        image = sha256(f"image-{index}".encode("utf-8"))
        signature = sha256(f"sig-{index}".encode("utf-8")) + sha256(
            f"sig-{index}-b".encode("utf-8")
        )
        body = _metadata(index)
        leaves.append(
            {
                "name": f"leaf-{index}",
                "imageSha256": _hex(image),
                "metadata": body,
                "signature": _hex(signature),
                "leaf": _hex(leaf_hash(image, body, signature)),
            }
        )

    merkle = []
    for count in range(1, 11):
        nodes = [sha256(f"leaf-{i}".encode("utf-8")) for i in range(count)]
        merkle.append(
            {
                "name": f"merkle-{count}",
                "leafCount": count,
                "leaves": [_hex(node) for node in nodes],
                "root": _hex(merkle_root(nodes)),
            }
        )

    return {
        "canonicalJson": canonical,
        "metadataHash": metadata,
        "leafHash": leaves,
        "merkleRoot": merkle,
    }
