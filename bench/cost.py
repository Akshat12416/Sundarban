"""Cost estimate from token counts and the published price table."""

from __future__ import annotations

import json
import os
import sys
from decimal import Decimal
from pathlib import Path

_VERIFIER = Path(__file__).resolve().parents[1] / "services" / "verifier"
if str(_VERIFIER) not in sys.path:
    sys.path.insert(0, str(_VERIFIER))

from app.llm import MAX_OUTPUT_TOKENS

_PRICES = Path(__file__).resolve().parent / "prices.json"
CALLS = {"C0": 0, "C1": 1, "C2": 3}


class CostError(RuntimeError):
    pass


def load_prices() -> dict:
    return json.loads(_PRICES.read_text(encoding="utf-8"))


def price_tier() -> str:
    return "free" if os.environ.get("GEMINI_PRICE_TIER", "paid").strip().lower() == "free" else "paid"


def rates(model: str, tier: str) -> tuple[Decimal, Decimal]:
    table = load_prices()["models"]
    if model not in table:
        raise CostError(f"no published price for model {model}")
    key = "free" if tier == "free" else "paid_standard_through_2026_12_31"
    row = table[model][key]
    return Decimal(row["input_per_million"]), Decimal(row["output_per_million"])


def cap_value() -> tuple[Decimal | None, str]:
    if os.environ.get("MAX_RUN_COST"):
        return Decimal(os.environ["MAX_RUN_COST"]), "MAX_RUN_COST"
    if os.environ.get("GEMINI_RUN_COST_CAP_USD"):
        return Decimal(os.environ["GEMINI_RUN_COST_CAP_USD"]), "GEMINI_RUN_COST_CAP_USD"
    return None, ""


def estimate_usd(input_tokens: int, output_tokens: int, input_rate: Decimal, output_rate: Decimal) -> Decimal:
    million = Decimal(1_000_000)
    return (Decimal(input_tokens) * input_rate + Decimal(output_tokens) * output_rate) / million


def cold_output_tokens(config: str, submissions: int, runs: int) -> int:
    return MAX_OUTPUT_TOKENS * CALLS[config] * submissions * runs


def refusal(estimate: Decimal, cap: Decimal | None, force: bool) -> str | None:
    if force:
        return None
    if cap is None:
        return "MAX_RUN_COST is not set"
    if estimate > cap:
        return "estimate exceeds MAX_RUN_COST"
    return None
