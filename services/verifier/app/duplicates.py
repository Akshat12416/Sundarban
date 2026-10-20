"""Exact and near-duplicate lookup over an explicit registry scope.

The benchmark runner builds that scope from one submission's registry_context.
This module does not read a shared registry.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class RegistryItem:
    item_id: str
    sha256: str
    phash: str


@dataclass(frozen=True)
class NearMatch:
    item_id: str
    distance: int


@dataclass(frozen=True)
class DuplicateLookup:
    exact: list[str]
    near: list[NearMatch]


class DuplicateIndex:
    def __init__(self, registry: list[RegistryItem], hamming_threshold: int) -> None:
        if hamming_threshold < 0:
            raise ValueError("hamming threshold must be zero or greater")
        self.registry = list(registry)
        self.hamming_threshold = hamming_threshold

    def lookup(self, sha256: str, phash: str) -> DuplicateLookup:
        exact = [item.item_id for item in self.registry if item.sha256 == sha256]
        near: list[NearMatch] = []
        for item in self.registry:
            if item.sha256 == sha256:
                continue
            distance = hamming_hex(item.phash, phash)
            if distance <= self.hamming_threshold:
                near.append(NearMatch(item.item_id, distance))
        return DuplicateLookup(exact=exact, near=near)


def hamming_hex(left: str, right: str) -> int:
    if len(left) != len(right) or not left:
        raise ValueError("perceptual hashes must be the same non-empty hex width")
    return (int(left, 16) ^ int(right, 16)).bit_count()
