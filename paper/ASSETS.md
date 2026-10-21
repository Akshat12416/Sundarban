# Paper assets

Every number in these files was printed by `python -m bench.metrics` or read from `bench/results/gas.json`. Nothing was typed in by hand. Regenerate with:

```bash
MPLCONFIGDIR=/tmp/mpl services/verifier/.venv/bin/python paper/build_assets.py
```

The Mermaid PNGs are rendered from the `.mmd` files with `@mermaid-js/mermaid-cli`.

Two ASR definitions exist in the metrics script. Do not mix them.

- The pilot summary (`render`) uses ASR = attacks not rejected / attacks.
- Tables 2 and 3, and the charts, use paper ASR = attacks approved / attacks.

C3 and C4 files are local `ollama/qwen2.5vl:3b` demos. They are not paper results. C2, C4+A, and the other `+A` files do not exist. `bench/results/C1-dev.jsonl` has 9 completed rows and 12 skipped rows, all of them class A1. It is not a full dev split.

## Tables

| Asset | What it is | Source |
|---|---|---|
| `paper/tables/table2_table3.md` | Table 2 and Table 3, paper files only | `bench/results/C0-dev.jsonl`, `bench/results/C1-dev.jsonl` |
| `paper/tables/table2_table3.tex` | The same cells in LaTeX | same two files |
| `paper/tables/table2_table3_with_demo.md` | Same tables, with C3 and C4 filled from the demo files | those two, plus `bench/results/demo/C3-dev-ollama.jsonl` and `bench/results/demo/C4-dev-ollama.jsonl` |
| `paper/tables/table2_table3_with_demo.tex` | LaTeX of the demo-filled tables | same |
| `paper/tables/pilot_summaries.md` | The other ASR definition, per file, including per-class detection | `C0-dev.jsonl`, `C1-dev.jsonl`, `demo/C1-dev-ollama.jsonl`, `demo/C3-dev-ollama.jsonl`, `demo/C4-dev-ollama.jsonl` |
| `paper/tables/gas.md` | Mean and range of `gasUsed` | `bench/results/gas.json` |
| `paper/tables/gas.tex` | The same gas cells in LaTeX | `bench/results/gas.json` |

## Figures

| Asset | What it is | Source |
|---|---|---|
| `paper/figures/asr_by_class.png` and `.svg` | Paper ASR by attack group. A blank slot means that file has no completed attacks in the group. | `C0-dev.jsonl`, `C1-dev.jsonl`, `demo/C3-dev-ollama.jsonl`, `demo/C4-dev-ollama.jsonl` |
| `paper/figures/tokens_versus_asr.png` and `.svg` | Sum of the `tokens` field on completed rows, against paper ASR. Dollar cost is not in the files, so this is not a dollar chart. | the five JSONL files listed under the pilot summaries |
| `paper/figures/cache_hits.png` and `.svg` | Share of completed rows with `cache_hit` true. The label is hits/completed rows. | the same five JSONL files |
| `paper/figures/architecture.mmd` and `architecture.png` | Where each program sits. No measured number. | the repository layout |
| `paper/figures/attestation.mmd` and `attestation.png` | Capture-time signing steps. No measured number. | `docs/PLAN-SPEC.md` section 5.1 |
