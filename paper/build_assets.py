"""Write paper tables and charts from bench/results. Numbers come from bench.metrics."""

from __future__ import annotations

import json
import sys
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from bench.metrics import (  # noqa: E402
    TABLE3_GROUPS,
    _completed,
    _coverage,
    _paper_asr,
    _per_run,
    _runs,
    load_rows,
    render,
    render_tables,
    summarise,
)

RESULTS = ROOT / "bench" / "results"
OUT = ROOT / "paper"
TABLES = OUT / "tables"
FIGURES = OUT / "figures"

FILES = (
    ("C0", "paper", RESULTS / "C0-dev.jsonl"),
    ("C1", "paper, partial file", RESULTS / "C1-dev.jsonl"),
    ("C1 demo", "demo, not a paper result", RESULTS / "demo" / "C1-dev-ollama.jsonl"),
    ("C3 demo", "demo, not a paper result", RESULTS / "demo" / "C3-dev-ollama.jsonl"),
    ("C4 demo", "demo, not a paper result", RESULTS / "demo" / "C4-dev-ollama.jsonl"),
)


def main() -> None:
    TABLES.mkdir(parents=True, exist_ok=True)
    FIGURES.mkdir(parents=True, exist_ok=True)
    official = render_tables(RESULTS, "dev", include_demo=False)
    demo = render_tables(RESULTS, "dev", include_demo=True)
    (TABLES / "table2_table3.md").write_text(_md(official), encoding="utf-8")
    (TABLES / "table2_table3.tex").write_text(_tex(official), encoding="utf-8")
    (TABLES / "table2_table3_with_demo.md").write_text(
        "These C3 and C4 cells are from local ollama files. They are not paper results.\n\n" + _md(demo),
        encoding="utf-8",
    )
    (TABLES / "table2_table3_with_demo.tex").write_text(_tex(demo), encoding="utf-8")
    summaries = []
    points = []
    cache_rows = []
    for label, kind, path in FILES:
        rows = load_rows(path)
        text = render(summarise(rows))
        summaries.append(f"## {label}\n\nSource: `{path.relative_to(ROOT)}` ({kind})\n\n```\n{text}```\n")
        asr = _paper_asr(_completed(_runs(rows)[0]))
        tokens = sum((row.get("tokens") or 0) for row in _completed(rows))
        hits = sum(bool(row.get("cache_hit")) for row in _completed(rows))
        done = len(_completed(rows))
        points.append((label, kind, asr, tokens, path))
        cache_rows.append((label, kind, hits, done, path))
    (TABLES / "pilot_summaries.md").write_text("\n".join(summaries), encoding="utf-8")
    (TABLES / "gas.md").write_text(_gas(), encoding="utf-8")
    (TABLES / "gas.tex").write_text(_gas_tex(), encoding="utf-8")
    _class_chart()
    _token_chart(points)
    _cache_chart(cache_rows)
    print("wrote tables and figures")


def _md(text: str) -> str:
    lines = ["Numbers are the text printed by `python -m bench.metrics --tables`.", ""]
    for line in text.splitlines():
        if " | " in line and not line.startswith("files:") and not line.startswith("group counts"):
            lines.append("| " + line.replace(" | ", " | ") + " |")
            if line.startswith("Configuration") or line.startswith("Class"):
                lines.append("|" + " --- |" * (line.count("|") + 1))
        else:
            lines.append(line)
    return "\n".join(lines) + "\n"


def _tex(text: str) -> str:
    blocks = []
    current: list[str] = []
    for line in text.splitlines():
        if " | " in line and not line.startswith("files:") and not line.startswith("group counts"):
            current.append(line)
        else:
            if current:
                blocks.append(current)
                current = []
    if current:
        blocks.append(current)
    parts = ["% Cells are copied from bench.metrics.render_tables. Do not edit the numbers.", ""]
    for block in blocks:
        cols = block[0].count("|") + 1
        parts.append("\\begin{tabular}{" + "l" * cols + "}")
        parts.append("\\hline")
        for line in block:
            cells = " & ".join(cell.replace("_", "\\_").replace("%", "\\%").replace("±", "$\\pm$") for cell in line.split(" | "))
            parts.append(cells + " \\\\")
        parts.append("\\hline")
        parts.append("\\end{tabular}")
        parts.append("")
    return "\n".join(parts)


def _gas() -> str:
    data = json.loads((RESULTS / "gas.json").read_text(encoding="utf-8"))
    return "\n".join(
        [
            "Source: `bench/results/gas.json`. Five receipts each, from the test contract, not the deployment address.",
            "",
            "| Call | Mean gas | Min | Max |",
            "| --- | --- | --- | --- |",
            f"| register | {data['register']['mean']} | {data['register']['min']} | {data['register']['max']} |",
            f"| retire | {data['retire']['mean']} | {data['retire']['min']} | {data['retire']['max']} |",
            "",
        ]
    )


def _gas_tex() -> str:
    data = json.loads((RESULTS / "gas.json").read_text(encoding="utf-8"))
    return "\n".join(
        [
            "\\begin{tabular}{lrrr}",
            "\\hline",
            "Call & Mean gas & Min & Max \\\\",
            "\\hline",
            f"register & {data['register']['mean']} & {data['register']['min']} & {data['register']['max']} \\\\",
            f"retire & {data['retire']['mean']} & {data['retire']['min']} & {data['retire']['max']} \\\\",
            "\\hline",
            "\\end{tabular}",
            "",
        ]
    )


def _class_chart() -> None:
    series = [
        ("C0", RESULTS / "C0-dev.jsonl", "#1DBF73"),
        ("C1 partial", RESULTS / "C1-dev.jsonl", "#111111"),
        ("C3 demo", RESULTS / "demo" / "C3-dev-ollama.jsonl", "#8A8A8A"),
        ("C4 demo", RESULTS / "demo" / "C4-dev-ollama.jsonl", "#17A665"),
    ]
    labels = [name for name, _classes in TABLE3_GROUPS]
    fig, ax = plt.subplots(figsize=(7.4, 4.4))
    width = 0.18
    for index, (name, path, color) in enumerate(series):
        rows = load_rows(path)
        values = []
        for _group, classes in TABLE3_GROUPS:
            mean, _sd = _per_run(rows, lambda run_rows, classes=classes: _group_asr(run_rows, classes))
            values.append(None if mean is None else mean * 100)
        xs = [i + (index - 1.5) * width for i in range(len(labels))]
        ys = [0 if value is None else value for value in values]
        bars = ax.bar(xs, ys, width=width, color=color, label=name)
        for bar, value in zip(bars, values):
            if value is None:
                bar.set_alpha(0)
                continue
            ax.text(bar.get_x() + bar.get_width() / 2, value + 1.5, f"{value:.1f}", ha="center", va="bottom", fontsize=7)
    ax.set_xticks(range(len(labels)), labels, rotation=18, ha="right")
    ax.set_ylabel("Paper ASR (%)")
    ax.set_ylim(0, 118)
    ax.legend(frameon=False, ncol=2)
    ax.set_title("Paper ASR by class. A blank slot has no completed attacks.")
    fig.tight_layout()
    fig.savefig(FIGURES / "asr_by_class.svg")
    fig.savefig(FIGURES / "asr_by_class.png", dpi=300)
    plt.close(fig)


def _group_asr(rows, classes):
    from bench.metrics import _group_asr as metric

    return metric(rows, classes)


def _token_chart(points: list[tuple]) -> None:
    fig, ax = plt.subplots(figsize=(7.4, 4.4))
    for label, kind, asr, tokens, _path in points:
        if asr is None:
            continue
        ax.scatter([asr * 100], [tokens], s=80)
        ax.annotate(label, (asr * 100, tokens), textcoords="offset points", xytext=(8, 8 if "C3" not in label else -12))
    ax.set_xlabel("Paper ASR (%)  = attacks approved / attacks")
    ax.set_ylabel("Sum of the tokens field on completed rows")
    ax.set_title("Recorded tokens versus ASR. Dollar cost is not in these files.")
    fig.tight_layout()
    fig.savefig(FIGURES / "tokens_versus_asr.svg")
    fig.savefig(FIGURES / "tokens_versus_asr.png", dpi=300)
    plt.close(fig)


def _cache_chart(rows: list[tuple]) -> None:
    fig, ax = plt.subplots(figsize=(7.4, 4.4))
    labels = [item[0] for item in rows]
    shares = [0 if item[3] == 0 else 100 * item[2] / item[3] for item in rows]
    ax.bar(labels, shares, color="#1DBF73")
    for index, item in enumerate(rows):
        ax.text(index, shares[index] + 1, f"{item[2]}/{item[3]}", ha="center", fontsize=9)
    ax.set_ylabel("Completed rows with cache_hit true (%)")
    ax.set_ylim(0, 110)
    ax.set_title("Cache hits recorded in the JSONL. Not a dollar saving.")
    fig.tight_layout()
    fig.savefig(FIGURES / "cache_hits.svg")
    fig.savefig(FIGURES / "cache_hits.png", dpi=300)
    plt.close(fig)


if __name__ == "__main__":
    main()
