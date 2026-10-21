# How to present Sundarban

Read this before the talk. The short version is at the top. The path list is at the bottom. Numbers below are copied from `paper/ASSETS.md`. Do not change them in the slides.

## The one-minute version

A person plants trees and sends a photo from their phone. The phone signs the photo at the moment it is taken, so a later fake is harder. A checker then looks at the photo, the place, and the form. If the project is approved, only hashes go onto a public Ethereum test network. Anyone can later upload a photo and see whether it is the one that was approved.

The research question is: which checker design catches dishonest submissions, and how much does the phone signature help?

## What each piece is, why it is there, and what you get

**Phone app** (`apps/mobile`). This is what the planter uses. The camera is inside the app, not the photo gallery. The phone asks for a one-time number, hashes the photo, and signs it with a key that stays on the phone. You get a submission that is tied to that moment. The hardware key needs an Android build. Expo Go cannot create it.

**Checker** (`services/verifier`). This is the server. It checks the signature, stores the photo in a private bucket, and runs one of the checker designs. You get an accept or a reason for rejection, and later a risk report. The designs are named C0 to C4. C0 is rules only and makes no model call. C1 is one model prompt. C2 is three copies of that prompt voting. C3 is specialist agents. C4 is those specialists plus the C0 tools.

**Admin site** (`apps/admin-web`). A reviewer signs in with Google. Only an account with the admin claim gets in. They see the queue, the photos, and the report, then approve, reject, or ask for another photo. After approval they seal the hashes and send them from MetaMask. You get a human decision and a public record.

**Chain** (`contracts/src/CarbonRegistry.sol`). The token is Carbon Credit, symbol CC. The chain stores hashes and a credit amount. It does not store the photo or a name. Registering the same data hash twice is rejected. The live test-network address is in `contracts/DEPLOYMENT.md`.

**Public check** (`apps/admin-web`, page `/verify`). No login. A visitor types a project id and can upload a photo. The page reads the chain and a public proof of hashes only. A matching photo is confirmed. A changed photo is not.

**Benchmark** (`bench/`). This is the experiment, not the app the planter uses. It runs the same checkers on a fixed set of real photos and attacks, and writes one JSONL file per run. You get the numbers for the paper. You do not get them by guessing.

## What the numbers say, in plain words

These are dev-split numbers. There is no test-split result yet. Do not say the experiment is finished.

**C0, rules only.** Source `bench/results/C0-dev.jsonl`. 68 submissions finished, 12 were skipped because the photo file was missing. Three runs. Paper ASR is 32.2%. That means 32.2% of the attacks were approved. False rejection of real projects is 0.0%. F1 is 0.808. This is the only full rules result.

**C1 Gemini file.** Source `bench/results/C1-dev.jsonl`. Only 9 finished rows, all class A1, and 12 skipped. Paper ASR on that slice is 0.0%. Do not say C1 beats C0. The file is not the full dev set.

**C1, C3, and C4 local demos.** Sources under `bench/results/demo/`. The model is `ollama/qwen2.5vl:3b`. These are for a demo when the paid Gemini key was not usable. They must not go in the paper as the result.

- C1 demo approved every attack. Paper ASR 100%.
- C3 demo paper ASR 23.7%, but it also rejected many real projects (FRR 66.7%).
- C4 demo paper ASR 16.9%, FRR 55.6%.

Lower ASR is better only when real projects are not thrown out. C3 and C4 caught more attacks than C0 on this demo and also rejected real plantings. That tradeoff is the point of the chart.

**A13 and A14** have no completed attacks in the files. Those photos still have to be taken. The steps are in `docs/guides/PHASE_8_PREREQUISITES.md`.

**Gas.** Source `bench/results/gas.json`. Register averaged 1095680 gas. Retire averaged 47721 gas. That is from a test contract, not the deployed address.

**Cache.** C0 recorded 0 cache hits in 204 completed rows (three runs of 68). The local demos recorded 3 hits in 68 rows. The partial C1 file recorded 9 hits in 9 rows. This is a count of the `cache_hit` field. It is not money saved.

**Tokens.** C0 and the partial C1 file recorded 0 tokens. The demo files recorded 143090, 504104, and 495068 tokens. There is no dollar cost in those files. Do not convert them to rupees or dollars on a slide.

## What is for the paper, the report, and what the project actually shows

**Research paper.** The question, the five checker designs, the attack list, and the dev numbers that come from `bench/results/C0-dev.jsonl` and, when a full billed run exists, the matching `C1` to `C4` files. Figures to use with a warning label are in `paper/figures/`. The draft text is `paper/Sundarban_Research_Paper_Draft.docx`. Empty cells in the tables mean that run has not been done. Leave them empty.

**Project report.** The system you built: phone, checker, admin, chain, and the public verify page. Use `docs/DEMO.md` for the live story: one real project issued, a reused photo flagged, a prompt-injection document flagged, and a second registration rejected by the contract. Use `docs/PRESENTATION.md` and `paper/figures/architecture.png` for the picture.

**What you can claim today.** A photo can be signed at capture. Rules can catch some attacks without a model, and they did not reject the nine real projects in the C0 file. A local model demo can be shown, and it both misses attacks and rejects real projects. An approved project can be sealed as hashes on Sepolia, and a stranger can check a photo against that record.

**What you cannot claim today.** You cannot claim which design is best. The paid full runs and the test split are not done. You cannot claim the phone signature's effect, because A13 and A14 are not in the result files yet. You cannot put the ollama numbers in the paper table.

## Suggested talk order

1. Show `paper/figures/architecture.png`. One sentence: the phone signs, the server checks, the chain stores hashes.
2. Show `paper/figures/attestation.png`. One sentence: the signature is over the photo and the place, and the chain never sees the photo.
3. Show the C0 row of `paper/tables/table2_table3.md`. Say 32.2% of attacks were approved and no real project in that file was rejected.
4. If you show C3 or C4, say out loud that they are a local demo, not the paper result, and point at the false rejections.
5. Open http://127.0.0.1:5173/verify with project `demo-issue`. Upload `scripts/demo-photo.jpg`, then the modified file.
6. Stop. Do not promise the test-split number.

## Where things live

| Path | What it is |
|---|---|
| `apps/mobile` | Planter's phone app |
| `apps/admin-web` | Reviewer site and the public `/verify` page |
| `services/verifier` | Checker API, rules, and model wrapper |
| `services/verifier/prompts` | Prompt text. Do not edit these before the paper runs |
| `services/verifier/credits.json` | Simplified credit formula. Not a certification |
| `contracts/src/CarbonRegistry.sol` | The token contract |
| `contracts/DEPLOYMENT.md` | Sepolia address and transaction hashes |
| `packages/contract-abi` | ABI, bytecode, and `deployment.json` |
| `packages/cv-crypto-ts` | Shared hashes for the phone and the admin site |
| `packages/test-vectors` | Shared test vectors for those hashes |
| `bench/data/manifest.jsonl` | The fixed list of submissions |
| `bench/results/C0-dev.jsonl` | Rules-only dev result. Safe to cite as C0 |
| `bench/results/C1-dev.jsonl` | Partial Gemini file. 9 completed rows |
| `bench/results/demo/` | Local-model demos. Not paper results |
| `bench/results/gas.json` | Gas from the contract test |
| `paper/ASSETS.md` | List of every figure and table and its source file |
| `paper/tables/` | Markdown and LaTeX tables |
| `paper/figures/` | Charts and diagrams |
| `paper/Sundarban_Research_Paper_Draft.docx` | Paper draft |
| `docs/DEMO.md` | How to run the live demo |
| `docs/guides/PHASE_8_PREREQUISITES.md` | What you must capture before the final experiment |
| `docs/CHANGELOG-PAPER.md` | Places where the build differs from the draft |
| `docs/PROJECT_STATE.md` | What is done and what is next |
