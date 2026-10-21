"""Sign one registerProject, or show that a second one reverts. Run with contracts/.venv."""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

from web3 import Web3

ROOT = Path(__file__).resolve().parents[1]
CONTRACTS = ROOT / "contracts"


def load_env() -> None:
    for line in (CONTRACTS / ".env").read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        key, value = stripped.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def main() -> None:
    mode = sys.argv[1]
    payload = json.loads(Path(sys.argv[2]).read_text(encoding="utf-8"))
    load_env()
    key = os.environ["DEPLOYER_PRIVATE_KEY"]
    if not key.startswith("0x"):
        key = "0x" + key
    web3 = Web3(Web3.HTTPProvider(os.environ["SEPOLIA_RPC_URL"], request_kwargs={"timeout": 60}))
    account = web3.eth.account.from_key(key)
    if mode == "address":
        print(account.address)
        return
    abi = json.loads((ROOT / "packages/contract-abi/CarbonRegistry.abi.json").read_text(encoding="utf-8"))
    contract = web3.eth.contract(address=Web3.to_checksum_address(payload["contract"]), abi=abi)
    function = contract.functions.registerProject(
        Web3.to_checksum_address(payload["owner"]),
        payload["dataHash"],
        payload["evidenceRoot"],
        payload["parcelHash"],
        payload["reportHash"],
        int(payload["creditsBaseUnits"]),
    )
    if mode == "replay":
        try:
            function.call({"from": account.address})
        except Exception as exc:
            text = str(exc)
            print("reverted" if "DataHashUsed" in text or "0x" in text else text)
            return
        print("did not revert")
        return
    nonce = web3.eth.get_transaction_count(account.address)
    gas = function.estimate_gas({"from": account.address})
    block = web3.eth.get_block("latest")
    base = block.get("baseFeePerGas") or web3.to_wei(1, "gwei")
    tx = function.build_transaction(
        {
            "from": account.address,
            "nonce": nonce,
            "chainId": 11155111,
            "gas": int(gas * 1.2) + 50000,
            "maxFeePerGas": int(base * 2) + web3.to_wei(2, "gwei"),
            "maxPriorityFeePerGas": web3.to_wei(2, "gwei"),
        }
    )
    signed = account.sign_transaction(tx)
    raw = getattr(signed, "raw_transaction", None) or signed.rawTransaction
    tx_hash = web3.eth.send_raw_transaction(raw)
    receipt = web3.eth.wait_for_transaction_receipt(tx_hash, timeout=240)
    print(tx_hash.hex() if str(tx_hash.hex()).startswith("0x") else "0x" + tx_hash.hex())
    if receipt.status != 1:
        raise SystemExit("transaction failed")


if __name__ == "__main__":
    main()
