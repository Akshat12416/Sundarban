from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.firebase_app import init_firebase
from app.routes import router
from app.settings import get_settings
from app.wiring import build_services


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    app.state.firebase_admin = init_firebase(settings)
    app.state.settings = settings
    app.state.services = build_services(settings, app.state.firebase_admin == "ready")
    yield


app = FastAPI(title="Sundarban verifier", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://(127\.0\.0\.1|localhost):\d+",
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router)


@app.get("/health")
def health() -> dict[str, str]:
    settings = get_settings()
    return {
        "status": "ok",
        "storageBackend": settings.storage_backend,
        "firebaseProjectId": settings.firebase_project_id,
        "firebaseAdmin": getattr(app.state, "firebase_admin", "not_configured"),
    }
