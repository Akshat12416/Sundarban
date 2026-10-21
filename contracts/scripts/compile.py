"""Compile CarbonRegistry with py-solc-x and OpenZeppelin v5."""

from __future__ import annotations

import json
import os
from pathlib import Path

import solcx

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parent
OZ = ROOT / "node_modules" / "@openzeppelin" / "contracts"
OUT = REPO / "packages" / "contract-abi"
SOLC = "0.8.20"


def compile_contract() -> dict:
    if not OZ.joinpath("package.json").is_file():
        raise SystemExit("Install OpenZeppelin in contracts/: npm install")
    solcx.install_solc(SOLC)
    solcx.set_solc_version(SOLC)
    previous = Path.cwd()
    os.chdir(ROOT)
    try:
        compiled = solcx.compile_files(
            ["src/CarbonRegistry.sol"],
            output_values=["abi", "bin"],
            import_remappings=[
                "@openzeppelin/contracts/=node_modules/@openzeppelin/contracts/"
            ],
            optimize=True,
            optimize_runs=200,
            solc_version=SOLC,
        )
    finally:
        os.chdir(previous)
    key = next(name for name in compiled if name.endswith("CarbonRegistry.sol:CarbonRegistry"))
    return compiled[key]


def main() -> None:
    artifact = compile_contract()
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "CarbonRegistry.abi.json").write_text(
        json.dumps(artifact["abi"], indent=2) + "\n",
        encoding="utf-8",
    )
    (OUT / "CarbonRegistry.bin").write_text(artifact["bin"] + "\n", encoding="utf-8")
    print(f"wrote {OUT / 'CarbonRegistry.abi.json'}")


if __name__ == "__main__":
    main()
