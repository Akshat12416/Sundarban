import json
from pathlib import Path

import pytest

from cv_crypto.cli import main, proof_document
from cv_crypto.hashing import (
    canonical_json,
    leaf_hash,
    merkle_proof,
    merkle_root,
    metadata_hash,
    verify_merkle_proof,
)

VECTORS = json.loads(
    (Path(__file__).resolve().parents[3] / "packages" / "test-vectors" / "vectors.json").read_text()
)


def test_canonical_vectors_and_float_rejection() -> None:
    assert len(VECTORS["canonicalJson"]) >= 10
    for item in VECTORS["canonicalJson"]:
        assert canonical_json(item["value"]) == item["canonical"]
    with pytest.raises(TypeError):
        canonical_json({"latitude": 22.5})
    encoded = canonical_json(
        {"longitude": "88.300001", "latitude": "22.500001", "accuracy": "4.0"}
    )
    assert encoded == '{"accuracy":"4.0","latitude":"22.500001","longitude":"88.300001"}'
    assert ": " not in encoded


def test_metadata_and_leaf_vectors() -> None:
    assert len(VECTORS["metadataHash"]) >= 10
    assert len(VECTORS["leafHash"]) >= 10
    for item in VECTORS["metadataHash"]:
        assert metadata_hash(item["metadata"]).hex() == item["sha256"]
    for item in VECTORS["leafHash"]:
        digest = leaf_hash(
            bytes.fromhex(item["imageSha256"]),
            item["metadata"],
            bytes.fromhex(item["signature"]),
        )
        assert digest.hex() == item["leaf"]


def test_merkle_vectors_and_proofs() -> None:
    assert len(VECTORS["merkleRoot"]) >= 10
    for item in VECTORS["merkleRoot"]:
        leaves = [bytes.fromhex(leaf) for leaf in item["leaves"]]
        root = merkle_root(leaves)
        assert root.hex() == item["root"]
        for index, leaf in enumerate(leaves):
            proof = merkle_proof(leaves, index)
            assert verify_merkle_proof(leaf, proof, root)
            tampered = bytearray(proof[0][1]) if proof else bytearray(leaf)
            if proof:
                tampered[0] ^= 0x01
                assert not verify_merkle_proof(leaf, [(proof[0][0], bytes(tampered)), *proof[1:]], root)


def test_cli_prints_a_valid_proof(capsys: pytest.CaptureFixture[str]) -> None:
    item = VECTORS["merkleRoot"][2]
    leaves = [bytes.fromhex(leaf) for leaf in item["leaves"]]
    document = proof_document(leaves, 2)
    assert document["valid"] is True
    assert document["root"] == item["root"]
    assert main(["--leaves", ",".join(item["leaves"]), "--index", "2"]) == 0
    printed = json.loads(capsys.readouterr().out)
    assert printed["valid"] is True
    assert printed["root"] == item["root"]
    assert printed["index"] == 2
