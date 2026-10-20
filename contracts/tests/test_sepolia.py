import json
import os
from pathlib import Path

import solcx
from web3 import Web3

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_RPC = "https://ethereum-sepolia-rpc.publicnode.com"
SEPOLIA_CHAIN_ID = 11155111


def test_openzeppelin_v5_is_installed() -> None:
    package = ROOT / "node_modules" / "@openzeppelin" / "contracts" / "package.json"
    version = json.loads(package.read_text(encoding="utf-8"))["version"]
    assert version.split(".", 1)[0] == "5"
    assert solcx.__name__ == "solcx"


def test_sepolia_chain_id() -> None:
    url = os.environ.get("SEPOLIA_RPC_URL", DEFAULT_RPC)
    web3 = Web3(Web3.HTTPProvider(url, request_kwargs={"timeout": 30}))
    assert web3.is_connected()
    assert web3.eth.chain_id == SEPOLIA_CHAIN_ID
