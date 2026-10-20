"""C2: three C1 calls, same model and prompt, majority decision."""

from __future__ import annotations

from statistics import median

from app.llm import ModelWrapper
from app.schema import AgentOutput, Report, finish_report
from app.submission import Submission
from app.verifiers.c1 import PROMPT_NAME, parts_for
from app.prompts import load_prompt

VOTE_IDS = ("c2-1", "c2-2", "c2-3")


class C2Verifier:
    def __init__(self, wrapper: ModelWrapper) -> None:
        self.wrapper = wrapper
        self.version, self.prompt = load_prompt(PROMPT_NAME)

    def verify(self, submission: Submission) -> Report:
        calls = [
            self.wrapper.complete(
                evidence_sha256=submission.evidence_sha256(),
                agent_id=agent_id,
                prompt_version=self.version,
                parts=parts_for(self.prompt, agent_id, submission),
            )
            for agent_id in VOTE_IDS
        ]
        outputs = [call.output for call in calls]
        chosen = _majority_outputs(outputs)
        return finish_report(
            outputs,
            model_id=self.wrapper.model_id,
            prompt_versions=[self.version],
            tokens=sum(call.tokens for call in calls),
            latency_ms=sum(call.latency_ms for call in calls),
            cache_hit=all(call.cache_hit for call in calls),
            decision=chosen.decision,
        )


def _majority_outputs(outputs: list[AgentOutput]) -> AgentOutput:
    counts: dict[str, int] = {}
    for item in outputs:
        counts[item.decision] = counts.get(item.decision, 0) + 1
    winner = next((name for name, count in counts.items() if count > len(outputs) / 2), None)
    if winner is None:
        score = float(median(item.score for item in outputs))
        return AgentOutput(
            agent="c2",
            version=outputs[0].version,
            score=score,
            decision="review",
            findings=[finding for item in outputs for finding in item.findings],
            confidence=float(median(item.confidence for item in outputs)),
        )
    voters = [item for item in outputs if item.decision == winner]
    return AgentOutput(
        agent="c2",
        version=voters[0].version,
        score=float(median(item.score for item in voters)),
        decision=winner,  # type: ignore[arg-type]
        findings=[finding for item in voters for finding in item.findings],
        confidence=float(median(item.confidence for item in voters)),
    )
