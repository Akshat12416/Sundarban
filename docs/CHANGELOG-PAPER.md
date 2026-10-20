# Paper changelog

## 2026-10-21

The benchmark generator in `bench/generate.py` changes two claims in the draft (Section V and Table 1).

1. Legitimate before/after items are category-matched, not same-site. The catalogue has no genuine same-site before/after pairs. A before-like photo and an after-like photo from different places are paired only when both remain after the A4 partners are reserved. Where the draft says pairs show credible growth on the same plot, or that scarce pairs may be generated and labelled synthetic, that text should say the legitimate photographs are real and the pairing is by category.

2. A4 has two directions. A synthetic before with a real after, and a real before with a synthetic after. Both were made in the Gemini app, not through the paid API, and each file is logged in `bench/data/attack_raw/a4/ai_log.csv`. Table 1 currently describes only an AI-generated after image.

The catalogue also has no `pair_id`. Dev/test assignment is by real-photo filename, and an A4 item inherits the split of its real half. Where the draft and the spec say splits and resampling use `pair_id`, the implemented unit is that filename until a real pair id exists.
