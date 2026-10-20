# Sundarban Project State
Last updated (UTC): 2026-10-20 07:44 | by: Grok 4.7 | commit: 48ea760

## 1. Next step (read this first)
The user does the click-by-click setup in `docs/guides/PHASE_1_PREREQUISITES.md`. First action: create a new Firebase project. Do not reuse project id `carbonvault-c2f6a`.

After that, the next agent starts Phase 1 (scaffold and Firebase). Do not copy `legacy/` until then. The only admin files the audit allows a later phase to copy, and then edit, are `legacy/admin-portal/src/components/Navbar.jsx`, `legacy/admin-portal/src/components/Footer.jsx`, and the card markup in `ApprovedProjects.jsx` and `RejectedProjects.jsx`.

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

## 4. Phase status
| Phase | Status (not started / in progress / done) | Last commit | Notes |
|---|---|---|---|
| 0 Setup and audit | done | 48ea760 | Audit, tokens, screens, and the Phase 1 prerequisite guide are written. No application code. |
| 1 Scaffold and Firebase | not started | | Blocked on the user finishing `docs/guides/PHASE_1_PREREQUISITES.md`. |
| 2a Benchmark pilot | not started | | |
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
| Phase 1 setup guide | `docs/guides/PHASE_1_PREREQUISITES.md` | | | Billing facts checked against Firebase and Cloud Storage docs on 2026-10-20. The user's Firebase project was not created by this session. |

## 6. Environment and accounts (names only, never values)
| Item | Where it lives | Set up? | Notes |
|---|---|---|---|
| Firebase project id | `FIREBASE_PROJECT_ID` in `services/verifier/.env` | no | User creates a new project. Old id `carbonvault-c2f6a` is not reused. |
| Service account file | `services/verifier/secrets/firebase-admin.json` | no | Gitignored. Env var `GOOGLE_APPLICATION_CREDENTIALS` in `services/verifier/.env`. |
| Web Firebase config | `services/verifier/secrets/firebase-web.env` | no | Names: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`. No `DATABASE_URL`. |
| GEMINI_API_KEY and GEMINI_MODEL | `.env` files | no | Not part of the Phase 1 prerequisite guide. |
| Sepolia RPC and deployer key variables | `contracts/.env` | no | |
| Expo project id and app ids | | no | |

## 7. Interfaces
- API endpoints implemented: none.
- Firestore collections and rules status: schema is specified in `docs/PLAN-SPEC.md` section 5.2. No rules file in the repo. User will create an empty production-mode database.
- Contract: not deployed. Old ABI at `legacy/admin-portal/src/abi/CarbonCreditToken.json` is dropped.
- Test vectors: `packages/test-vectors` does not exist yet.

## 8. Experiments and results
No model id pinned, no prompt versions, nothing frozen, no runs, no files in `bench/results/`. H1 to H4 are not started.

## 9. Waiting on the user
- [ ] Create a new Firebase project and write the id into `services/verifier/.env` as `FIREBASE_PROJECT_ID`.
- [ ] Enable Google sign-in and store the web config in `services/verifier/secrets/firebase-web.env`.
- [ ] Create Firestore in production mode and note the region.
- [ ] Choose Blaze plus a budget alert, or stay on the emulator until a demo needs a real bucket.
- [ ] Save the service account key at `services/verifier/secrets/firebase-admin.json`.
- [ ] Install the Firebase CLI, run `firebase login`, and confirm `firebase projects:list`.

## 10. Gotchas and failed approaches (newest first)
- 2026-10-20: `docs/PLAN-SPEC.md` was stored with a trailing space, so a normal path open failed. Renamed in this session. Verified by `git mv`.
- 2026-10-20: `legacy/admin-portal/src/components/animations/RotatingText.tsx` imports `framer-motion`, which is not in that app's `package.json`. Do not treat the animations folder as runnable.
- 2026-10-20: `legacy/admin-portal/src/photos/logo.jpg` is a watermarked Adobe Stock image. `nature.png` is solid black. Do not reuse them as brand assets.
- 2026-10-20: Hard-coded Firebase fallbacks live in the three `legacy/*/src/firebase.js` files. The values were not copied into docs. Do not copy the files.

## 11. Session log (newest first)
| Date | Agent | What changed | Commit |
|---|---|---|---|
| 2026-10-20 | Grok 4.7 | Legacy audit, design tokens, Figma screen map, Phase 1 prerequisite guide, gitignore for `services/verifier/secrets/`, renamed `docs/PLAN-SPEC.md`. No application code. `legacy/` untouched. | 48ea760 |

## 12. Paper impact
No paper claim changed. `docs/CHANGELOG-PAPER.md` does not exist yet and was not required.
