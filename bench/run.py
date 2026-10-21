"""Evaluate submissions one at a time.

python -m bench.run --config C1 --split dev --runs 3 [--dry-run]
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from decimal import Decimal
from pathlib import Path

_VERIFIER = Path(__file__).resolve().parents[1] / "services" / "verifier"
if str(_VERIFIER) not in sys.path:
    sys.path.insert(0, str(_VERIFIER))

from app.cache import SqliteCache
from app.llm import GeminiGenerator, LlmError, ModelWrapper
from app.prompts import load_prompt
from app.verifiers import build_verifier
from app.verifiers.c1 import parts_for
from bench.catalog import repo_root
from bench.cost import (
    CALLS,
    cap_value,
    cold_output_tokens,
    estimate_usd,
    price_tier,
    rates,
    refusal,
)
from bench.items import build_submission, load_manifest

CONFIGS = ("C0", "C1", "C2")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Run one verifier configuration on one split.")
    parser.add_argument("--config", required=True, choices=CONFIGS)
    parser.add_argument("--split", required=True)
    parser.add_argument("--runs", type=int, default=1)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--manifest", type=Path, default=None)
    parser.add_argument("--output", type=Path, default=None)
    return parser


def main(argv: list[str] | None = None) -> int:
    _load_env(repo_root())
    args = build_parser().parse_args(argv)
    if args.runs < 1:
        print("runs must be at least 1")
        return 2
    root = repo_root()
    manifest = args.manifest or root / "bench" / "data" / "manifest.jsonl"
    rows = [row for row in load_manifest(manifest) if row.get("split") == args.split]
    by_id = {row["id"]: row for row in load_manifest(manifest)}
    ready = []
    skipped = []
    for row in rows:
        submission, reason = build_submission(row, by_id, root)
        if submission is None:
            skipped.append((row, reason or "missing file"))
        else:
            ready.append((row, submission))
    estimate, detail = _estimate(args.config, ready, args.runs)
    cap, cap_name = cap_value()
    _print_estimate(args.config, estimate, detail, cap, cap_name)
    blocked = refusal(estimate, cap, args.force)
    if args.dry_run:
        if blocked:
            print(blocked)
            return 2
        return 0
    if blocked:
        print(blocked)
        return 2
    output = args.output or root / "bench" / "results" / f"{args.config}-{args.split}.jsonl"
    output.parent.mkdir(parents=True, exist_ok=True)
    _write(output, args, ready, skipped)
    print(f"wrote {output}")
    return 0


def _estimate(config: str, ready: list[tuple[dict, object]], runs: int) -> tuple[Decimal, dict]:
    model = os.environ.get("GEMINI_MODEL", "")
    tier = price_tier()
    input_rate, output_rate = rates(model or "gemini-3.8-flash", tier) if CALLS[config] else (Decimal(0), Decimal(0))
    if CALLS[config] == 0:
        return Decimal(0), {"input_tokens": 0, "output_tokens": 0, "tier": tier, "model": model}
    if not model:
        raise SystemExit("GEMINI_MODEL is not set")
    input_tokens = _count_input_tokens(model, config, ready) * runs
    output_tokens = cold_output_tokens(config, len(ready), runs)
    return estimate_usd(input_tokens, output_tokens, input_rate, output_rate), {
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "tier": tier,
        "model": model,
    }


def _count_input_tokens(model: str, config: str, ready: list[tuple[dict, object]]) -> int:
    key = os.environ.get("GEMINI_API_KEY", "")
    generator = GeminiGenerator(key)
    version, prompt = load_prompt("c1_v1")
    del version
    total = 0
    votes = ("c1",) if config == "C1" else ("c2-1", "c2-2", "c2-3")
    try:
        for _row, submission in ready:
            for agent_id in votes:
                total += generator.count_tokens(model, parts_for(prompt, agent_id, submission))  # type: ignore[arg-type]
    finally:
        generator.close()
    return total


def _print_estimate(config: str, estimate: Decimal, detail: dict, cap: Decimal | None, cap_name: str) -> None:
    print(f"config {config}")
    print(f"model {detail.get('model') or 'none'}")
    print(f"tier {detail.get('tier')}")
    print(f"input_tokens {detail.get('input_tokens')}")
    print(f"output_tokens_ceiling {detail.get('output_tokens')}")
    print(f"estimate_usd {estimate}")
    print(f"cap_usd {cap if cap is not None else 'unset'}")
    print(f"cap_source {cap_name or 'unset'}")


def _write(output: Path, args: argparse.Namespace, ready: list, skipped: list) -> None:
    model = os.environ.get("GEMINI_MODEL", "")
    wrapper = None
    if args.config != "C0":
        cache = SqliteCache(output.parent / "analysis-cache.sqlite")
        wrapper = ModelWrapper(GeminiGenerator(os.environ.get("GEMINI_API_KEY", "")), cache, model)
    verifier = build_verifier(args.config, wrapper)
    with output.open("w", encoding="utf-8") as handle:
        for run in range(1, args.runs + 1):
            for row, reason in skipped:
                handle.write(json.dumps(_skipped_line(args, run, row, reason), sort_keys=True) + "\n")
            for row, submission in ready:
                try:
                    report = verifier.verify(submission)
                except LlmError as exc:
                    handle.write(
                        json.dumps(_skipped_line(args, run, row, str(exc)), sort_keys=True) + "\n"
                    )
                    handle.flush()
                    continue
                handle.write(json.dumps(_line(args, run, row, report), sort_keys=True) + "\n")
                handle.flush()
    if wrapper is not None:
        wrapper.generator.close()  # type: ignore[attr-defined]


def _line(args: argparse.Namespace, run: int, row: dict, report) -> dict:
    return {
        "attack_class": row.get("attack_class"),
        "cache_hit": report.cache_hit,
        "config": args.config,
        "decision": report.agent_outputs[0].decision if args.config != "C2" else _report_decision(report),
        "label": row.get("label"),
        "latency_ms": report.latency_ms,
        "recommendation": report.recommendation,
        "report_hash": report.report_hash,
        "risk": report.overall_risk,
        "run": run,
        "split": args.split,
        "status": "ok",
        "submission_id": row["id"],
        "tokens": report.tokens,
    }


def _report_decision(report) -> str:
    counts: dict[str, int] = {}
    for item in report.agent_outputs:
        counts[item.decision] = counts.get(item.decision, 0) + 1
    for name, count in counts.items():
        if count > len(report.agent_outputs) / 2:
            return name
    return "review"


def _skipped_line(args: argparse.Namespace, run: int, row: dict, reason: str) -> dict:
    return {
        "attack_class": row.get("attack_class"),
        "cache_hit": False,
        "config": args.config,
        "decision": None,
        "label": row.get("label"),
        "latency_ms": 0,
        "reason": reason,
        "recommendation": None,
        "report_hash": None,
        "risk": None,
        "run": run,
        "split": args.split,
        "status": "skipped",
        "submission_id": row["id"],
        "tokens": 0,
    }


def _load_env(root: Path) -> None:
    for path in (root / "bench" / ".env", root / "services" / "verifier" / ".env"):
        if not path.is_file():
            continue
        for line in path.read_text(encoding="utf-8").splitlines():
            stripped = line.strip()
            if not stripped or stripped.startswith("#") or "=" not in stripped:
                continue
            key, value = stripped.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


if __name__ == "__main__":
    raise SystemExit(main())
