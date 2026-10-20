# Decisions

## 2026-10-20 — Evidence files live in Supabase Storage

Firebase Auth and Firestore stay on the Spark plan. Photographs and documents are stored in a private Supabase bucket named `evidence`. The FastAPI verifier writes the bytes. The phone still uploads only to the verifier.

Why: a new Firebase project cannot create a Cloud Storage bucket without the Blaze plan. Supabase’s free plan includes 1 GB of file storage and a 50 MB per-file cap, with no card. The paper describes “object storage” and does not name a vendor. The leaf hash is over the image bytes, the metadata, and the signature, so the store does not change the attestation protocol or the experiment.

Not chosen: upgrading Firebase to Blaze. That can stay inside Cloud Storage Always Free in a US region, and it keeps one vendor. It still requires a billing account. The project owner asked for a free store instead.

Limits to respect: do not put the benchmark corpus in the bucket (1 GB). Free projects pause after one week without use. The secret key stays in `services/verifier/.env` and never in the mobile app or the admin web.
