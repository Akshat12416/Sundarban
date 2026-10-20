# Decisions

## 2026-10-20 — Evidence files live in Supabase Storage

Firebase Auth and Firestore stay on the Spark plan. Photographs and documents are stored in a private Supabase bucket named `evidence`. The FastAPI verifier writes the bytes. The phone still uploads only to the verifier.

Why: a new Firebase project cannot create a Cloud Storage bucket without the Blaze plan. Supabase’s free plan includes 1 GB of file storage and a 50 MB per-file cap, with no card. The paper describes “object storage” and does not name a vendor. The leaf hash is over the image bytes, the metadata, and the signature, so the store does not change the attestation protocol or the experiment.

Not chosen: upgrading Firebase to Blaze. That can stay inside Cloud Storage Always Free in a US region, and it keeps one vendor. It still requires a billing account. The project owner asked for a free store instead.

Limits to respect: do not put the benchmark corpus in the bucket (1 GB). Free projects pause after one week without use. The secret key stays in `services/verifier/.env` and never in the mobile app or the admin web.

## 2026-10-20 — Phase 1 storage default is disk

The verifier setting `STORAGE_BACKEND` defaults to `disk`. Allowed values are `disk` and `supabase`. Firebase Storage is not a value. Local development writes under `services/verifier/data/`, which is gitignored. The Supabase bucket remains the cloud store for a later phase. The Admin SDK is pointed at the Auth and Firestore emulators by `FIRESTORE_EMULATOR_HOST` and `FIREBASE_AUTH_EMULATOR_HOST`.

## 2026-10-20 — Canonical JSON rejects floats

`packages/test-vectors/reference.py` is the reference encoder: object keys sorted at every level, UTF-8, no whitespace, `json.dumps(..., separators=(",", ":"), ensure_ascii=False)`. Floats are rejected. Latitude and longitude are strings with exactly six digits after the decimal, so Python and TypeScript produce the same bytes. This is the encoding named in plan section 5.1.

## 2026-10-20 — Who may write a project

Firestore rules allow a contributor to create and update only their own project, and only while its status is `draft`, `awaiting_after`, or `needs_more_evidence`. They cannot change `status`, `ownerUid`, or the server fields (`evidenceRoot`, `dataHash`, `parcelHash`, `reportHash`, `creditsEstimated`, `chainState`). Evidence creates are allowed in those same statuses and must not include `leaf`. `needs_more_evidence` stays writable because the recapture screen adds photos without letting the contributor set the decision. Reports, nonces, leaves, devices, chain rows, and transfer rows are server writes. The Admin SDK bypasses these rules. Role is the custom claim `role`.
