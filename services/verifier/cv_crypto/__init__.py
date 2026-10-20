"""Attestation hashes shared with packages/cv-crypto-ts.

Canonical JSON rejects floats. Latitude and longitude in new captures are
6-decimal strings. The shared vectors still contain integer fields such as
accuracyM; those integers are valid canonical JSON and stay unchanged.
"""

from cv_crypto.hashing import (
    canonical_json,
    leaf_hash,
    merkle_proof,
    merkle_root,
    metadata_hash,
    sha256,
    verify_merkle_proof,
)

__all__ = [
    "canonical_json",
    "leaf_hash",
    "merkle_proof",
    "merkle_root",
    "metadata_hash",
    "sha256",
    "verify_merkle_proof",
]
