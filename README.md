# Sundarban

Afforestation evidence is checked by a verifier service and, after approval, anchored on Sepolia. Firebase provides Auth and Firestore. Evidence files use `STORAGE_BACKEND=disk` in development and a private Supabase bucket in the cloud. Firebase Storage is not used.

Legacy apps under `legacy/` are read-only. Do not import them.

## Commands

Run each one from the repository root unless the line says otherwise.

| Component | Command |
|---|---|
| Firebase emulators | `firebase emulators:start --only auth,firestore` |
| Verifier | `cd services/verifier && .venv/bin/uvicorn app.main:app --reload` |
| Verifier tests | `cd services/verifier && .venv/bin/pytest` |
| Admin web | `cd apps/admin-web && npm run dev` |
| Admin web build | `cd apps/admin-web && npm run build` |
| Contracts tests | `cd contracts && .venv/bin/pytest` |
| Test vectors | `cd packages/test-vectors && .venv/bin/pytest` |

First-time setup for a Python component is `python3 -m venv .venv && .venv/bin/pip install -r requirements.txt` inside that directory. Admin web is `cd apps/admin-web && npm install`. Contracts also need `cd contracts && npm install` so OpenZeppelin v5 is on disk for later Solidity imports.

Copy each `.env.example` to `.env`. The service account JSON stays in `services/verifier/secrets/` and is gitignored. With the emulator variables set, the Admin SDK does not talk to production Firestore.
