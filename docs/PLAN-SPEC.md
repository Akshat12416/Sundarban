. Reuse triage (from the repo audit)
Old item
Decision
Reason
admin-portal layout, Navbar, Footer, dashboard cards, project detail views (React 19, Vite, Tailwind 4)
Keep and adapt in the new admin-web app
Working UI on the same stack; swap the data layer from Realtime Database to the new API and Firestore
admin-portal GSAP animation components (StaggeredMenu, SplitText, CircularGallery)
Drop unless time allows
Decorative, adds dependencies, not needed for the paper
admin-portal ABI JSON and hard-coded CONTRACT_ADDRESS
Drop
The new contract replaces both
PlantationVerification and PlantationExecution pages
Rewrite
They set credits = tree count, store a JSON string as dataHash and use old status names; the issue flow is rebuilt around seal and confirm
contributor-portal (web)
Drop
Contributors use the Android app only; reuse only the form field list from NewProject.jsx
buyer-portal and marketplace pages
Drop
Marketplace is out of scope
landing-page
Drop for now
Not needed for the paper or the demo
Waste flow, WASTE and HYBRID contract types, recycler steps
Scrap
Decided: afforestation only
Realtime Database schema, base64 images, loose location strings, mixed UPI-or-wallet field
Drop
Replaced by the Firestore schema, files in a private Supabase Storage bucket, and signed metadata
Firebase keys in the old firebase.js files
Never copy
New Firebase project; lock down or delete the old one when finished
Figma designs (forestgumps)
Keep as visual reference

5. Specifications every phase shares
5.1 Attestation protocol
Enrolment. The app generates an EC P-256 signing key through a small local Expo native module that wraps the Android Keystore (alias cv_device_key, purpose SIGN, SHA-256, not exportable). The module needs an Expo development build, because Expo Go cannot create hardware-backed keys. The app sends the public key to the server. The server stores it with the user ID and the security level it can establish.
Per photo. (1) App requests a single-use nonce for the project from POST /v1/nonce. (2) App captures through expo-camera only, never the image picker. (3) App computes h = SHA-256(image bytes) and builds metadata m containing latitude and longitude as strings with exactly 6 decimal places, accuracy in metres as a string with exactly 1 decimal place, capture time (UTC, ISO 8601), device ID, project ID and the nonce. (4) m is serialised as canonical JSON: keys sorted, UTF-8, no whitespace, and no floating-point numbers. (5) App signs ECDSA-SHA256 over h || SHA-256(m_canonical). (6) App uploads image, m and signature. The server stores the file in a private Supabase Storage bucket. (7) Server verifies the signature with the stored public key, the nonce (unused, unexpired, bound to the project), and that the location is within the configured radius of the declared parcel. (8) Accepted items get leaf = SHA-256(0x00 || h || SHA-256(m_canonical) || signature).
Merkle tree. Leaves in capture order. Internal node = SHA-256(0x01 || left || right). If a level has an odd count, duplicate the last node. The root is stored on-chain.
The TypeScript implementation of canonical JSON, the hashes and the Merkle tree lives in packages/cv-crypto-ts. The mobile app and the admin web import that package. They do not keep a second copy. Python uses the reference in packages/test-vectors. Both must pass those vectors.
Stretch (S1). Request hardware key attestation at enrolment by setting the server nonce as the attestation challenge, then have the server validate the certificate chain and record the security level (software, TEE or StrongBox). If you build this, the paper's Section IV-B and the future-work text change, so log it in CHANGELOG-PAPER.md and tell me so I can update the paper.
5.2 Firestore collections
• users/{uid}: name, email, role (contributor or admin, set by custom claim), walletAddress.
• devices/{deviceId}: uid, publicKey, securityLevel, enrolledAt.
• projects/{projectId}: ownerUid, form fields (species, treeCount, areaHa, region, description), parcel (polygon or centre plus radius), status, evidenceRoot, dataHash, parcelHash, reportHash, creditsEstimated, chainState.
• projects/{projectId}/evidence/{itemId}: kind (before, after, document), storagePath, sha256, phash, metadata, signature, attested (bool), leaf.
• nonces/{nonce}: projectId, uid, expiresAt, used.
• reports/{projectId}/versions/{n}: agent outputs, aggregator output, report hash, model id, prompt versions.
• chainTx/{txHash}: projectId, state (pending, submitted, confirmed, failed), network, contract, credits.
• transfers/{uid}/items/{id}: credit issuance history (marketplace listings are out of scope).
Rules: contributors read and write only their own projects until submission, and again while the status is needs_more_evidence; only admins change status; nobody except the server writes reports, nonces or leaves.
Evidence files live in a private Supabase Storage bucket, not in Firebase Storage. The server reads and writes them with SUPABASE_URL, SUPABASE_SECRET_KEY and SUPABASE_STORAGE_BUCKET. Those three variables are server-only. The secret key never appears in the mobile app, the admin web, logs, or git.
5.3 Verifier API (FastAPI)
• POST /v1/nonce: returns a single-use nonce for a project.
• POST /v1/devices: enrol a device public key.
• POST /v1/projects/{id}/evidence: multipart upload with metadata and signature; returns accepted or the rejection reason.
• POST /v1/projects/{id}/verify: runs the configured verifier, caches results, returns the report.
• GET /v1/projects/{id}/report: latest report.
• POST /v1/projects/{id}/seal: computes the Merkle root and the hashes to register on-chain.
• POST /v1/chain/confirm: records a confirmed transaction and updates chainState.
• GET /v1/files/{evidenceId}: admin only. Returns a short-lived signed URL for the object in the private Supabase bucket.
5.4 Agent output schema
Every agent returns JSON with agent, version, score (0 to 1, higher means more suspicious), decision (pass, review or flag), findings (list of objects with type, evidence reference and explanation) and confidence (0 to 1). The aggregator adds overall_risk (low, medium, high), recommendation (approve, review, reject or request_more_evidence) and the report hash. Invalid JSON is retried once, then counted as a flag and logged.
5.5 Contract interface
CarbonRegistry (ERC-20 with burn, AccessControl, Pausable): registerProject(owner, dataHash, evidenceRoot, parcelHash, reportHash, credits) restricted to the issuer role. It reverts if dataHash or parcelHash was used before, mints credits at 18 decimals, and emits ProjectRegistered. retire(amount, reason) burns the caller's tokens and emits CreditsRetired. The admin can pause. There is no marketplace contract in scope: CC tokens are plain transferable ERC-20 tokens, and escrow trading is future work.
5.6 Quantification
credits = trees x survivalRate x speciesGrowthFactor x years, converted to CO2e with a stated carbon fraction, then multiplied by (1 - uncertaintyDiscount) and (1 - bufferShare). All factors live in one config file with source notes (IPCC defaults). The output is labelled simplified and uncertified.
5.7 Mobile app flow and screen map
The app keeps the look of your Figma screens: mint green, rounded cards, black pill buttons, bottom navigation with a centre action button. The social feed, shop and bank-payout parts are out of scope, so those areas change as shown below.
Flow. Sign in with Google, then a one-time profile (name, phone, Individual or Organisation, wallet address). Device enrolment happens automatically and shows as a Device secured badge. From Home, New Project runs a five-step wizard: (1) type, (2) details, (3) documents, (4) parcel, (5) before photos. The project then waits as awaiting_after. Later the contributor captures after photos, the project becomes submitted, then under_review, then approved, rejected or needs_more_evidence, and finally credited.
Screen
From your design
Change
Sign-in
New
Google button and one line explaining that photos are captured in the app and signed
Home
Home
Keep the welcome header and wallet chip. Feeds, Events and Nearby tabs become My Projects and Credits. Feed cards become project cards (photo, species, acres, trees, status chip). Remove likes, comments and share
Create sheet
Home (Create)
Keep the Individual and Company choice as wizard step 1, and rename Company to Organisation
Project form
Individual and Organisation
Keep tree type, region, tree choice, area in acres and number of trees. Name, email and phone move to the profile. Upload Images becomes Capture Photos (in-app camera only). Land Record and MOU Document stay as document uploads. Acres convert to hectares internally
Parcel
New
No map SDK needed: a Set parcel centre button uses the phone's GPS while the contributor stands on the plot, plus a radius slider and the GPS accuracy shown
Capture
New
Camera with a GPS accuracy indicator, an attested tick on each thumbnail, at least 3 before photos, after photos later
My Projects and Project detail
Profile (Posts) and Home cards
Status timeline, evidence gallery with attested badges, the admin's decision and note. Contributors do not see agent findings or risk scores, so the verifier cannot be probed
Needs more evidence
New
Shows the admin's note and a Recapture button
Credit history
Transaction history
Keep the Ethereum card (total and this month). Replace the Bank Balance card with a Retired or Pending credits card. Rows show project, date, CC amount and a transaction link. Remove the Mode: Bank rows
Profile
Profile
Avatar, name, bio, wallet address entry, Verified badge on credited projects. Posts and Saved tabs become Projects and Drafts
Bottom navigation
All
Home, My Projects (replaces the shop icon), the centre New Project button, Credit history, Profile
Left out of the designs on purpose: the shop and cart, the INR balance and bank payouts, likes, comments and sharing, and the Events and Nearby tabs. The notification bell can show a simple list of status changes if time allows.
5.9 Benchmark
Legitimate items use real photographs only. Do not generate or synthesise a photograph and count it as legitimate.
Every submission is evaluated statelessly. The verifier input for each submission includes a registry_context field.
Dev/test splits are made by pair_id, so both members of a pair stay in the same split.
Statistics resample by pair_id.
5.8 docs/PROJECT_STATE.md template
The Phase 0 prompt creates this file from the template below. Every agent reads it at the start of a session and updates it after each sub-task.
# Sundarban Project State
Last updated (UTC): YYYY-MM-DD HH:MM | by: <agent or tool> | commit: <hash>

## 1. Next step (read this first)
Exact next action, the files involved, the commands to run, and whether the agent
or the user does it.

## 2. Project in brief
- What: citizen-submitted afforestation evidence verified by LLM agents and tools,
  anchored on-chain, with capture-time attestation.
- Research question: how well do verifier designs resist adversarial submissions,
  and how much does attestation reduce attack success?
- In scope / out of scope: see the SCOPE block in AGENTS.md.
- Paper: paper/ (every [TBD] must be filled from bench/results only).

## 3. Locked decisions
| Date | Decision | Why |
|---|---|---|

## 4. Phase status
| Phase | Status (not started / in progress / done) | Last commit | Notes |
|---|---|---|---|
| 0 Setup and audit | | | |
| 1 Scaffold and Firebase | | | |
| 2a Benchmark pilot | | | |
| 2b Benchmark full | | | |
| 3 Evidence service and cache | | | |
| 4a Verifiers C0-C2 and runner | | | |
| 4b Verifiers C3-C4 and metrics | | | |
| 5a Mobile shell | | | |
| 5b Attestation and capture | | | |
| 5c Mobile status and polish | | | |
| 6 Contracts | | | |
| 7a Admin review | | | |
| 7b Issue flow and verify page | | | |
| 8 Experiments | | | |
| 9 Paper and report | | | |

## 5. What exists and how to run it
| Component | Path | Run command | Test command | Verified? |
|---|---|---|---|---|

## 6. Environment and accounts (names only, never values)
| Item | Where it lives | Set up? | Notes |
|---|---|---|---|
| Firebase project id | | | |
| Service account file | services/verifier/secrets/ | | |
| GEMINI_API_KEY and GEMINI_MODEL | .env files | | |
| SUPABASE_URL, SUPABASE_SECRET_KEY, SUPABASE_STORAGE_BUCKET | services/verifier/.env | | Server only. |
| Sepolia RPC and deployer key variables | contracts/.env | | |
| Expo project id and app ids | | | |

## 7. Interfaces
- API endpoints implemented:
- Firestore collections and rules status:
- Contract: network, address, ABI path, roles:
- Test vectors: status in Python and in the mobile app:

## 8. Experiments and results
Model id, prompt versions, frozen or not, run dates, results files, status of H1 to H4.

## 9. Waiting on the user
- [ ] 

## 10. Gotchas and failed approaches (newest first)
- date: what failed, why, what to do instead

## 11. Session log (newest first)
| Date | Agent | What changed | Commit |
|---|---|---|---|

## 12. Paper impact
Pending paper changes, and a pointer to docs/CHANGELOG-PAPER.md.
