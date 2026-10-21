"""+A: reject unattested or invalid evidence before any model call.

Until Phase 5, the bench simulates this with the manifest field `attestation`.
"""

from __future__ import annotations

from app.schema import AgentOutput, Finding, Report, finish_report
from app.submission import Submission

ATTEST_VERSION = "attest-v1"
_KNOWN = frozenset({"valid", "unattested", "invalid"})


def attestation_block(submission: Submission) -> AgentOutput | None:
    """Return a flag output when review must not start. Valid evidence returns None."""
    state = submission.attestation if submission.attestation in _KNOWN else "invalid"
    if state == "valid":
        return None
    kind = "unattested" if state == "unattested" else "attestation_invalid"
    explanation = (
        "The submission has no capture-time attestation."
        if state == "unattested"
        else "The attestation is missing or does not check out."
    )
    return AgentOutput(
        agent="attestation",
        version=ATTEST_VERSION,
        score=1,
        decision="flag",
        findings=[Finding(type=kind, evidence=submission.submission_id, explanation=explanation)],
        confidence=1,
    )


class AttestedVerifier:
    """Runs the inner verifier only when attestation_block returns None."""

    def __init__(self, inner: object, model_id: str) -> None:
        self.inner = inner
        self.model_id = model_id

    def verify(self, submission: Submission) -> Report:
        blocked = attestation_block(submission)
        if blocked is None:
            return self.inner.verify(submission)  # type: ignore[attr-defined]
        return finish_report(
            [blocked],
            model_id=self.model_id,
            prompt_versions=[ATTEST_VERSION],
            tokens=0,
            latency_ms=0,
            cache_hit=False,
            decision="flag",
        )
