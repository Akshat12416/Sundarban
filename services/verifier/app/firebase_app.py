import firebase_admin
from firebase_admin import credentials

from app.settings import Settings, resolve_credentials


def init_firebase(settings: Settings) -> str:
    """Initialise the Admin SDK from the service account file.

    Returns 'ready' or 'not_configured'. A path that does not point at a file
    is a configuration error. An empty path is allowed so /health can run
    before the secret exists.
    """
    if firebase_admin._apps:
        return "ready"
    raw = settings.google_application_credentials
    if not raw:
        return "not_configured"
    path = resolve_credentials(raw)
    if not path.is_file():
        raise FileNotFoundError(
            f"GOOGLE_APPLICATION_CREDENTIALS does not point at a file: {raw}"
        )
    cred = credentials.Certificate(str(path))
    firebase_admin.initialize_app(cred, {"projectId": settings.firebase_project_id})
    return "ready"
