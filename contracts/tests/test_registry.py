"""Sepolia tests for a fresh CarbonRegistry. Reverts are eth_call only."""

from __future__ import annotations

import json
import os
import secrets
from pathlib import Path

import pytest
from web3 import Web3
from web3.exceptions import ContractLogicError

from scripts.compile import compile_contract

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parent
CHAIN_ID = 11155111
RUNS = 5


def _load_env() -> None:
    path = ROOT / ".env"
    if not path.is_file():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        key, value = stripped.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def _key() -> str:
    raw = os.environ.get("DEPLOYER_PRIVATE_KEY", "").strip()
    if not raw:
        pytest.skip("DEPLOYER_PRIVATE_KEY is not set")
    return raw if raw.startswith("0x") else "0x" + raw


def _error_name(exc: ContractLogicError, abi: list) -> str:
    data = getattr(exc, "data", None)
    if isinstance(data, (tuple, list)) and data:
        data = data[0]
    if not isinstance(data, str) or not data.startswith("0x"):
        return str(exc)
    selector = data[:10]
    for item in abi:
        if item.get("type") != "error":
            continue
        types = ",".join(entry["type"] for entry in item["inputs"])
        signature = f"{item['name']}({types})"
        digest = Web3.keccak(text=signature)[:4].hex().removeprefix("0x")
        if digest == selector.removeprefix("0x"):
            return item["name"]
    return str(exc)


def _expect_revert(function, sender: str, name: str) -> None:
    try:
        function.call({"from": sender})
    except ContractLogicError as exc:
        found = _error_name(exc, function.contract_abi)
        assert found == name, found
        return
    raise AssertionError(f"expected revert {name}")


def _send(web3: Web3, account, function) -> dict:
    nonce = web3.eth.get_transaction_count(account.address)
    gas = function.estimate_gas({"from": account.address})
    block = web3.eth.get_block("latest")
    base = block.get("baseFeePerGas") or web3.to_wei(1, "gwei")
    tx = function.build_transaction(
        {
            "from": account.address,
            "nonce": nonce,
            "chainId": CHAIN_ID,
            "gas": int(gas * 1.2) + 50000,
            "maxFeePerGas": int(base * 2) + web3.to_wei(2, "gwei"),
            "maxPriorityFeePerGas": web3.to_wei(2, "gwei"),
        }
    )
    signed = account.sign_transaction(tx)
    raw = getattr(signed, "raw_transaction", None) or signed.rawTransaction
    tx_hash = web3.eth.send_raw_transaction(raw)
    receipt = web3.eth.wait_for_transaction_receipt(tx_hash, timeout=240)
    assert receipt.status == 1
    return receipt


def _hash() -> bytes:
    return secrets.token_bytes(32)


def test_register_and_retire_on_sepolia() -> None:
    _load_env()
    rpc = os.environ.get("SEPOLIA_RPC_URL", "").strip()
    if not rpc:
        pytest.skip("SEPOLIA_RPC_URL is not set")
    web3 = Web3(Web3.HTTPProvider(rpc, request_kwargs={"timeout": 60}))
    assert web3.eth.chain_id == CHAIN_ID
    account = web3.eth.account.from_key(_key())
    compiled = compile_contract()
    contract = web3.eth.contract(abi=compiled["abi"], bytecode=compiled["bin"])
    deploy_receipt = _send(web3, account, contract.constructor(account.address))
    deployed = web3.eth.contract(address=deploy_receipt.contractAddress, abi=compiled["abi"])
    role = deployed.functions.ISSUER_ROLE().call()
    _send(web3, account, deployed.functions.grantRole(role, account.address))
    assert deployed.functions.hasRole(role, account.address).call()

    outsider = web3.eth.account.create().address
    credits = 10 * 10**18
    data_hash, evidence, parcel, report = _hash(), _hash(), _hash(), _hash()
    register = deployed.functions.registerProject(
        account.address, data_hash, evidence, parcel, report, credits
    )
    _expect_revert(
        deployed.functions.registerProject(
            "0x0000000000000000000000000000000000000000",
            _hash(),
            _hash(),
            _hash(),
            _hash(),
            credits,
        ),
        account.address,
        "ZeroAddress",
    )
    _expect_revert(
        deployed.functions.registerProject(
            account.address, _hash(), _hash(), _hash(), _hash(), 0
        ),
        account.address,
        "ZeroCredits",
    )
    _expect_revert(register, outsider, "AccessControlUnauthorizedAccount")

    _send(web3, account, deployed.functions.pause())
    _expect_revert(register, account.address, "EnforcedPause")
    _expect_revert(deployed.functions.retire(1, "paused"), account.address, "EnforcedPause")
    _send(web3, account, deployed.functions.unpause())

    register_gas = []
    first = None
    for index in range(RUNS):
        payload = (
            (data_hash, evidence, parcel, report)
            if index == 0
            else (_hash(), _hash(), _hash(), _hash())
        )
        if index == 0:
            first = payload
        receipt = _send(
            web3,
            account,
            deployed.functions.registerProject(account.address, *payload, credits),
        )
        register_gas.append(receipt.gasUsed)
        minted = deployed.events.ProjectRegistered().process_receipt(receipt)
        assert len(minted) == 1
        args = minted[0]["args"]
        assert args["owner"] == account.address
        assert args["dataHash"] == payload[0]
        assert args["evidenceRoot"] == payload[1]
        assert args["parcelHash"] == payload[2]
        assert args["reportHash"] == payload[3]
        assert args["credits"] == credits
        stored = deployed.functions.getProject(args["projectId"]).call()
        assert stored[0] == account.address
        assert deployed.functions.projectIdByDataHash(payload[0]).call() == args["projectId"]

    assert first is not None
    _expect_revert(
        deployed.functions.registerProject(
            account.address, first[0], _hash(), _hash(), _hash(), credits
        ),
        account.address,
        "DataHashUsed",
    )
    _expect_revert(
        deployed.functions.registerProject(
            account.address, _hash(), _hash(), first[2], _hash(), credits
        ),
        account.address,
        "ParcelHashUsed",
    )

    balance_before = deployed.functions.balanceOf(account.address).call()
    assert balance_before == credits * RUNS
    retire_gas = []
    unit = 10**18
    for _ in range(RUNS):
        receipt = _send(web3, account, deployed.functions.retire(unit, "measured"))
        retire_gas.append(receipt.gasUsed)
        retired = deployed.events.CreditsRetired().process_receipt(receipt)
        assert len(retired) == 1
        assert retired[0]["args"]["account"] == account.address
        assert retired[0]["args"]["amount"] == unit
        assert retired[0]["args"]["reason"] == "measured"
    assert deployed.functions.balanceOf(account.address).call() == balance_before - unit * RUNS
    _expect_revert(
        deployed.functions.retire(balance_before + 1, "too much"),
        account.address,
        "ERC20InsufficientBalance",
    )

    def summary(values: list[int]) -> dict:
        return {
            "runs": values,
            "mean": sum(values) / len(values),
            "min": min(values),
            "max": max(values),
        }

    gas_path = REPO / "bench" / "results" / "gas.json"
    gas_path.parent.mkdir(parents=True, exist_ok=True)
    gas_path.write_text(
        json.dumps(
            {
                "network": "sepolia",
                "contract": deploy_receipt.contractAddress,
                "register": summary(register_gas),
                "retire": summary(retire_gas),
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
