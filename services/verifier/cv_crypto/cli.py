"""Print a Merkle proof for a comma-separated list of leaf hashes.

Run from services/verifier:

    .venv/bin/python -m cv_crypto.cli --leaves <hex>,<hex> --index 0
"""

from __future__ import annotations

import argparse
import json
import sys

from cv_crypto.hashing import merkle_proof, merkle_root, verify_merkle_proof


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Print a Merkle proof as JSON.")
    parser.add_argument("--leaves", required=True, help="Comma-separated 32-byte hex leaves.")
    parser.add_argument("--index", required=True, type=int, help="Leaf index to prove.")
    return parser


def proof_document(leaves: list[bytes], index: int) -> dict[str, object]:
    proof = merkle_proof(leaves, index)
    root = merkle_root(leaves)
    return {
        "index": index,
        "leaf": leaves[index].hex(),
        "root": root.hex(),
        "steps": [{"side": side, "sibling": sibling.hex()} for side, sibling in proof],
        "valid": verify_merkle_proof(leaves[index], proof, root),
    }


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    leaves = [bytes.fromhex(part.strip()) for part in args.leaves.split(",") if part.strip()]
    document = proof_document(leaves, args.index)
    json.dump(document, sys.stdout, sort_keys=True)
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
