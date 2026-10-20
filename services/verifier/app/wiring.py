"""Wires stores for one process. Tests can replace app.state.services."""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from app.cache import AnalysisCache, FirestoreCache, MemoryCache
from app.evidence import (
    DeviceStore,
    EvidenceStore,
    FirestoreDeviceStore,
    FirestoreEvidenceStore,
    FirestoreProjectStore,
    InMemoryDeviceStore,
    InMemoryEvidenceStore,
    InMemoryProjectStore,
    ProjectStore,
)
from app.nonces import FirestoreNonceStore, InMemoryNonceStore, NonceService
from app.settings import Settings
from app.storage import DiskStorage, SupabaseStorage

_REPO_ROOT = Path(__file__).resolve().parents[3]


@dataclass
class Services:
    projects: ProjectStore
    devices: DeviceStore
    evidence: EvidenceStore
    nonces: NonceService
    storage: DiskStorage | SupabaseStorage
    cache: AnalysisCache
    signed_url_ttl_seconds: int


def build_services(settings: Settings, firebase_ready: bool) -> Services:
    use_memory = (
        os.environ.get("SUNDARBAN_STORE") == "memory"
        or "PYTEST_CURRENT_TEST" in os.environ
        or not firebase_ready
    )
    if use_memory:
        projects: ProjectStore = InMemoryProjectStore()
        devices: DeviceStore = InMemoryDeviceStore()
        evidence: EvidenceStore = InMemoryEvidenceStore()
        nonce_store = InMemoryNonceStore()
        cache_store = MemoryCache()
    else:
        from firebase_admin import firestore

        client = firestore.client()
        projects = FirestoreProjectStore(client)
        devices = FirestoreDeviceStore(client)
        evidence = FirestoreEvidenceStore(client)
        nonce_store = FirestoreNonceStore(client)
        cache_store = FirestoreCache(client)
    root = Path(settings.disk_storage_dir)
    if not root.is_absolute():
        root = _REPO_ROOT / root
    if settings.storage_backend == "supabase":
        storage: DiskStorage | SupabaseStorage = SupabaseStorage(
            settings.supabase_url or "",
            settings.supabase_secret_key or "",
            settings.supabase_storage_bucket,
        )
    else:
        storage = DiskStorage(root)
    return Services(
        projects=projects,
        devices=devices,
        evidence=evidence,
        nonces=NonceService(nonce_store, settings.nonce_ttl_seconds),
        storage=storage,
        cache=AnalysisCache(cache_store),
        signed_url_ttl_seconds=settings.signed_url_ttl_seconds,
    )
