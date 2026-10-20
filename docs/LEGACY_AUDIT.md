# Legacy reuse audit

Date: 2026-10-20. Scope is `legacy/` only. Nothing here was copied into a new app. `legacy/` was not modified.

Decisions follow Section 2 of `docs/PLAN-SPEC.md`. Where that section and the code disagree, the code wins, and the difference is noted in the row.

Effort is a planning judgment for a later phase, not a measured result.

## 1. Inventory

Each app is a Vite single-page app. Versions below are the lockfile resolutions (`package-lock.json`, lockfileVersion 3). `package.json` ranges are in parentheses when they differ.

| App | Path | UI | Resolved stack |
|---|---|---|---|
| Admin | `legacy/admin-portal` | React JSX pages, plus unused or decorative TSX animation files | React 19.1.1, React DOM 19.1.1, Vite 7.1.5 (declared ^7.1.2), Tailwind CSS 4.1.13 with `@tailwindcss/vite` 4.1.13, React Router 7.8.2, Firebase 12.2.1, ethers 6.15.0, GSAP 3.13.0, `@gsap/react` 2.1.2, react-countup 6.5.3 |
| Contributor web | `legacy/contributor-portal` | React JSX | React 19.1.1, React DOM 19.1.1, Vite 7.1.4 (declared ^7.1.2), Tailwind CSS 4.1.13, React Router 7.8.2, Firebase 12.2.1, ethers 6.15.0 |
| Buyer | `legacy/buyer-portal` | React JSX | React 19.2.4 (declared ^19.2.0), React DOM 19.2.4, Vite 7.3.1 (declared ^7.2.4), Tailwind CSS 4.1.18, React Router 7.13.0, Firebase 12.8.0 |
| Landing | `legacy/landing-page` | React 18 TSX, Anima export using shadcn-style tokens | React 18.3.1 (declared ^18.2.0), React DOM 18.3.1, Vite 6.3.6, Tailwind CSS 3.4.16, React Router 6.30.1 (declared ^6.8.1), GSAP 3.13.0, Framer Motion and `motion` ^12.23.12, Radix separator and slot, Embla |

Admin, contributor, and buyer import Tailwind 4 with `@import "tailwindcss"`. The landing page uses Tailwind 3 (`tailwind.config.js`, `tailwind.css`).

Admin routes in `legacy/admin-portal/src/App.jsx`: `/` dashboard, `/approved`, `/rejected`, `/plantation-execution`, `/plantation-verification`. The navbar also links to `/marketplace`, and that route does not exist.

Contributor routes: `/login`, `/`, `/new-project`, `/projects`, `/transfers`, `/marketplace`.

Buyer routes: `/` dashboard, `/orders`.

Landing routes: `/`, `/login-type-selector`, `/contributor-login`, `/company-login`, `/admin-login`, `/marketplace`.

## 2. Top-level classification

Every direct child of `legacy/` is in this table.

| Item | Path | Decision | Reason | Effort to adapt |
|---|---|---|---|---|
| Admin portal | `legacy/admin-portal` | keep | Same React 19 + Vite + Tailwind 4 stack as `apps/admin-web`. Keep the layout shell and the approved/rejected card layout. Child rows below say what inside it is rewrite or drop. | Medium for the shell and cards. The data layer is Realtime Database and is not kept. |
| Contributor portal | `legacy/contributor-portal` | drop | Contributors use the Expo app. Marketplace, transfers, and the web login flow are out of scope. The field list in `src/pages/NewProject.jsx` is recorded in section 4 as a specification, not as code to copy. | None. Building the mobile wizard is new work. |
| Buyer portal | `legacy/buyer-portal` | drop | Buyer portal and marketplace are out of scope. | None. |
| Landing page | `legacy/landing-page` | drop | Not needed for the paper or the demo. Different React and Tailwind major versions from the admin app. | None. |
| Legacy TODO | `legacy/TODO.md` | drop | A leftover note about renaming a landing-page menu label. | None. |

## 3. Admin portal children and cross-cutting items

| Item | Path | Decision | Reason | Effort to adapt |
|---|---|---|---|---|
| Navbar | `legacy/admin-portal/src/components/Navbar.jsx` | keep | Layout component on the target stack. It has no Firebase import. The labels and routes still point at Marketplace and the plantation pages, and the logo is a watermarked stock image. | Small. Replace the link list and the logo. |
| Footer | `legacy/admin-portal/src/components/Footer.jsx` | keep | Static layout component. The visible brand is CarbonChain, and the About, Contact, and social hrefs are placeholders. It references Font Awesome classes and no Font Awesome stylesheet is loaded. | Small. Replace the brand string and drop the dead links. |
| Approved-project cards and detail | `legacy/admin-portal/src/pages/ApprovedProjects.jsx` | keep | This is the dashboard-card and project-detail layout Section 2 means. It reads Realtime Database path `Projects`, renders base64 images, and shows phone and email. | Medium. Keep the card structure. Replace the data source, image loading, and personal fields. |
| Rejected-project cards and detail | `legacy/admin-portal/src/pages/RejectedProjects.jsx` | keep | Same card layout as the approved page, filtered to rejected projects. Same data-layer problems. | Medium. Same adaptation as the approved page. |
| Admin dashboard page | `legacy/admin-portal/src/pages/AdminDashboard.jsx` | drop | The page reads `WasteProjects`, classifies waste with `IMPACT_FACTOR`, and writes waste statuses (`SUBMITTED`, `AI_VERIFIED`, `APPROVED`, `POOL_LOCKED`, `POOL_ALLOCATED`). Section 2's "dashboard cards" are the plantation cards in the approved and rejected pages, not this file. | None. A new review queue is written against the new statuses. |
| Plantation verification | `legacy/admin-portal/src/pages/PlantationVerification.jsx` | rewrite | Sets credits from the tree count, stores a JSON string as the data hash, uses old status names (`Approved`, `AFTER_UPLOADED`), and calls the old contract. | Large. The issue flow is rebuilt around seal and confirm. |
| Plantation execution | `legacy/admin-portal/src/pages/PlantationExecution.jsx` | rewrite | Same contract and hash problems. Passes project type `WASTE` into the contract call. | Large. Same rebuild as verification. Do not keep the waste type. |
| GSAP animation components | `legacy/admin-portal/src/components/animations/` (`StaggeredMenu.tsx`, `SplitText.tsx`, `CircularGallery.tsx`, `ScrollStackCards.tsx`, `RotatingText.tsx`, `AnimatedButton.tsx`) | drop | Decorative. They add GSAP, and `SplitText` imports `gsap/SplitText`. `RotatingText.tsx` imports `framer-motion`, which is not in this app's `package.json`. No admin route imports `StaggeredMenu`, `CircularGallery`, `ScrollStackCards`, `RotatingText`, or `AnimatedButton`. Approved and rejected pages do import `SplitText`. | None, unless a later pass has spare time. |
| Contract ABI and address | `legacy/admin-portal/src/abi/CarbonCreditToken.json` and the address constant in the two plantation pages | drop | The new `CarbonRegistry` contract replaces both. | None. |
| Base64 image helpers | `legacy/admin-portal/src/utils/imageUtils.js`, `legacy/admin-portal/src/utils/projectUtils.js`, `legacy/buyer-portal/src/utils/imageUtils.js` | drop | Images become Cloud Storage files addressed by `storagePath` and `sha256`. These helpers prefix a data-URL onto a base64 string. | None. |
| Firebase config with hard-coded fallbacks | `legacy/admin-portal/src/firebase.js`, `legacy/contributor-portal/src/firebase.js`, `legacy/buyer-portal/src/firebase.js` | drop | Each file falls back to a hard-coded web config when env vars are empty, including the old project id `carbonvault-c2f6a` and a Realtime Database URL. The key values are not repeated in this audit. | None. Use a new Firebase project. Lock down or delete the old project when the move is finished. |
| Waste flow | `legacy/admin-portal/src/pages/AdminDashboard.jsx`, `legacy/buyer-portal/src/components/WasteCard.jsx`, waste and hybrid contract types in the plantation pages | drop | Afforestation only. | None. |
| Admin env example | `legacy/admin-portal/.env.example` | drop | Lists `VITE_FIREBASE_DATABASE_URL` for Realtime Database. The new apps do not use that product. Variable names that still apply are restated in `docs/guides/PHASE_1_PREREQUISITES.md`. | None. |
| Admin Vercel metadata | `legacy/admin-portal/.vercel/` | drop | Hosting metadata for the old portal. | None. |
| Bundled photos | `legacy/admin-portal/src/photos/` | drop | `logo.jpg` is a watermarked Adobe Stock image. `nature.png` and the sampled `placeholder.png` are solid black. `countdown.png` is a black line icon on white. | None. |

## 4. Field list kept as a specification

From `legacy/contributor-portal/src/pages/NewProject.jsx`. This is the only contributor-portal content Section 2 keeps, and it is kept as a list.

| Field | Later home |
|---|---|
| Role: individual or organisation | Mobile wizard step 1. Organisation, not Company. |
| Tree type | Project form. |
| Number of trees | Project form. |
| Area in acres | Project form. Stored internally as hectares. |
| Tree category: Sapling, Young, Mature | Project form, as the tree choice. |
| Organisation name, organisation id | Organisation branch of the wizard. |
| Description | Project form. |
| Before images, minimum 3 | In-app camera capture, not a file picker. |
| Status string `waiting_for_after_images` | New status `awaiting_after`. |
| UPI or MetaMask in one field | Drop. Wallet address lives on the profile. No UPI. |

## 5. Admin components and an unchanged copy

Destination is `apps/admin-web`, which does not exist yet. "Unchanged" means the file can be placed there and used as the new admin UI without editing its source.

Every component under `legacy/admin-portal/src/components/` needs an edit, or it is on the drop list.

| Component | Copy unchanged? | Why |
|---|---|---|
| `Navbar.jsx` | No | Compiles with React Router and has no Firebase import, but the link list includes Marketplace, Plantation Execution, and Plantation Verification, and the logo path points at the stock image. |
| `Footer.jsx` | No | Compiles with no data imports, but the brand, hrefs, and Font Awesome classes are the old portal. |
| `AnimatedButton.tsx` | No | No Firebase and no router, and no page imports it. It is in the animation drop list. |
| `StaggeredMenu.tsx`, `SplitText.tsx`, `CircularGallery.tsx`, `ScrollStackCards.tsx` | No | GSAP dependencies the new app is not taking. |
| `RotatingText.tsx` | No | Imports `framer-motion`, which this package does not depend on, and no page imports it. |

The page files are not unchanged copies either. Approved and rejected pages are the card layouts to adapt. The dashboard and both plantation pages stay out.

## 6. What the next implementation pass may copy

After this audit, a later phase may copy and then edit:

- `legacy/admin-portal/src/components/Navbar.jsx`
- `legacy/admin-portal/src/components/Footer.jsx`
- The card and detail markup in `ApprovedProjects.jsx` and `RejectedProjects.jsx`

That copy is not part of this task. Do not copy `firebase.js`, the ABI, the plantation pages, the image helpers, the photos, or anything under `contributor-portal`, `buyer-portal`, or `landing-page`.
