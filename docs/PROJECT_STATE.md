# Sundarban Project State
Last updated (UTC): 2026-10-20 22:05 | by: Grok 4.7 | commit: 280ea07

## 1. Next step (read this first)
The user does `docs/guides/PHASE_3_PREREQUISITES.md` before the evidence service. First action: confirm `services/verifier/secrets/firebase-admin.json`, then set `STORAGE_BACKEND=supabase` and remove the duplicate `FIREBASE_PROJECT_ID` line.

The manifest generator is `python -m bench.generate --seed 42`. It reads `bench/data/raw/sources.csv` and `bench/data/attack_raw/a4/` (the task text said `attacks_raw`; the files are in `attack_raw`). Verified 2026-10-20: 40 real photos, 2 before_like, 3 after_like, 35 unclassified, 8 synthetic before files, 2 synthetic after files, 3 A4 items (2 fake-before, 1 fake-after), 2 ai_log mismatches. `python -m bench.validate` passed. A second generate matched `manifest.jsonl` byte for byte.

`packages/cv-crypto-ts` does not exist. The current vectors store accuracy as an integer field `accuracyM`, while the spec now requires a one-decimal string. `GET /v1/files/{evidenceId}` is specified and not implemented.

Evidence bytes stay off Firebase Storage. `STORAGE_BACKEND` defaults to `disk`. The cloud bucket is Supabase `evidence` in `ap-southeast-1`. Firestore region reported by the user is `us-central1`. Project id is `sundarban-a64ea`.

Do not copy `legacy/` into the new apps. The only admin files a later phase may copy, and then edit, are `legacy/admin-portal/src/components/Navbar.jsx`, `legacy/admin-portal/src/components/Footer.jsx`, and the card markup in `ApprovedProjects.jsx` and `RejectedProjects.jsx`.

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
| 2026-10-20 | Canonical JSON rejects floats. Latitude and longitude are 6-decimal strings. Accuracy is a one-decimal string. | Locked in `AGENTS.md` rule 7 and plan section 5.1. Current vectors still use integer `accuracyM`. |
| 2026-10-20 | Contributors read and write only their own projects until submission, and again while the status is `needs_more_evidence`. They cannot change status or write `leaf`. | Plan section 5.2. The emulator rules already allow those three statuses. |
| 2026-10-20 | `packages/cv-crypto-ts` is the TypeScript crypto package shared by the mobile app and the admin web. | Plan section 5.1 and `AGENTS.md` rule 7. Directory absent. Verified by a file search on 2026-10-20. |
| 2026-10-20 | `GET /v1/files/{evidenceId}` is admin-only and returns a short-lived signed URL. | Plan section 5.3. Not implemented. |
| 2026-10-20 | Legitimate benchmark items are real photographs. Evaluation is stateless and includes `registry_context`. The catalogue has no `pair_id`, so this generator splits by real-photo filename. | Plan section 5.9 still says `pair_id`. The deviation is in `docs/CHANGELOG-PAPER.md`. |

## 4. Phase status
| Phase | Status (not started / in progress / done) | Last commit | Notes |
|---|---|---|---|
| 0 Setup and audit | done | 48ea760 | Audit, tokens, screens, and the Phase 1 prerequisite guide are written. No application code. |
| 1 Scaffold and Firebase | done | 6858268 | Emulators, /health, Sepolia chain id, admin build, and vector tests ran on 2026-10-20. No Firebase Storage. |
| 2a Benchmark pilot | in progress | 280ea07 | Manifest generator done. No LLM calls. |
| 2b Benchmark full | not started | | |
| 3 Evidence service and cache | not started | | |
| 4a Verifiers C0-C2 and runner | not started | | |
| 4b Verifiers C3-C4 and metrics | not started | | |
| 5a Mobile shell | not started | | Screen map is `docs/design/SCREENS.md`. |
| 5b Attestation and capture | not started | | |
| 5c Mobile status and polish | not started | | |
| 6 Contracts | not started | | |
| 7a Admin review | not started | | |
| 7b Issue flow and verify page | not started | | |
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
| Supabase storage guide | `docs/guides/SUPABASE_STORAGE.md` | | | Env names are set. There is no upload code. A one-off HTTP check on 2026-10-20 uploaded `healthcheck/test.txt`, fetched a signed URL (200), got 400 on the public URL, deleted the object, and listed the prefix as empty. |
| Firebase emulators | repo root | `JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home PATH="$JAVA_HOME/bin:$PATH" firebase emulators:start --only auth,firestore` | | Verified 2026-10-20 19:16 UTC: "All emulators ready". Then stopped. |
| Verifier | `services/verifier` | `cd services/verifier && .venv/bin/uvicorn app.main:app --reload` | `cd services/verifier && .venv/bin/pytest` | Verified 2026-10-20 19:16 UTC: pytest pass; `GET /health` 200, `storageBackend` disk, admin ready. Server then stopped. |
| Admin web | `apps/admin-web` | `cd apps/admin-web && npm run dev` | `cd apps/admin-web && npm run build` | Verified 2026-10-20 19:16 UTC: dev server HTTP 200; build exit 0. No test script. Dev server then stopped. |
| Contracts | `contracts` | | `cd contracts && .venv/bin/pytest` | Verified 2026-10-20: Sepolia chain id 11155111 and OpenZeppelin v5 import check passed. |
| Test vectors | `packages/test-vectors` | `cd packages/test-vectors && .venv/bin/python generate.py` | `cd packages/test-vectors && .venv/bin/pytest` | Verified 2026-10-20: 7 tests passed. 10 cases in each of the four groups. |
| Benchmark manifest | `bench/data/manifest.jsonl` | `python -m bench.generate --seed 42` | `python -m bench.validate` | Verified 2026-10-20: validate pass; second generate byte-identical. |

## 6. Environment and accounts (names only, never values)
| Item | Where it lives | Set up? | Notes |
|---|---|---|---|
| Firebase project id | `FIREBASE_PROJECT_ID` in `services/verifier/.env` | yes | Value is non-empty and is not `carbonvault-c2f6a`. It matches `VITE_FIREBASE_PROJECT_ID`. Not checked against the Firebase console this session. |
| Service account file | `services/verifier/secrets/firebase-admin.json` | yes | Symlink to the downloaded Admin SDK JSON. Gitignored. `GOOGLE_APPLICATION_CREDENTIALS` points here. Admin init returned ready. |
| Web Firebase config | `services/verifier/secrets/firebase-web.env` | yes | Keys present: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`. No storage bucket variable. The file had been a JS snippet; rewritten to env lines on 2026-10-20. Values not verified against the console. |
| Supabase URL, secret, bucket | `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `SUPABASE_STORAGE_BUCKET`, `SUPABASE_DB_PASSWORD` in `services/verifier/.env` | yes | Bucket value is `evidence`. Region reported by the user: `ap-southeast-1`. Not called by the verifier yet. |
| GEMINI_API_KEY and GEMINI_MODEL | `services/verifier/.env` and `bench/.env` | yes | Both names are non-empty in both files. The API was not called this session. |
| Sepolia RPC and deployer key variables | `contracts/.env` | partial | No `contracts/.env`. The placeholder test used the public default RPC and read chain id 11155111. `DEPLOYER_PRIVATE_KEY` is unset. |
| Expo project id and app ids | | no | |

## 7. Interfaces
- API endpoints implemented: `GET /health`. Specified and not implemented: `GET /v1/files/{evidenceId}` (admin only, short-lived signed URL).
- Firestore collections and rules status: `firestore.rules` and `firestore.indexes.json` are loaded by the emulator. Project id `sundarban-a64ea`. Region `us-central1` was reported by the user and was not re-opened in the console this session.
- Contract: not deployed. OpenZeppelin v5 is installed under `contracts/node_modules` for later imports. Old ABI stays in `legacy/` and is not used.
- Evidence object store: verifier default `disk`. Supabase bucket `evidence` is configured in env and not called yet. Firestore field remains `storagePath`.
- Test vectors: `packages/test-vectors/vectors.json`, Python reference and pytest. `packages/cv-crypto-ts` is absent. Vectors use integer `accuracyM`; the spec now requires a one-decimal accuracy string.

## 8. Experiments and results
No model id pinned, no prompt versions, nothing frozen, no runs, no files in `bench/results/`. H1 to H4 are not started.

## 9. Waiting on the user
- [x] Firebase project id is in `services/verifier/.env` and is not the old project. Console visit not re-checked this session.
- [x] Web config is in `services/verifier/secrets/firebase-web.env` as env lines. Google sign-in Enabled was not re-checked this session.
- [x] Firestore region reported as `us-central1`.
- [x] Supabase env vars are set. Bucket name `evidence`. Region reported as `ap-southeast-1`.
- [x] Service account path resolves and Admin SDK initialises.
- [x] Firebase CLI is logged in. `firebase projects:list` included `sundarban-a64ea` on 2026-10-20.
- [x] 40 catalogue rows are in `bench/data/raw/sources.csv`. Raw image files are gitignored.
- [ ] Phase 3 checks in `docs/guides/PHASE_3_PREREQUISITES.md`: set `STORAGE_BACKEND=supabase` and delete the extra `FIREBASE_PROJECT_ID` line.

## 10. Gotchas and failed approaches (newest first)
- 2026-10-20: A4 files are in `bench/data/attack_raw/a4/`, not `attacks_raw`. Seven of the ten synthetic files did not become items: the stripped name missed the catalogue, or the real photo was not the required class. Two `ai_log.csv` rows warn and do not stop the run.
- 2026-10-20: No Supabase client exists. `SUPABASE_SERVICE_KEY` is unset. The live check used `SUPABASE_SECRET_KEY` over HTTP. Public object fetch returned 400. After delete, an authenticated GET returned 400; a prefix list returned count 0.
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
| 2026-10-20 | Grok 4.7 | Deterministic manifest from the real catalogue and pre-made A4 files. Validator, licences, paper changelog, Phase 3 guide. | 280ea07 |
| 2026-10-20 | Grok 4.7 | Firebase CLI installed with Homebrew after global npm hit EACCES. Guide step 6 updated. | cbdb97f |
| 2026-10-20 | Grok 4.7 | Evidence files decided as Supabase Storage. Added `docs/guides/SUPABASE_STORAGE.md` and `docs/decisions.md`. Firebase guide no longer asks for Blaze. | 17bc4b6 |
| 2026-10-20 | Grok 4.7 | Legacy audit, design tokens, Figma screen map, Phase 1 prerequisite guide, gitignore for `services/verifier/secrets/`, renamed `docs/PLAN-SPEC.md`. No application code. `legacy/` untouched. | 48ea760 |

## 12. Paper impact
`docs/CHANGELOG-PAPER.md` records category-matched legitimate pairs, the two A4 directions, and filename splits. The draft still describes same-site growth pairs, AI-generated after images only, and `pair_id` resampling.
