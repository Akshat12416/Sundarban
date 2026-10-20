"""Agent output and the aggregated report. Scores are probabilities, not canonical JSON."""

from __future__ import annotations

import hashlib
import json
from typing import Any, Literal

from pydantic import BaseModel, Field

Decision = Literal["pass", "review", "flag"]
Risk = Literal["low", "medium", "high"]
Recommendation = Literal["approve", "review", "reject", "request_more_evidence"]


class Finding(BaseModel):
    type: str = Field(min_length=1)
    evidence: str
    explanation: str


class AgentOutput(BaseModel):
    agent: str = Field(min_length=1)
    version: str = Field(min_length=1)
    score: float = Field(ge=0, le=1)
    decision: Decision
    findings: list[Finding]
    confidence: float = Field(ge=0, le=1)


class Judgment(BaseModel):
    """Fields the model must return. The wrapper stamps agent and version."""

    score: float = Field(ge=0, le=1)
    decision: Decision
    findings: list[Finding]
    confidence: float = Field(ge=0, le=1)


class Report(BaseModel):
    agent_outputs: list[AgentOutput]
    overall_risk: Risk
    recommendation: Recommendation
    report_hash: str
    model_id: str
    prompt_versions: list[str]
    tokens: int = 0
    latency_ms: float = 0
    cache_hit: bool = False


def judgment_schema() -> dict[str, Any]:
    return {
        "type": "object",
        "properties": {
            "score": {"type": "number"},
            "decision": {"type": "string", "enum": ["pass", "review", "flag"]},
            "findings": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "type": {"type": "string"},
                        "evidence": {"type": "string"},
                        "explanation": {"type": "string"},
                    },
                    "required": ["type", "evidence", "explanation"],
                },
            },
            "confidence": {"type": "number"},
        },
        "required": ["score", "decision", "findings", "confidence"],
    }


def flag_judgment(explanation: str) -> Judgment:
    return Judgment(
        score=1,
        decision="flag",
        findings=[
            Finding(type="invalid_json", evidence="model_response", explanation=explanation)
        ],
        confidence=0,
    )


def stamp(judgment: Judgment, agent: str, version: str) -> AgentOutput:
    return AgentOutput(
        agent=agent,
        version=version,
        score=judgment.score,
        decision=judgment.decision,
        findings=judgment.findings,
        confidence=judgment.confidence,
    )


def finish_report(
    outputs: list[AgentOutput],
    *,
    model_id: str,
    prompt_versions: list[str],
    tokens: int,
    latency_ms: float,
    cache_hit: bool,
    decision: Decision | None = None,
) -> Report:
    chosen = decision or _majority(outputs)
    risk, recommendation = _risk_and_recommendation(chosen, outputs)
    body = {
        "agent_outputs": [item.model_dump() for item in outputs],
        "overall_risk": risk,
        "recommendation": recommendation,
        "model_id": model_id,
        "prompt_versions": prompt_versions,
    }
    return Report(
        agent_outputs=outputs,
        overall_risk=risk,
        recommendation=recommendation,
        report_hash=hash_report(body),
        model_id=model_id,
        prompt_versions=prompt_versions,
        tokens=tokens,
        latency_ms=round(latency_ms, 3),
        cache_hit=cache_hit,
    )


def hash_report(body: dict[str, Any]) -> str:
    encoded = json.dumps(_stable(body), sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    return hashlib.sha256(encoded.encode("utf-8")).hexdigest()


def _majority(outputs: list[AgentOutput]) -> Decision:
    counts = {name: sum(item.decision == name for item in outputs) for name in ("flag", "review", "pass")}
    for name in ("flag", "review", "pass"):
        if counts[name] > len(outputs) / 2:
            return name  # type: ignore[return-value]
    return "review"


def _risk_and_recommendation(
    decision: Decision, outputs: list[AgentOutput]
) -> tuple[Risk, Recommendation]:
    if any(item.findings and item.findings[0].type == "missing_evidence" for item in outputs):
        return "medium", "request_more_evidence"
    if decision == "pass":
        return "low", "approve"
    if decision == "review":
        return "medium", "review"
    return "high", "reject"


def _stable(value: Any) -> Any:
    if isinstance(value, float):
        return f"{value:.6f}"
    if isinstance(value, dict):
        return {key: _stable(item) for key, item in value.items()}
    if isinstance(value, list):
        return [_stable(item) for item in value]
    return value
