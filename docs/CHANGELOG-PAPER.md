# Paper changelog

## 2026-10-21

The benchmark generator in `bench/generate.py` changes two claims in the draft (Section V and Table 1).

1. Legitimate before/after items are category-matched, not same-site. The catalogue has no genuine same-site before/after pairs. A before-like photo and an after-like photo from different places are paired only when both remain after the A4 partners are reserved. Where the draft says pairs show credible growth on the same plot, or that scarce pairs may be generated and labelled synthetic, that text should say the legitimate photographs are real and the pairing is by category.

2. A4 has two directions. A synthetic before with a real after, and a real before with a synthetic after. Both were made in the Gemini app, not through the paid API, and each file is logged in `bench/data/attack_raw/a4/ai_log.csv`. Table 1 currently describes only an AI-generated after image.

The catalogue also has no `pair_id`. Dev/test assignment is by real-photo filename, and an A4 item inherits the split of its real half. Where the draft and the spec say splits and resampling use `pair_id`, the implemented unit is that filename until a real pair id exists.

## 2026-10-21

Five catalogue photos are side-by-side composites of one site. The generator cuts them into before and after halves under `bench/data/derived/` and uses those halves as legitimate same-site pairs. They take priority over category-matched pairs. The earlier entry still applies to every other legitimate pair: those remain category-matched, not same-site.

## 2026-10-21

A8 (species unsuitable for the region) and A9 (altered ownership document) each have only 1 item, and that item is in the dev split. The test split has 0 of each. Only one real photo in the catalogue is left for each class after the other attacks are built. Test-split metrics for A8 and A9 will be unavailable or statistically meaningless in the Phase 8 results. That is expected, not a bug. Do not treat a missing test number for those two classes as a failed run.

## 2026-10-21

The metrics script defines the pilot scores. The positive class is attack. Detected means the report recommendation is `reject`. ASR is attacks not detected, divided by attacks. FRR is legitimate items detected, divided by legitimate items. Precision, recall, and F1 use that same detected label. Agreement is the fraction of completed submissions whose runs share one decision. Rows with a missing photo are skipped and are not in those rates. The pilot split is dev. Prompts are not changed from test-split results, and this entry does not record a test-split number.

## 2026-10-21

The +A condition is simulated until the phone signs evidence. Each manifest row has `attestation`: `unattested` for A1–A4 and `valid` for every other row, including A13 and A14, which the draft says pass the attested path. The value `invalid` exists for the switch and is not written by the generator. With +A, `unattested` and `invalid` are flagged before any model call. This is not a device signature. Phase 5 replaces the field.

C3 runs four specialists (image, vegetation, geospatial, document) and then an aggregator. On local hardware they run one after another, so latency is the sum of the calls. `VERIFIER_PARALLEL=1` is the parallel schedule in Section IV-D. C4 adds the C0 checks as tools. The geospatial tool reads the curated region table and does not call a live geocoder. Sentinel-2 stays off unless `SENTINEL2_ENABLED` is set, and that flag still does not call a live service. The aggregate-v1 rule takes the more severe of the aggregator decision, the specialist decisions, and, for C4, the tool decision.

C0 now flags a document whose text contains "ignore previous instructions" or "ignore all previous" as `prompt_injection`. Result files written before this change do not include that rule. Do not mix those files with a later C0 run.

Table 2 and Table 3 in the metrics script use the draft's ASR: attacks whose recommendation is `approve`, divided by attacks. The pilot summary above still uses "not reject". FRR in the tables is legitimate items rejected or marked high risk. A cell is printed only when a result file for that configuration exists.

