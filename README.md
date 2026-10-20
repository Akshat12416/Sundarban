# Sundarban

Afforestation evidence is checked by a verifier service and, after approval, anchored on Sepolia. Firebase provides Auth and Firestore. Evidence files use `STORAGE_BACKEND=disk` in development and a private Supabase bucket in the cloud. Firebase Storage is not used.

Legacy apps under `legacy/` are read-only. Do not import them.

## Commands

Run each one from the repository root unless the line says otherwise.

| Component | Command |
|---|---|
| Firebase emulators | `JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home PATH="$JAVA_HOME/bin:$PATH" firebase emulators:start --only auth,firestore` |
| Verifier | `cd services/verifier && .venv/bin/uvicorn app.main:app --reload` |
| Verifier tests | `cd services/verifier && .venv/bin/pytest` |
| Admin web | `cd apps/admin-web && npm run dev` |
| Admin web build | `cd apps/admin-web && npm run build` |
| Contracts tests | `cd contracts && .venv/bin/pytest` |
| Test vectors | `cd packages/test-vectors && .venv/bin/pytest` |
| Shared TypeScript crypto | `cd packages/cv-crypto-ts && npm test` |
| Admin claim | `python3 scripts/set_admin_claim.py --email you@example.com` |
| Verifier pilot | `services/verifier/.venv/bin/python -m bench.run --config C0 --split dev --runs 3` |
| Cost estimate | `services/verifier/.venv/bin/python -m bench.estimate_cost --config C1 --split dev --runs 1` |
| Metrics | `services/verifier/.venv/bin/python -m bench.metrics --input bench/results/C0-dev.jsonl` |

First-time setup for a Python component is `python3 -m venv .venv && .venv/bin/pip install -r requirements.txt` inside that directory. Admin web is `cd apps/admin-web && npm install`. Contracts also need `cd contracts && npm install` so OpenZeppelin v5 is on disk for later Solidity imports.

Copy each `.env.example` to `.env`. The service account JSON stays in `services/verifier/secrets/` and is gitignored. With the emulator variables set, the Admin SDK does not talk to production Firestore.

The Firestore emulator needs Java 21. This machine has JDK 21 from Homebrew, and it is not the default `java` (that one is 17). The emulator command above puts JDK 21 on `PATH` for that process only.
