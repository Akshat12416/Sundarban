"""Deploy CarbonRegistry to Sepolia and grant ISSUER_ROLE."""

from __future__ import annotations

import json
import os
from pathlib import Path

from web3 import Web3

from scripts.compile import OUT, compile_contract

ROOT = Path(__file__).resolve().parents[1]
CHAIN_ID = 11155111


def hex_value(value) -> str:
    text = value.hex() if hasattr(value, "hex") else str(value)
    return text if text.startswith("0x") else "0x" + text


def load_env() -> None:
    path = ROOT / ".env"
    if not path.is_file():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        key, value = stripped.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def key_bytes(value: str) -> str:
    text = value.strip()
    if not text:
        raise SystemExit("DEPLOYER_PRIVATE_KEY is empty")
    return text if text.startswith("0x") else "0x" + text


def send(web3: Web3, account, function, nonce: int) -> dict:
    gas = function.estimate_gas({"from": account.address})
    block = web3.eth.get_block("latest")
    base = block.get("baseFeePerGas") or web3.to_wei(1, "gwei")
    tx = function.build_transaction(
        {
            "from": account.address,
            "nonce": nonce,
            "chainId": CHAIN_ID,
            "gas": int(gas * 1.2) + 21000,
            "maxFeePerGas": int(base * 2) + web3.to_wei(2, "gwei"),
            "maxPriorityFeePerGas": web3.to_wei(2, "gwei"),
        }
    )
    signed = account.sign_transaction(tx)
    raw = getattr(signed, "raw_transaction", None) or signed.rawTransaction
    tx_hash = web3.eth.send_raw_transaction(raw)
    receipt = web3.eth.wait_for_transaction_receipt(tx_hash, timeout=240)
    if receipt.status != 1:
        raise SystemExit(f"transaction failed: {tx_hash.hex()}")
    return receipt


def verify(address: str, admin: str) -> str:
    api_key = os.environ.get("ETHERSCAN_API_KEY", "").strip()
    if not api_key:
        return "skipped"
    import urllib.parse
    import urllib.request

    source = (ROOT / "src" / "CarbonRegistry.sol").read_text(encoding="utf-8")
    oz_root = ROOT / "node_modules" / "@openzeppelin" / "contracts"
    sources = {"contracts/src/CarbonRegistry.sol": {"content": source}}
    for path in oz_root.rglob("*.sol"):
        relative = Path("@openzeppelin/contracts") / path.relative_to(oz_root)
        sources[relative.as_posix()] = {"content": path.read_text(encoding="utf-8")}
    standard = {
        "language": "Solidity",
        "sources": sources,
        "settings": {
            "optimizer": {"enabled": True, "runs": 200},
            "outputSelection": {"*": {"*": ["abi", "evm.bytecode"]}},
        },
    }
    payload = {
        "apikey": api_key,
        "module": "contract",
        "action": "verifysourcecode",
        "contractaddress": address,
        "sourceCode": json.dumps(standard),
        "codeformat": "solidity-standard-json-input",
        "contractname": "contracts/src/CarbonRegistry.sol:CarbonRegistry",
        "compilerversion": "v0.8.20+commit.a1b79de6",
        "constructorArguements": admin.lower().removeprefix("0x").rjust(64, "0"),
    }
    data = urllib.parse.urlencode(payload).encode()
    request = urllib.request.Request(
        f"https://api.etherscan.io/v2/api?chainid={CHAIN_ID}",
        data=data,
    )
    with urllib.request.urlopen(request, timeout=60) as response:
        body = json.loads(response.read().decode())
    return str(body.get("result") or body.get("message") or "submitted")


def main() -> None:
    load_env()
    rpc = os.environ.get("SEPOLIA_RPC_URL", "").strip()
    if not rpc:
        raise SystemExit("SEPOLIA_RPC_URL is empty")
    web3 = Web3(Web3.HTTPProvider(rpc, request_kwargs={"timeout": 60}))
    if web3.eth.chain_id != CHAIN_ID:
        raise SystemExit(f"RPC chain id is {web3.eth.chain_id}, expected {CHAIN_ID}")
    account = web3.eth.account.from_key(key_bytes(os.environ.get("DEPLOYER_PRIVATE_KEY", "")))
    issuer_text = os.environ.get("ISSUER_ADDRESS", "").strip() or account.address
    issuer = Web3.to_checksum_address(issuer_text)
    compiled = compile_contract()
    abi = compiled["abi"]
    bytecode = compiled["bin"]
    contract = web3.eth.contract(abi=abi, bytecode=bytecode)
    nonce = web3.eth.get_transaction_count(account.address)
    receipt = send(web3, account, contract.constructor(account.address), nonce)
    address = receipt.contractAddress
    deployed = web3.eth.contract(address=address, abi=abi)
    role = deployed.functions.ISSUER_ROLE().call()
    grant = send(web3, account, deployed.functions.grantRole(role, issuer), nonce + 1)
    OUT.mkdir(parents=True, exist_ok=True)
    document = {
        "address": address,
        "network": "sepolia",
        "chainId": CHAIN_ID,
        "deploymentTransactionHash": hex_value(receipt.transactionHash),
        "issuerGrantTransactionHash": hex_value(grant.transactionHash),
        "admin": account.address,
        "issuer": issuer,
    }
    (OUT / "deployment.json").write_text(json.dumps(document, indent=2) + "\n", encoding="utf-8")
    (OUT / "CarbonRegistry.abi.json").write_text(json.dumps(abi, indent=2) + "\n", encoding="utf-8")
    (OUT / "CarbonRegistry.bin").write_text(bytecode + "\n", encoding="utf-8")
    print(f"deployed {address}")
    print(f"issuer {issuer}")
    try:
        status = verify(address, account.address)
    except Exception as exc:
        status = f"failed: {type(exc).__name__}"
    print(f"etherscan {status}")


if __name__ == "__main__":
    main()
