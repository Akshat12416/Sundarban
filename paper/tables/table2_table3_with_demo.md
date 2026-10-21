These C3 and C4 cells are from local ollama files. They are not paper results.

Numbers are the text printed by `python -m bench.metrics --tables`.

Table 2. Overall results (dev split, mean ± sd across runs).
ASR = attacks with recommendation approve / attacks, in percent.
FRR = legitimate items with recommendation reject or risk high / legitimate items, in percent.
F1 uses detected = recommendation reject. Agreement is one figure across runs, so its sd is n/a.
A missing file is printed as 'no result file'. No cell is estimated.
| Configuration | ASR (%) | FRR (%) | F1 | Agreement (%) | Calls / project | Latency (s) |
| --- | --- | --- | --- | --- | --- | --- |
| C0 rules only | 32.2 ± 0.0 | 0.0 ± 0.0 | 0.808 ± 0.000 | 100.0 ± n/a | 0.000 ± 0.000 | 0.000 ± 0.000 |
| C1 single prompt | 0.0 ± n/a | n/a | 1.000 ± n/a | 100.0 ± n/a | n/a | 0.000 ± n/a |
| C2 consensus (k=3) | no result file | no result file | no result file | no result file | no result file | no result file |
| C3 specialist agents | 23.7 ± n/a | 66.7 ± n/a | 0.785 ± n/a | 100.0 ± n/a | 5.000 ± n/a | 54.553 ± n/a |
| C4 specialist + tools | 16.9 ± n/a | 55.6 ± n/a | 0.867 ± n/a | 100.0 ± n/a | 5.000 ± n/a | 46.859 ± n/a |
| C1 + A | no result file | no result file | no result file | no result file | no result file | no result file |
| C2 + A | no result file | no result file | no result file | no result file | no result file | no result file |
| C4 + A | no result file | no result file | no result file | no result file | no result file | no result file |
files: C0 rules only: completed 68 skipped 12 runs 3; C1 single prompt: completed 9 skipped 12 runs 1; C3 specialist agents: completed 68 skipped 12 runs 1; C4 specialist + tools: completed 68 skipped 12 runs 1

Table 3. Attack success rate by class, percent (dev split, mean ± sd across runs).
ASR = attacks in the group with recommendation approve / attacks in the group.
| Class | C0 | C1 | C2 | C3 | C4 | C4 + A |
| --- | --- | --- | --- | --- | --- | --- |
| A1–A4 provenance | 25.0 ± 0.0 | 0.0 ± n/a | no result file | 25.0 ± n/a | 12.5 ± n/a | no result file |
| A5–A8 consistency and semantics | 57.1 ± 0.0 | n/a | no result file | 0.0 ± n/a | 57.1 ± n/a | no result file |
| A9 document alteration | 0.0 ± 0.0 | n/a | no result file | 0.0 ± n/a | 0.0 ± n/a | no result file |
| A10–A11 prompt injection | 50.0 ± 0.0 | n/a | no result file | 33.3 ± n/a | 16.7 ± n/a | no result file |
| A12 duplicate parcel | 0.0 ± 0.0 | n/a | no result file | 22.2 ± n/a | 0.0 ± n/a | no result file |
| A13–A14 survives attestation | n/a | n/a | no result file | n/a | n/a | no result file |
group counts (completed attacks, first run): A1–A4 provenance 24, A5–A8 consistency and semantics 7, A9 document alteration 1, A10–A11 prompt injection 18, A12 duplicate parcel 9, A13–A14 survives attestation 0
