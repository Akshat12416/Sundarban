import json
from typing import Any

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile
from pydantic import BaseModel, Field

from app.auth import Principal, get_current_user, require_admin
from app.evidence import AcceptedEvidence, EvidenceError, accept_evidence, enrol_device, register_project
from app.wiring import Services

router = APIRouter()


class NonceBody(BaseModel):
    projectId: str = Field(min_length=1)


class DeviceBody(BaseModel):
    deviceId: str = Field(min_length=1)
    publicKey: str = Field(min_length=1)
    securityLevel: str = "software"


def get_services(request: Request) -> Services:
    services = getattr(request.app.state, "services", None)
    if services is None:
        raise HTTPException(status_code=503, detail="services not ready")
    return services


class ProjectBody(BaseModel):
    projectId: str = Field(min_length=1)


@router.post("/v1/projects")
def create_project(
    body: ProjectBody,
    user: Principal = Depends(get_current_user),
    services: Services = Depends(get_services),
) -> dict[str, str]:
    try:
        register_project(services.projects, body.projectId, user.uid)
    except EvidenceError as exc:
        status = 404 if str(exc) == "project not found" else 400
        raise HTTPException(status_code=status, detail=str(exc)) from exc
    return {"projectId": body.projectId, "ownerUid": user.uid}


@router.post("/v1/nonce")
def issue_nonce(
    body: NonceBody,
    user: Principal = Depends(get_current_user),
    services: Services = Depends(get_services),
) -> dict[str, str]:
    project = services.projects.get(body.projectId)
    if project is None or project.get("ownerUid") != user.uid:
        raise HTTPException(status_code=404, detail="project not found")
    record = services.nonces.issue(body.projectId, user.uid)
    return {"nonce": record.nonce, "expiresAt": record.expires_at}


@router.post("/v1/devices")
def enrol(
    body: DeviceBody,
    user: Principal = Depends(get_current_user),
    services: Services = Depends(get_services),
) -> dict[str, str]:
    try:
        enrol_device(services.devices, user.uid, body.deviceId, body.publicKey, body.securityLevel)
    except EvidenceError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"deviceId": body.deviceId, "uid": user.uid}


@router.post("/v1/projects/{project_id}/evidence")
async def upload_evidence(
    project_id: str,
    file: UploadFile = File(...),
    metadata: str = Form(...),
    signature: str = Form(...),
    kind: str = Form("before"),
    user: Principal = Depends(get_current_user),
    services: Services = Depends(get_services),
) -> dict[str, Any]:
    try:
        parsed = json.loads(metadata)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=400, detail="metadata must be JSON") from exc
    if not isinstance(parsed, dict):
        raise HTTPException(status_code=400, detail="metadata must be a JSON object")
    try:
        signature_bytes = bytes.fromhex(signature)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="signature must be hex") from exc
    original = await file.read()
    try:
        accepted = accept_evidence(
            projects=services.projects,
            devices=services.devices,
            evidence=services.evidence,
            storage=services.storage,
            nonces=services.nonces,
            project_id=project_id,
            uid=user.uid,
            kind=kind,
            original=original,
            content_type=file.content_type or "application/octet-stream",
            filename=file.filename or "evidence.bin",
            metadata=parsed,
            signature=signature_bytes,
        )
    except EvidenceError as exc:
        status = 404 if str(exc) == "project not found" else 400
        raise HTTPException(status_code=status, detail=str(exc)) from exc
    return _accepted(accepted)


@router.get("/v1/files/{evidence_id}")
def file_url(
    evidence_id: str,
    user: Principal = Depends(require_admin),
    services: Services = Depends(get_services),
) -> dict[str, Any]:
    del user
    record = services.evidence.get_index(evidence_id)
    if record is None:
        raise HTTPException(status_code=404, detail="evidence not found")
    path = record.get("storagePath")
    if not isinstance(path, str):
        raise HTTPException(status_code=404, detail="evidence not found")
    url = services.storage.signed_url(path, services.signed_url_ttl_seconds)
    return {"url": url, "expiresIn": services.signed_url_ttl_seconds}


def _accepted(accepted: AcceptedEvidence) -> dict[str, Any]:
    return {
        "accepted": True,
        "evidenceId": accepted.evidence_id,
        "storagePath": accepted.storage_path,
        "sha256": accepted.sha256,
        "phash": accepted.phash,
        "leaf": accepted.leaf,
    }
