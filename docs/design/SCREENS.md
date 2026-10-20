# Design screens

Source: Figma file `forestgumps` (`shpkaFOkntqpC8YNVw4KEb`), the five frames linked from `docs/design/FIGMA_LINKS.md`. Read on 2026-10-20 with the Figma metadata and a PNG export of each frame. Layer names in the file are often placeholders (`User Name`, `Caption`, `Time of upload`). The visible text below is what the export shows.

These frames are the contributor mobile app. The admin web has no frame in this file. Status names are the new project statuses from `docs/PLAN-SPEC.md` section 5.7: `draft`, `awaiting_after`, `submitted`, `under_review`, `approved`, `rejected`, `needs_more_evidence`, `credited`.

Shared chrome, on every frame:

| Component | What it shows | Status mapping |
|---|---|---|
| Top bar | Hamburger, a mint coin chip whose count reads `0`, and a bell (Home) or a gear (the other four frames). | The coin count is the contributor's credit total. It changes when a project becomes `credited`. The bell can later list status changes. The gear is settings, not a project status. |
| Bottom bar | Home, a shop cart, a centre pill, a clock, a person. | Home, My Projects (the cart icon is replaced), centre New Project, Credit history, Profile. The cart is out of scope. |
| Centre pill | `+ New Post` on Home, history, and profile. `Close` on both forms. | Opens the create step, which starts a `draft`. It is not itself a status. |

## Home

Node `174:831`. Frame name `Home`.

| | |
|---|---|
| Components | Welcome header, handle, filter tabs, feed cards, a Create sheet over the lower half, bottom bar. |
| Welcome | `Welcome Back!` and the handle `abharna@04`. |
| Tabs | `Feeds` (selected, black pill), `Events`, `Nearby`. |
| Card | Avatar, name (`Akshat Gour`), time (`08:39 am`), photo, caption, like count `1,964`, comment count `135`, share, bookmark. A second card is partly hidden behind the sheet. |
| Caption | `Plantation Project Of XYZ NGO Covering 2 Acres Of Land. Aims To Absorb X Tonnes Co2 Per Year.` |
| Create sheet | Title `Create`. Two buttons: `Individual`, `Company`. |

Data to keep: the signed-in name, and a list of that person's projects. Each card should show a photo, species, area, tree count, and a status chip.

Mapping:

| Design piece | New meaning | Statuses it can show |
|---|---|---|
| Feeds / Events / Nearby | Become two tabs: My Projects and Credits. | My Projects lists every status. Credits lists `credited` only. |
| Like, comment, share, bookmark, overflow menu | Removed. | None. |
| Feed card | Project card. | `draft`, `awaiting_after`, `submitted`, `under_review`, `approved`, `rejected`, `needs_more_evidence`, `credited`. |
| Create / Individual | Wizard step 1, individual. Starts a project. | Writes `draft`. |
| Create / Company | Same step, renamed Organisation. | Writes `draft`. |

## Transaction history

Node `2016:141`. Frame name `Transacrion history`.

| | |
|---|---|
| Components | Period menu, two summary cards, a month header, transaction rows, bottom bar. |
| Period | `This Month` menu. |
| Ethereum card | Dark mint. `Total Earned` `150CC`, `This Month` `150CC`. |
| Bank card | Light mint. `Total Earned` `₹5000`, `This Month` `₹5000`. |
| Month header | `September 2025`, total `150CC ₹50`. |
| Row | Avatar, name `Abharna`, `Received On` with a date and time, `Mode : Ethirium` or `Mode : Bank`, amount `50CC`, `100CC`, `₹3000`, or `₹2000`. |

Mapping:

| Design piece | New meaning | Statuses it can show |
|---|---|---|
| Ethereum card | Kept. Total credits and credits this month. | Totals of `credited` projects. |
| Bank card and rupee amounts | Replaced by a Retired or Pending card. No bank balance and no INR. | Pending issuance is `approved` and not yet `credited`. Retired is a burn, which is not one of the eight project statuses. |
| Mode: Ethirium rows | Kept as credit rows: project, date, CC amount, transaction link. | `credited`. |
| Mode: Bank rows | Removed. | None. |

## Profile

Node `2019:1105`. Frame name `Profile`.

| | |
|---|---|
| Components | Avatar, name, handle, bio, Edit Profile, three tags, Posts/Saved tabs, one post card with a Verified pill, an empty state sitting underneath the card in the file. |
| Identity | `Akshat Gour`, `@Akshat_12`. Bio: `Just A Random Person Trying To Bring Some Change In This World By His Efforts And Also Getting Rewarded At The Same Time :)`. |
| Tags | `Green Activist`, `Tech Lover`, `Carbon Credit`. |
| Tabs | `Posts` selected, `Saved`. |
| Card | Same plantation caption as Home, plus a mint `Verified` pill. |
| Empty state | `No Post Yet`, present in the frame under the sample card. |

Mapping:

| Design piece | New meaning | Statuses it can show |
|---|---|---|
| Avatar, name, bio | Profile. Add a wallet address field. | None. The profile is not a project. |
| Tags | Not project data. Leave them out unless they are a free-text bio. | None. |
| Edit Profile | Edits name, bio, and wallet address. | None. |
| Posts tab | Becomes Projects. | All eight statuses, as cards. |
| Saved tab | Becomes Drafts. | `draft`. |
| Verified pill | Shown on a project that has been issued credits. | `credited`. |
| Likes, comments, share, bookmark | Removed, same as Home. | None. |
| No Post Yet | Empty state for Projects or Drafts. | The empty list, not a status. |

## Individual project form

Node `2027:134`. Frame name `iPhone 16 - 4`. Visible title `Individual`.

| | |
|---|---|
| Components | Title, stacked fields, a document well, two action pills, bottom bar with Close. |
| Fields | `Name`, `Email Address`, `+91` and `Enter Phone`, `Tree Type`, `Region`, `Choose your tree`, `Area in Acers`, `No. of Trees`. |
| Document | Mint well labelled `Land Record`. |
| Actions | Black pill `Upload Images`. Green pill `Submit`. |

The spelling `Acers` is the label on the frame. The stored unit is acres, converted to hectares in the app.

Mapping:

| Field | New home | Status |
|---|---|---|
| Name, email, phone | One-time profile, not this form. | None. |
| Tree type, region, tree choice, area, tree count | Wizard step 2, details. | Stays `draft` until the wizard finishes. |
| Land Record | Wizard step 3, document upload. | `draft`. |
| Upload Images | Becomes Capture Photos, in-app camera only, at least 3 before photos. | Completing before photos sets `awaiting_after`. |
| Submit | Saves the before-photo step. It does not mean the verifier has the project. | `awaiting_after`, not `submitted`. `submitted` is the later after-photo handoff. |

## Organisation project form

Node `2027:234`. Frame name `iPhone 16 - 5`. Visible title `Organisation`.

Same chrome and the same field stack as Individual, plus:

| Extra component | What it shows |
|---|---|
| `Organisation Id` | Text field under the phone row. |
| `Organisation Name` | Text field under the id. |
| `MOU Document` | Mint document well, in the place of Land Record. |
| Submit | Not on this frame. The frame ends at `Upload Images` and the Close bar. |

Mapping matches the individual form. Organisation id and organisation name stay on this wizard. Name, email, and phone still move to the profile. MOU Document stays as a document upload. Upload Images is again before-photo capture and ends in `awaiting_after`.

Company on the Home create sheet is this screen. The button label becomes Organisation.

## Statuses these five frames do not show

The plan adds these screens because the Figma file has no frame for them. They are listed so the status set has a home.

| Screen | Statuses |
|---|---|
| Sign in with Google | None. Happens before a project exists. |
| Parcel centre and radius | `draft`. |
| After-photo capture | From `awaiting_after` to `submitted`. |
| Project detail timeline | All eight, one project at a time. Contributors do not see agent findings or risk scores. |
| Needs more evidence | `needs_more_evidence`, with the admin note and a Recapture button. Recapture returns the project toward `submitted`. |
| Admin decision | Admin sets `approved`, `rejected`, or `needs_more_evidence` from `under_review`. |
| Credit issuance | `approved` then `credited` after the chain confirm. |

`under_review` is the state after `submitted`, while the verifier and the admin have the project. No Figma frame shows that waiting state. The My Projects card chip is where it appears.
