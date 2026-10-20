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

