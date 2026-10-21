# Sundarban Project State
Last updated (UTC): 2026-10-21 05:59 | by: Grok 4.7 | commit: see session log

## 1. Next step (read this first)
Work on `main`. Phase 7b is in. The public page is http://127.0.0.1:5173/verify. Issuance steps are in `docs/DEMO.md`. Before Phase 8, follow `docs/guides/PHASE_8_PREREQUISITES.md` yourself: A13 screen recaptures, A14 mock-location captures, the experiment log, frozen model and prompts, and a cost budget. Do not start a paper run, and do not pass `--split test`.

The C3 and C4 dev demos both finished on 2026-10-21. Logs end with `wrote` for `bench/results/demo/C3-dev-ollama.jsonl` and `bench/results/demo/C4-dev-ollama.jsonl`. Metrics from `python -m bench.metrics` on those files: C3 completed 68, skipped 12, ASR 0.288, FRR 0.667, F1 0.785. C4 completed 68, skipped 12, ASR 0.169, FRR 0.556, F1 0.867. Both are `ollama/qwen2.5vl:3b` demo output. Do not put them in a paper table. Do not start another bench run. Do not pass `--split test`.

The Android development build is still waiting on the user. Do not start it unless they ask. From `apps/mobile`, after `eas login`: `npx eas-cli@latest build --profile development --platform android`. Expo Go cannot create the key. Device checks after install (accepted photo, replayed nonce, modified image) are not done.

## 2. Project in brief
- What: citizen-submitted afforestation evidence verified by LLM agents and tools, anchored on-chain, with capture-time attestation.
- Research question: how well do verifier designs resist adversarial submissions, and how much does attestation reduce attack success?
- In scope / out of scope: see the SCOPE block in AGENTS.md.
- Paper: paper/ (every [TBD] must be filled from bench/results only).

## 3. Locked decisions
| Date | Decision | Why |
|---|---|---|
| 2026-10-20 | Reuse audit follows `docs/PLAN-SPEC.md` section 2. | User task. Recorded in `docs/LEGACY_AUDIT.md`. |
| 2026-10-20 | Admin "dashboard cards" means the cards in `ApprovedProjects.jsx` and `RejectedProjects.jsx`. `AdminDashboard.jsx` is the waste queue and is dropped. | The plan name and the file disagree. The code reads `WasteProjects`. Verified by reading `legacy/admin-portal/src/pages/AdminDashboard.jsx`. |
| 2026-10-20 | Product colours are the mint set `#1DBF73`, `#ACEEC7`, page wash `#EDFCF3`. Landing forest `#228B22` is not the app palette. | Plan section 5.7 says the app keeps the Figma look. Tokens in `docs/design-tokens.md`. |
| 2026-10-20 | No admin component is an unchanged copy into `apps/admin-web`. | Each file has old routes, old brand, GSAP, or a missing dependency. See audit section 5. |
| 2026-10-20 | `docs/PLAN-SPEC.md` had a trailing space in the filename. Renamed to `docs/PLAN-SPEC.md`. | The handoff protocol tells every agent to read that path. |
| 2026-10-20 | Evidence files use a private Supabase bucket `evidence`. Firebase stays Auth + Firestore on Spark. | Owner asked for a free store. Firebase Storage needs Blaze. Paper says object storage and names no vendor. Recorded in `docs/decisions.md`. |
| 2026-10-20 | Phase 1 `STORAGE_BACKEND` default is `disk`. `supabase` is allowed. Firebase Storage is not. | Local runs must not need Blaze. See `docs/decisions.md`. |
| 2026-10-20 | Canonical JSON rejects floats. Latitude and longitude are 6-decimal strings. Accuracy on new uploads is a one-decimal string named `accuracy`. | Locked in `AGENTS.md` rule 7 and plan section 5.1. Vectors still use integer `accuracyM`. The hash libraries accept both shapes and reject floats. |
| 2026-10-20 | Contributors read and write only their own projects until submission, and again while the status is `needs_more_evidence`. They cannot change status or write `leaf`. | Plan section 5.2. The emulator rules already allow those three statuses. |
| 2026-10-21 | `packages/cv-crypto-ts` is the TypeScript crypto package. Python lives in `services/verifier/cv_crypto`. | Plan section 5.1. Both passed `packages/test-vectors/vectors.json` on 2026-10-21. |
| 2026-10-21 | `GET /v1/files/{evidenceId}` is admin-only and returns a short-lived signed URL. | Plan section 5.3. Verified by `tests/test_evidence_api.py`: a contributor token gets 403. |
| 2026-10-20 | Legitimate benchmark items are real photographs. Evaluation is stateless and includes `registry_context`. The catalogue has no `pair_id`, so this generator splits by real-photo filename. | Plan section 5.9 still says `pair_id`. The deviation is in `docs/CHANGELOG-PAPER.md`. |
| 2026-10-21 | `ISSUER_ROLE` on the Sepolia `CarbonRegistry` is the deployer, because `ISSUER_ADDRESS` was empty. | `contracts/.env` has only the deployer key. Recorded in `docs/decisions.md`. |

## 4. Phase status
| Phase | Status (not started / in progress / done) | Last commit | Notes |
|---|---|---|---|
| 0 Setup and audit | done | 48ea760 | Audit, tokens, screens, and the Phase 1 prerequisite guide are written. No application code. |
| 1 Scaffold and Firebase | done | 6858268 | Emulators, /health, Sepolia chain id, admin build, and vector tests ran on 2026-10-20. No Firebase Storage. |
| 2a Benchmark pilot | in progress | 280ea07 | Manifest generator done. No LLM calls. |
| 2b Benchmark full | not started | | |
| 3 Evidence service and cache | done | 0fea73e | Nonce, device, evidence, and admin file routes. Cache tested: a second analysis of the same evidence makes no model call. Live Supabase test is skipped unless `SUPABASE_LIVE_TEST=1`. |
| 4a Verifiers C0-C2 and runner | in progress (demo done) | 4326bb4 | C0 dev re-run: 68 completed. C1 ran on dev with local `qwen2.5vl:3b` (demo, `bench/results/demo/`). Gemini C1 and C2 paper runs still need a billed key. No test split. |
| 4b Verifiers C3-C4 and metrics | demo done | 8aa346b | C3 and C4 dev demos finished 2026-10-21 under `bench/results/demo/`. Not paper results. No test split. |
| 5a Mobile shell | in progress | 197d4cc | Expo SDK 58 shell in `apps/mobile`. Web checked 2026-10-21 at localhost:8081. Phone Expo Go not confirmed. |
| 5b Attestation and capture | in progress | c6a4892 | EAS development profile and `cv-keystore` are written. Cloud build not started. Phone checks of accept, replay, and modified image are not done. |
| 5c Mobile status and polish | not started | | |
| 6 Contracts | done | 448c2de | Sepolia `CarbonRegistry` at `0xFC1F37fB7449619917Dd78431bB827A18E11C480`. Issuer role checked on that address. Gas in `bench/results/gas.json` is from a separate test deployment. |
| 7a Admin review | in progress | 4a92488 | Queue, project page, and Google admin gate are in `apps/admin-web`. Browser check on 2026-10-21 used the Auth emulator. Phone publish was not run on a device. |
| 7b Issue flow and verify page | done | a63013f | Seal, confirm, reconcile, and `/verify`. Demo project `demo-issue` confirmed on Sepolia. Browser accepted `scripts/demo-photo.jpg` and rejected the modified file. |
| 8 Experiments | not started | | |
| 9 Paper and report | not started | | |

## 5. What exists and how to run it
| Component | Path | Run command | Test command | Verified? |
|---|---|---|---|---|
| Legacy admin (read only) | `legacy/admin-portal` | not run this session | none | Inventory verified by reading `package.json` and `package-lock.json` on 2026-10-20. App was not started. |
| Legacy contributor, buyer, landing | `legacy/contributor-portal`, `legacy/buyer-portal`, `legacy/landing-page` | not run | none | Same. Classified drop. |
| Audit | `docs/LEGACY_AUDIT.md` | | | Written this session. |
| Tokens | `docs/design-tokens.md` | | | Written this session from CSS and PNG samples. |
| Screens | `docs/design/SCREENS.md` | | | Verified against Figma metadata and PNG exports, file `shpkaFOkntqpC8YNVw4KEb`, 2026-10-20. |
| Phase 1 setup guide | `docs/guides/PHASE_1_PREREQUISITES.md` | | | Billing facts checked 2026-10-20. Step 4 now skips Firebase Storage. |
| Supabase storage guide | `docs/guides/SUPABASE_STORAGE.md` | | | Env names are set. The verifier now uploads with `httpx` when `STORAGE_BACKEND=supabase`. Unit tests mock that HTTP API. The optional live test was not run on 2026-10-21. |
| Phase 4 setup guide | `docs/guides/PHASE_4_PREREQUISITES.md` | | | Written 2026-10-21. Local model check printed `same_id True` and `flash_class True` for `gemini-3.8-flash`. AI Studio was not opened. The cost cap is not set. |
| Firebase emulators | repo root | `JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home PATH="$JAVA_HOME/bin:$PATH" firebase emulators:start --only auth,firestore` | | Verified 2026-10-20 19:16 UTC: "All emulators ready". Then stopped. |
| Verifier | `services/verifier` | `cd services/verifier && .venv/bin/uvicorn app.main:app --reload` | `cd services/verifier && .venv/bin/pytest` | Verified 2026-10-21: 19 passed, 1 skipped (`SUPABASE_LIVE_TEST` unset). `GET /health` still returns disk. |
| Admin web | `apps/admin-web` | `cd apps/admin-web && npm run dev` | `cd apps/admin-web && npm run build` | Verified 2026-10-21: build exit 0. Browser: Google gate rejects a missing admin claim, queue filters, project page shows the report and attested badge, and request-more-evidence wrote `needs_more_evidence` in the emulator. |
| Contracts | `contracts` | `cd contracts && .venv/bin/python scripts/compile.py` then `.venv/bin/python -m scripts.deploy` | `cd contracts && .venv/bin/pytest tests/test_sepolia.py` | Verified 2026-10-21: `pytest tests/test_registry.py` passed on Sepolia (1 passed). Deployed `0xFC1F37fB7449619917Dd78431bB827A18E11C480`. `name` Carbon Credit, symbol CC, 18 decimals. `ISSUER_ROLE` and `DEFAULT_ADMIN_ROLE` are true for `0xe7b5680c7eA21F9fFa2989D7E459608f22b716Fa`. Etherscan skipped: no `ETHERSCAN_API_KEY`. |
| Test vectors | `packages/test-vectors` | `cd packages/test-vectors && .venv/bin/python generate.py` | `cd packages/test-vectors && .venv/bin/pytest` | Python reference unchanged. Service and TypeScript libraries matched `vectors.json` on 2026-10-21. |
| TypeScript crypto | `packages/cv-crypto-ts` | | `cd packages/cv-crypto-ts && node --experimental-strip-types --test src/index.test.ts` | Verified 2026-10-21: 5 passed, including Merkle proofs. Node v22.16.0. |
| Benchmark generator | `bench/data/manifest.jsonl` | `python -m bench.generate --seed 42` | `python -m bench.validate` | Verified 2026-10-20: validate pass. |
| Contributor app | `apps/mobile` | `cd apps/mobile && npx expo start` | `cd apps/mobile && npx tsc --noEmit` | Web verified 2026-10-21: sign-in, sample home, wizard type step, credit history. Typecheck passed. Expo Go on the phone not confirmed. |
| C0 pilot | `bench/results/C0-dev.jsonl` | `services/verifier/.venv/bin/python -m bench.run --config C0 --split dev --runs 3` | `services/verifier/.venv/bin/python -m bench.metrics --input bench/results/C0-dev.jsonl` | Verified 2026-10-21 after the alias fix: ASR 0.322, FRR 0.000, 68 completed, 12 skipped. |
| C1 demo (local model) | `bench/results/demo/C1-dev-ollama.jsonl` | `ollama serve`, then `services/verifier/.venv/bin/python -m bench.run --config C1 --split dev --runs 1` with `LLM_PROVIDER=ollama` | `services/verifier/.venv/bin/python -m bench.metrics --input bench/results/demo/C1-dev-ollama.jsonl` | Verified 2026-10-21: 68 completed, all approve. Not a paper result. |
| C3 and C4 demo | `bench/results/demo/C3-dev-ollama.jsonl` | already run | `services/verifier/.venv/bin/python -m bench.metrics --input bench/results/demo/C3-dev-ollama.jsonl` | Verified 2026-10-21: C3 ASR 0.288 FRR 0.667; C4 ASR 0.169 FRR 0.556. 68 completed, 12 skipped. Demo only. |
| Paper tables | `bench/metrics.py` | `services/verifier/.venv/bin/python -m bench.metrics --tables --results bench/results --split dev` | covered by `tests/test_phase4b.py` | Verified 2026-10-21: C0 filled from `C0-dev.jsonl`. C2, C3, C4, and every +A row print `no result file`. |
| Phase 5 prerequisites | `docs/guides/PHASE_5_PREREQUISITES.md` | the user follows the guide | | Written 2026-10-21. Expo Go, EAS, Android Studio, and the phone health check were not run. |

## 6. Environment and accounts (names only, never values)
| Item | Where it lives | Set up? | Notes |
|---|---|---|---|
| Firebase project id | `FIREBASE_PROJECT_ID` in `services/verifier/.env` | yes | Value is non-empty and is not `carbonvault-c2f6a`. It matches `VITE_FIREBASE_PROJECT_ID`. Not checked against the Firebase console this session. |
| Service account file | `services/verifier/secrets/firebase-admin.json` | yes | Symlink to the downloaded Admin SDK JSON. Gitignored. `GOOGLE_APPLICATION_CREDENTIALS` points here. Admin init returned ready. |
| Web Firebase config | `services/verifier/secrets/firebase-web.env` | yes | Keys present: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`. No storage bucket variable. The file had been a JS snippet; rewritten to env lines on 2026-10-20. Values not verified against the console. |
| Supabase URL, secret, bucket | `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `SUPABASE_STORAGE_BUCKET`, `SUPABASE_DB_PASSWORD` in `services/verifier/.env` | yes | Bucket value is `evidence`. Region reported by the user: `ap-southeast-1`. `STORAGE_BACKEND` is still `disk`, so the service does not call Supabase until that is changed. |
| GEMINI_API_KEY and GEMINI_MODEL | `services/verifier/.env` and `bench/.env` | yes | Model id `gemini-3.8-flash` in both files. `countTokens` was called for the C1 and C2 dry-runs. `generateContent` was not called. |
| LLM provider (demo) | `LLM_PROVIDER`, `OLLAMA_MODEL`, `OLLAMA_HOST` in `bench/.env` | yes | Set to `ollama`, `qwen2.5vl:3b`, `http://127.0.0.1:11434` on 2026-10-21. Ollama 0.40.6 installed with Homebrew; model in `~/.ollama/models` (3.2 GB). Switch to `gemini` for paper runs. |
| Sepolia RPC and deployer key variables | `contracts/.env` | partial | No `contracts/.env`. The placeholder test used the public default RPC and read chain id 11155111. `DEPLOYER_PRIVATE_KEY` is unset. |
| Expo project id and app ids | | no | |

## 7. Interfaces
- API endpoints implemented: `GET /health`, `POST /v1/nonce`, `POST /v1/devices`, `POST /v1/projects/{id}/evidence`, `GET /v1/files/{evidenceId}` (admin only). Specified and not implemented: verify, report, seal, and chain confirm.
- Firestore collections and rules status: `firestore.rules` denies client access to `evidenceIndex` and `analysisCache`. The Admin SDK writes those. Project id `sundarban-a64ea`. Region `us-central1` was reported by the user and was not re-opened in the console this session.
- Contract: not deployed. OpenZeppelin v5 is installed under `contracts/node_modules` for later imports. Old ABI stays in `legacy/` and is not used.
- Evidence object store: verifier default `disk`. Supabase uses plain `httpx` against the Storage API. No Supabase client library. Firestore keeps `storagePath`, `sha256`, and `phash`, not the image bytes.
- Test vectors: `packages/test-vectors/vectors.json`. Python implementation `services/verifier/cv_crypto`. TypeScript implementation `packages/cv-crypto-ts`. Vectors use integer `accuracyM`; upload metadata uses a one-decimal `accuracy` string.
- Cache: Firestore collection `analysisCache` in the service, SQLite via `bench/analysis_cache.py` for bench runs. Key is `sha256(evidence) + agent id + prompt version + model id`.
- Duplicate lookup: `app.duplicates.DuplicateIndex` takes an explicit registry. It is not global state. The bench runner passes one submission's `registry_context`.
- Verifiers: `verify(submission)` for C0, C1, C2, C3, and C4. `--attest` is the +A switch on C1–C4. Prompts `services/verifier/prompts/c1_v1.txt` and `c3_*_v1.txt`, `c4_*_v1.txt`. Schema `docs/schemas/agent_output.json`. `POST /v1/projects/{id}/verify` is still not wired to HTTP. `SENTINEL2_ENABLED` is unset. `VERIFIER_PARALLEL` is unset, so Ollama runs the specialists one at a time.
- Admin claim script: `scripts/set_admin_claim.py`. Unit-tested with a fake Admin SDK. Not run against the emulator or the live project this session.

## 8. Experiments and results
Model id in both env files: `gemini-3.8-flash`. The demo provider is `ollama/qwen2.5vl:3b`. Prompt versions: `c1-v1`, `c3-image-v1`, `c3-vegetation-v1`, `c3-geospatial-v1`, `c3-document-v1`, `c3-aggregator-v1`, the matching `c4-*-v1` files, rules `c0-v1`, switch `attest-v1`, floor `aggregate-v1`. Frozen after the 3-item probe. No test-split run. No complete Gemini C1 or C2 run. Paper-eligible result file: `bench/results/C0-dev.jsonl`. `bench/results/C1-dev.jsonl` is a partial Gemini file (9 completed, 12 skipped on its first run) and its Table 2 cells are only that partial file. `bench/results/demo/` is not a paper result. H1 to H4 are not started.

## 9. Waiting on the user
- [x] Firebase project id is in `services/verifier/.env` and is not the old project. Console visit not re-checked this session.
- [x] Web config is in `services/verifier/secrets/firebase-web.env` as env lines. Google sign-in Enabled was not re-checked this session.
- [x] Firestore region reported as `us-central1`.
- [x] Supabase env vars are set. Bucket name `evidence`. Region reported as `ap-southeast-1`.
- [x] Service account path resolves and Admin SDK initialises.
- [x] Firebase CLI is logged in. `firebase projects:list` included `sundarban-a64ea` on 2026-10-20.
- [x] 40 catalogue rows are in `bench/data/raw/sources.csv`. Raw image files are gitignored.
- [ ] Phase 3 checks in `docs/guides/PHASE_3_PREREQUISITES.md`: set `STORAGE_BACKEND=supabase` and delete the extra `FIREBASE_PROJECT_ID` line. Not re-checked this session. `STORAGE_BACKEND` was still `disk`.
- [x] C3 and C4 dev demos finished. Files are under `bench/results/demo/`. Not for the paper.
- [ ] Phase 5: follow `docs/guides/PHASE_5_PREREQUISITES.md`. Choose EAS or Android Studio. Fill `apps/mobile/.env` and do not commit it.
- [ ] Before paper runs: set `LLM_PROVIDER=gemini` in `bench/.env`.
- [ ] Phase 4 checks: `GEMINI_RUN_COST_CAP_USD` is 5 and `GEMINI_PRICE_TIER` is `paid` in both env files. The loaded key still receives the free-tier daily quota of 20. A billed-project key is still required before the C1 pilot.

## 10. Gotchas and failed approaches (newest first)
- 2026-10-21: `services/verifier/.env` contains two `FIREBASE_PROJECT_ID` lines. The first is shorter than `sundarban-a64ea`. `scripts/demo_issue.py` forces `sundarban-a64ea` after loading that file. Delete the short line by hand so every tool uses one id.
- 2026-10-21: The verifier allows browser calls from `127.0.0.1` and `localhost` only. A page on another origin cannot call it until that regex changes.
- 2026-10-21: `docs/guides/PHASE_7_PREREQUISITES.md` is not in the repo. The embedded browser blocks `signInWithPopup`, so the admin page falls back to `signInWithRedirect`. A Google account without `role=admin` is signed out. Contributors cannot set `submitted` in the rules; the verifier endpoint does that.
- 2026-10-21: `docs/guides/PHASE_6_PREREQUISITES.md` is not in the repo. solc 0.8.20 with `--base-path` and an absolute OpenZeppelin remapping reported the imports missing. Compilation uses a relative remapping from `contracts/`. Slither 0.11.6 reported 0 findings. Its install downgraded `web3` to 7.16.0; `web3` 8.0.0 was installed again afterwards. Re-running Slither needs `web3` 7.
- 2026-10-21: Signed-in accounts were all reading one shared sample list. Sample data stays on the sample button. A Firebase account now keeps its own projects and profile on the phone.
- 2026-10-21: The 3B model often returns `pass` from the aggregator while a specialist returned `flag`. aggregate-v1 keeps the more severe decision, so the report still rejects. The prompts were not rewritten after seeing that. C4 also keeps the C0 tool decision, which flagged `exact_duplicate` on all three probe rows.
- 2026-10-21: With `LLM_PROVIDER=ollama`, the first runner change also sent C0 output to `bench/results/demo/`. Fixed in 4326bb4: C0 ignores the provider. `qwen2.5vl:3b` approved all 68 dev items; the prompt was not tuned. Photos are shrunk to 896 px for the local model only.
- 2026-10-21: Billing was reported active, but the key in both `.env` files (prefix `AQ.Ab8RN6Jm2`, length 53) still returned `generate_content_free_tier_requests` limit 20. A test call was 429 with retry in about 5 hours 14 minutes. The C1 dev pilot was not started.
- 2026-10-21: 13 catalogue filenames are not on disk, so 36 dev submissions were skipped. The C0 rates are not rates over all 80 dev rows. C1 and C2 `generateContent` did not run: the paid estimates were above `GEMINI_RUN_COST_CAP_USD`. `--force` was not used.
- 2026-10-21: Pytest forces in-memory nonce, device, and evidence stores because `PYTEST_CURRENT_TEST` is set. A normal `uvicorn` process uses Firestore when the Admin SDK is ready. `scripts/set_admin_claim.py` loads `services/verifier/.env`, so `FIREBASE_AUTH_EMULATOR_HOST` sends it to the emulator. Unset that variable before setting a claim on the real project.
- 2026-10-21: `bench/injectors/` does not exist. A5, A10, A11 and A12 are built from legitimate items. `vegetation-Uganda.jpg` is forced to before-like in `bench/data/overrides.csv`.
- 2026-10-20: `SUPABASE_SERVICE_KEY` is unset. The secret name is `SUPABASE_SECRET_KEY`. A one-off HTTP check on 2026-10-20 uploaded, signed, and deleted an object. Public fetch returned 400. The verifier now uses the same HTTP API and does not call it while `STORAGE_BACKEND=disk`.
- 2026-10-20: Firestore emulator refused Java 17. `firebase-tools` requires Java 21. Installed `openjdk@21` with Homebrew and left it keg-only so `java` on PATH stays 17. The README command sets `JAVA_HOME` for the emulator only. Verified by "All emulators ready".
- 2026-10-20: `npm install -g firebase-tools` failed with EACCES because `/usr/local/lib/node_modules` is owned by root. Installed with `brew install firebase-cli` (15.34.0). Then `brew unlink node` so `node` stayed v22.16.0 at `/usr/local/bin/node`. Verified by `firebase --version` outside the sandbox.
- 2026-10-20: `services/verifier/secrets/firebase-web.env` had been filled by pasting the Firebase JavaScript snippet, so it was not a list of variables. Rewritten locally to `KEY=value` lines. The storage bucket line was left out on purpose.
- 2026-10-20: Supabase free projects pause after 7 days idle, and the file quota is 1 GB. Do not store `bench/` images there.
- 2026-10-20: `docs/PLAN-SPEC.md` was stored with a trailing space, so a normal path open failed. Renamed in this session. Verified by `git mv`.
- 2026-10-20: `legacy/admin-portal/src/components/animations/RotatingText.tsx` imports `framer-motion`, which is not in that app's `package.json`. Do not treat the animations folder as runnable.
- 2026-10-20: `legacy/admin-portal/src/photos/logo.jpg` is a watermarked Adobe Stock image. `nature.png` is solid black. Do not reuse them as brand assets.
- 2026-10-20: Hard-coded Firebase fallbacks live in the three `legacy/*/src/firebase.js` files. The values were not copied into docs. Do not copy the files.

## 11. Session log (newest first)
| Date | Agent | What changed | Commit |
|---|---|---|---|
| 2026-10-21 | Grok 4.7 | Seal, confirm, reconcile, public verify page, demo script, Phase 8 guide. | a63013f |
| 2026-10-21 | Grok 4.7 | Admin review queue, project page, and phone submit hand-off. | 4a92488 |
| 2026-10-21 | Grok 4.7 | C3 and C4 dev demos finished. Metrics recorded from the demo JSONL files. Not paper results. | this state commit |
| 2026-10-21 | Grok 4.7 | Saved the Sepolia deployment in `contracts/DEPLOYMENT.md` and fast-forwarded `main` to `phase6-contracts`. | fa485b9 |
| 2026-10-21 | Grok 4.7 | CarbonRegistry on Sepolia, Python compile and deploy, gas from test receipts, Slither 0 findings. | 448c2de |
| 2026-10-21 | Grok 4.7 | Android keystore module, attested capture, EAS development profile. Cloud build not started. | c6a4892 |
| 2026-10-21 | Grok 4.7 | C3, C4, +A switch, paper tables, Phase 5 guide. Three-item Ollama probe only. | 7e11467, 8aa346b, 5e24d95 |
| 2026-10-21 | Claude Opus | Local Ollama provider in the LLM wrapper (demo only), C1 dev demo run, C0 dev re-run (68 completed), decision recorded. | 43b0324, 4326bb4, e1b8985 |
| 2026-10-21 | Grok 4.7 | Set the run cap to 5 and recorded that the loaded Gemini key is still on the free-tier daily quota. C1 pilot not started. | 972a03b |
| 2026-10-21 | Grok 4.7 | Noted that A8 and A9 have one dev item and no test item, which is expected. | f0b37d4 |
| 2026-10-20 | Grok 4.7 | Firebase CLI installed with Homebrew after global npm hit EACCES. Guide step 6 updated. | cbdb97f |
| 2026-10-20 | Grok 4.7 | Evidence files decided as Supabase Storage. Added `docs/guides/SUPABASE_STORAGE.md` and `docs/decisions.md`. Firebase guide no longer asks for Blaze. | 17bc4b6 |
| 2026-10-20 | Grok 4.7 | Legacy audit, design tokens, Figma screen map, Phase 1 prerequisite guide, gitignore for `services/verifier/secrets/`, renamed `docs/PLAN-SPEC.md`. No application code. `legacy/` untouched. | 48ea760 |

## 12. Paper impact
`docs/CHANGELOG-PAPER.md` records category-matched legitimate pairs, the two A4 directions, filename splits, composite same-site pairs, that A8 and A9 have no test-split items, the simulated `attestation` field, sequential C3 on local hardware, and the Table 2 ASR definition.
