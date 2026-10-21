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

## 2026-10-21 — Evidence layer

The verifier stores original bytes through `STORAGE_BACKEND` (`disk` or `supabase`). SHA-256 is of those original bytes. The perceptual hash is a 64-bit difference hash of the JPEG whose long edge is 1600 pixels. Firestore records keep the path and the hashes, plus the capture metadata, signature, and leaf. EXIF is read before that resize and is not copied into Firestore.

`packages/test-vectors` still uses an integer field named `accuracyM`. New uploads require `latitude` and `longitude` as 6-decimal strings and `accuracy` as a one-decimal string. The canonical encoder rejects floats and still accepts the integer fields in the vectors.

The duplicate index takes the registry as an argument. It does not keep a process-wide registry, because a bench run builds `registry_context` per submission.

The analysis cache key is the concatenation `sha256(evidence) + agent id + prompt version + model id`. Pytest uses in-memory nonce, device, and evidence stores. A normal server process uses Firestore when the Admin SDK is ready. Bench runs use SQLite through `bench/analysis_cache.py`. Signed URLs last `SIGNED_URL_TTL_SECONDS` (120).

## 2026-10-21 — Verifiers C0, C1, and C2

C0 is rules only. C1 is one multimodal call. C2 is three C1 calls with agent ids `c2-1`, `c2-2`, and `c2-3`, the same prompt version, and the same model id. Temperature is 0. A majority is more than half of the three decisions. Without a majority the decision is review.

The pilot split is `dev`. The runner does not look at `test`. A missing photo is a skipped row, not a pass or a reject. Detected, for the metrics script, means `recommendation` is `reject`. ASR is attacks not detected divided by attacks. FRR is legitimate items detected divided by legitimate items. Agreement is the share of completed submissions whose runs all have the same decision.

The cost gate reads `MAX_RUN_COST`, then `GEMINI_RUN_COST_CAP_USD`. The price table is `bench/prices.json`, copied from the Gemini pricing page on 2026-10-21. The default tier is the paid standard rate. `GEMINI_PRICE_TIER=free` selects the published free-tier rate of zero. The output token count in an estimate is the configured ceiling of 1024 per call, not a measured response. `--dry-run` counts input tokens and does not call `generateContent`. An estimate above the cap exits 2 unless `--force` is set.

## 2026-10-21 — Contributor shell stays on Expo Go

Phase 5a uses Expo SDK 58 and Expo Router. Sign-in is email and password because that works in Expo Go. Google sign-in and the hardware signing key wait for the development build. Screens read a fake data source, so the shell opens before Firestore or the verifier is reachable. The API client uses `EXPO_PUBLIC_API_URL`, and also accepts `EXPO_PUBLIC_VERIFIER_URL` when the first name is empty. Firestore is not opened against production. It connects only when `EXPO_PUBLIC_FIRESTORE_EMULATOR_HOST` is set.




## 2026-10-21 — Local demo provider (not a paper configuration)

Paid Gemini calls were not available before the presentation, so the one LLM wrapper gained a second generator. `LLM_PROVIDER=gemini` (the default) is unchanged and is the only provider for paper results. `LLM_PROVIDER=ollama` sends the same prompt version, the same JSON schema (Ollama `format`), temperature 0 and seed 0 to a local open-weight model (`OLLAMA_MODEL`, default `qwen2.5vl:3b`) at `OLLAMA_HOST`. Pydantic validation, logging and the cache are shared. The cache model id is `ollama/<model>`, so local and Gemini answers never share a cache entry. Photos sent to the local model are shrunk to an 896-pixel long edge because full-size photos overflow its context.

With a local provider the runner skips the cost gate (the cost is zero), skips the 15-second Gemini pacing, writes to `bench/results/demo/<config>-<split>-<provider>.jsonl`, and adds `provider` and `model_id` to each line. Files under `bench/results/demo/` are demo output. They must not appear in a paper table. C1 and C2 paper runs still need `LLM_PROVIDER=gemini` and a billed key.

## 2026-10-21 — C3, C4, and the +A switch

C3 is five model calls: image forensics, vegetation change, geospatial, document, then an aggregator. The document agent receives no photos. The image agent receives no document text. `VERIFIER_PARALLEL` unset means sequential when `LLM_PROVIDER=ollama`, and parallel otherwise. `VERIFIER_PARALLEL=1` forces parallel on either provider.

C4 uses the same roles with tool output in the prompt. Tools are the C0 checks, split so each agent sees only its own finding types. The geospatial tool is the curated species-region table plus coordinate checks. `sentinel2_lookup` returns `enabled: false` unless `SENTINEL2_ENABLED` is set, and the enabled branch returns no index and makes no network call.

aggregate-v1, frozen before the dev probe: the report decision is the more severe of the aggregator, every specialist, and, for C4, the C0 tool decision. Severity is flag, then review, then pass. Prompt files are `c3_*_v1` and `c4_*_v1`. They were not edited after seeing model output.

+A is `--attest` on C1–C4. It is not a C0 mode. The manifest field `attestation` stands in for Phase 5. `unattested` and `invalid` (and any other value) become a flag with no model call. `valid` continues into the verifier. A1–A4 are `unattested`. Other generated rows are `valid`.

`--limit` requires `--output`, so a three-item probe cannot replace a split file. Paper tables read `bench/results/{config}-{split}.jsonl` and `{config}A-{split}.jsonl` only. Demo files are excluded unless `--include-demo` is passed.
