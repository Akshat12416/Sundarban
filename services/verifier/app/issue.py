"""Seal a project and confirm the Sepolia registration.

chainState and chainTx.state move pending -> submitted -> confirmed, or failed.
Confirm writes `submitted` before the project update. If that update dies after
the chain transaction has succeeded, reconcile_submitted finishes the write.
"""

from __future__ import annotations

import json
import os
from decimal import Decimal
from pathlib import Path
from typing import Any, Protocol

import httpx

from app.evidence import EvidenceStore, ProjectStore
from cv_crypto.hashing import canonical_json, merkle_proof, merkle_root, sha256

_CREDITS = Path(__file__).resolve().parents[1] / "credits.json"
_DEPLOYMENT = Path(__file__).resolve().parents[3] / "packages" / "contract-abi" / "deployment.json"
_SELECTOR = "efd3ebe2"


class IssueError(ValueError):
    pass


class ChainStore(Protocol):
    def put(self, tx_hash: str, record: dict[str, Any]) -> None: ...

    def get(self, tx_hash: str) -> dict[str, Any] | None: ...

    def list_state(self, state: str) -> list[tuple[str, dict[str, Any]]]: ...


class MemoryChainStore:
    def __init__(self) -> None:
        self.rows: dict[str, dict[str, Any]] = {}

    def put(self, tx_hash: str, record: dict[str, Any]) -> None:
        self.rows[tx_hash] = dict(record)

    def get(self, tx_hash: str) -> dict[str, Any] | None:
        return self.rows.get(tx_hash)

    def list_state(self, state: str) -> list[tuple[str, dict[str, Any]]]:
        return [(tx_hash, record) for tx_hash, record in self.rows.items() if record.get("state") == state]


class FirestoreChainStore:
    def __init__(self, client: Any) -> None:
        self._client = client

    def put(self, tx_hash: str, record: dict[str, Any]) -> None:
        self._client.collection("chainTx").document(tx_hash).set(record)

    def get(self, tx_hash: str) -> dict[str, Any] | None:
        snapshot = self._client.collection("chainTx").document(tx_hash).get()
        if not snapshot.exists:
            return None
        return snapshot.to_dict() or {}

    def list_state(self, state: str) -> list[tuple[str, dict[str, Any]]]:
        items = self._client.collection("chainTx").where("state", "==", state).stream()
        return [(item.id, item.to_dict() or {}) for item in items]


class ChainGateway(Protocol):
    def transaction(self, tx_hash: str) -> dict[str, Any] | None: ...


class SepoliaGateway:
    def __init__(self, rpc_url: str) -> None:
        self._rpc_url = rpc_url

    def transaction(self, tx_hash: str) -> dict[str, Any] | None:
        receipt = _rpc(self._rpc_url, "eth_getTransactionReceipt", [tx_hash])
        if not isinstance(receipt, dict):
            return None
        tx = _rpc(self._rpc_url, "eth_getTransactionByHash", [tx_hash])
        if not isinstance(tx, dict):
            return None
        status = int(receipt.get("status", "0x0"), 16)
        return {"status": status, "to": tx.get("to") or "", "input": tx.get("input") or "0x"}


def contract_address() -> str:
    override = os.environ.get("CARBON_REGISTRY_ADDRESS", "").strip()
    if override:
        return override
    if _DEPLOYMENT.is_file():
        loaded = json.loads(_DEPLOYMENT.read_text(encoding="utf-8"))
        address = loaded.get("address")
        if isinstance(address, str) and address:
            return address
    raise IssueError("contract address is not configured")


def sepolia_rpc() -> str:
    return os.environ.get("SEPOLIA_RPC_URL", "").strip() or "https://ethereum-sepolia-rpc.publicnode.com"


def estimate_credits(tree_count: str) -> str:
    trees = Decimal(tree_count)
    if trees <= 0:
        raise IssueError("tree count must be positive")
    factors = json.loads(_CREDITS.read_text(encoding="utf-8"))
    value = trees
    for name in (
        "survivalRate",
        "speciesGrowthFactorTonnesPerYear",
        "years",
        "carbonFraction",
        "co2ePerCarbon",
    ):
        value *= Decimal(factors[name])
    value *= Decimal(1) - Decimal(factors["uncertaintyDiscount"])
    value *= Decimal(1) - Decimal(factors["bufferShare"])
    return format(value.quantize(Decimal("0.000001")), "f")


def seal_project(
    projects: ProjectStore,
    evidence: EvidenceStore,
    project_id: str,
    owner: str,
) -> dict[str, Any]:
    project = projects.get(project_id)
    if project is None:
        raise IssueError("project not found")
    if project.get("status") not in {"approved", "credited"} and project.get("chainState") != "pending":
        raise IssueError("project must be approved before it is sealed")
    if not _address(owner):
        raise IssueError("owner must be an address")
    leaves = _leaves(evidence.list_for_project(project_id))
    if not leaves:
        raise IssueError("project has no sealed evidence")
    root = merkle_root([item[1] for item in leaves])
    data_hash = sha256(canonical_json(_data_commitment(project_id, project)).encode("utf-8"))
    parcel_hash = sha256(canonical_json(_parcel_commitment(project)).encode("utf-8"))
    report_hash = _report_hash(project_id, project)
    credits = estimate_credits(str(project.get("treeCount") or "0"))
    base_units = str(int(Decimal(credits) * Decimal(10) ** 18))
    project.update(
        {
            "evidenceRoot": root.hex(),
            "dataHash": data_hash.hex(),
            "parcelHash": parcel_hash.hex(),
            "reportHash": report_hash.hex(),
            "creditsEstimated": credits,
            "creditsBaseUnits": base_units,
            "chainState": "pending",
            "chainOwner": owner,
        }
    )
    projects.put(project_id, project)
    return {
        "projectId": project_id,
        "owner": owner,
        "dataHash": "0x" + data_hash.hex(),
        "evidenceRoot": "0x" + root.hex(),
        "parcelHash": "0x" + parcel_hash.hex(),
        "reportHash": "0x" + report_hash.hex(),
        "credits": credits,
        "creditsBaseUnits": base_units,
        "chainState": "pending",
        "contract": contract_address(),
    }


def public_proof(
    projects: ProjectStore,
    evidence: EvidenceStore,
    project_id: str,
    image_sha256: str | None,
) -> dict[str, Any]:
    project = projects.get(project_id)
    if project is None or not project.get("evidenceRoot"):
        raise IssueError("project not found")
    body: dict[str, Any] = {
        "projectId": project_id,
        "dataHash": "0x" + str(project["dataHash"]),
        "evidenceRoot": "0x" + str(project["evidenceRoot"]),
        "parcelHash": "0x" + str(project["parcelHash"]),
        "reportHash": "0x" + str(project["reportHash"]),
    }
    if not image_sha256:
        return body
    wanted = image_sha256.lower().removeprefix("0x")
    ordered = _leaves(evidence.list_for_project(project_id))
    match = next((index for index, item in enumerate(ordered) if item[2] == wanted), None)
    if match is None:
        raise IssueError("photo not found")
    proof = merkle_proof([item[1] for item in ordered], match)
    body["index"] = match
    body["leaf"] = "0x" + ordered[match][1].hex()
    body["proof"] = [{"side": side, "sibling": "0x" + sibling.hex()} for side, sibling in proof]
    return body


def confirm_transaction(
    projects: ProjectStore,
    chain: ChainStore,
    project_id: str,
    tx_hash: str,
    gateway: ChainGateway,
    *,
    apply_confirmed: Any = None,
) -> dict[str, str]:
    project = projects.get(project_id)
    if project is None or not project.get("dataHash"):
        raise IssueError("project is not sealed")
    if project.get("chainState") == "confirmed":
        return {"projectId": project_id, "txHash": tx_hash, "chainState": "confirmed"}
    if project.get("chainState") not in {"pending", "submitted"}:
        raise IssueError("project is not waiting for a transaction")
    normalized = tx_hash if tx_hash.startswith("0x") else "0x" + tx_hash
    record = {
        "projectId": project_id,
        "state": "submitted",
        "network": "sepolia",
        "contract": contract_address(),
        "credits": project.get("creditsEstimated", ""),
    }
    chain.put(normalized, record)
    project["chainState"] = "submitted"
    project["chainTx"] = normalized
    projects.put(project_id, project)
    found = gateway.transaction(normalized)
    if found is None:
        return {"projectId": project_id, "txHash": normalized, "chainState": "submitted"}
    if not _matches(found, project):
        record["state"] = "failed"
        chain.put(normalized, record)
        project["chainState"] = "failed"
        projects.put(project_id, project)
        return {"projectId": project_id, "txHash": normalized, "chainState": "failed"}
    project["chainState"] = "confirmed"
    project["status"] = "credited"
    writer = apply_confirmed or projects.put
    writer(project_id, project)
    record["state"] = "confirmed"
    chain.put(normalized, record)
    return {"projectId": project_id, "txHash": normalized, "chainState": "confirmed"}


def reconcile_submitted(
    projects: ProjectStore,
    chain: ChainStore,
    gateway: ChainGateway,
) -> list[dict[str, str]]:
    repaired: list[dict[str, str]] = []
    for tx_hash, record in chain.list_state("submitted"):
        project_id = record.get("projectId")
        if not isinstance(project_id, str):
            continue
        repaired.append(
            confirm_transaction(projects, chain, project_id, tx_hash, gateway)
        )
    return repaired


def _matches(found: dict[str, Any], project: dict[str, Any]) -> bool:
    if found.get("status") != 1:
        return False
    if str(found.get("to", "")).lower() != contract_address().lower():
        return False
    decoded = decode_register(str(found.get("input", "")))
    if decoded is None:
        return False
    expected = {
        "owner": str(project.get("chainOwner", "")).lower(),
        "dataHash": str(project["dataHash"]).lower(),
        "evidenceRoot": str(project["evidenceRoot"]).lower(),
        "parcelHash": str(project["parcelHash"]).lower(),
        "reportHash": str(project["reportHash"]).lower(),
        "credits": int(project["creditsBaseUnits"]),
    }
    return decoded == expected


def decode_register(data: str) -> dict[str, Any] | None:
    raw = data.lower().removeprefix("0x")
    if not raw.startswith(_SELECTOR) or len(raw) != 8 + 64 * 6:
        return None
    body = bytes.fromhex(raw[8:])
    words = [body[index : index + 32] for index in range(0, len(body), 32)]
    return {
        "owner": "0x" + words[0][-20:].hex(),
        "dataHash": words[1].hex(),
        "evidenceRoot": words[2].hex(),
        "parcelHash": words[3].hex(),
        "reportHash": words[4].hex(),
        "credits": int.from_bytes(words[5], "big"),
    }


def _leaves(items: list[tuple[str, dict[str, Any]]]) -> list[tuple[str, bytes, str]]:
    ordered = sorted(items, key=lambda item: (_captured(item[1]), item[0]))
    leaves: list[tuple[str, bytes, str]] = []
    for evidence_id, record in ordered:
        leaf = record.get("leaf")
        digest = record.get("sha256")
        if not isinstance(leaf, str) or len(leaf) != 64 or not isinstance(digest, str):
            continue
        leaves.append((evidence_id, bytes.fromhex(leaf), digest.lower()))
    return leaves


def _captured(record: dict[str, Any]) -> str:
    metadata = record.get("metadata")
    if isinstance(metadata, dict) and isinstance(metadata.get("capturedAt"), str):
        return metadata["capturedAt"]
    return ""


def _data_commitment(project_id: str, project: dict[str, Any]) -> dict[str, str]:
    return {
        "areaHa": str(project.get("areaHa") or ""),
        "projectId": project_id,
        "region": str(project.get("region") or ""),
        "species": str(project.get("species") or ""),
        "treeCount": str(project.get("treeCount") or ""),
    }


def _parcel_commitment(project: dict[str, Any]) -> dict[str, str]:
    parcel = project.get("parcel")
    if not isinstance(parcel, dict):
        raise IssueError("project has no parcel")
    radius = parcel.get("radiusM")
    if isinstance(radius, bool) or not isinstance(radius, (int, str)):
        raise IssueError("parcel radius is missing")
    return {
        "latitude": str(parcel.get("latitude") or ""),
        "longitude": str(parcel.get("longitude") or ""),
        "radiusM": str(radius),
    }


def _report_hash(project_id: str, project: dict[str, Any]) -> bytes:
    existing = project.get("reportHash")
    if isinstance(existing, str) and len(existing) == 64:
        return bytes.fromhex(existing)
    return sha256(canonical_json({"projectId": project_id}).encode("utf-8"))


def _address(value: str) -> bool:
    text = value.lower()
    return text.startswith("0x") and len(text) == 42 and all(char in "0123456789abcdef" for char in text[2:])


def _rpc(url: str, method: str, params: list[Any]) -> Any:
    response = httpx.post(url, json={"jsonrpc": "2.0", "id": 1, "method": method, "params": params}, timeout=30)
    response.raise_for_status()
    body = response.json()
    if body.get("error"):
        raise IssueError("chain rpc failed")
    return body.get("result")


def encode_register(owner: str, data: str, root: str, parcel: str, report: str, credits: int) -> str:
    words = [
        owner.lower().removeprefix("0x").rjust(64, "0"),
        data.lower().removeprefix("0x").rjust(64, "0"),
        root.lower().removeprefix("0x").rjust(64, "0"),
        parcel.lower().removeprefix("0x").rjust(64, "0"),
        report.lower().removeprefix("0x").rjust(64, "0"),
        hex(credits)[2:].rjust(64, "0"),
    ]
    return "0x" + _SELECTOR + "".join(words)
