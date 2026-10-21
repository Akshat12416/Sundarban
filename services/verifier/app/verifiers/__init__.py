"""Verifier configurations C0, C1, C2, C3, and C4."""

from __future__ import annotations

from typing import Protocol

from app.llm import ModelWrapper
from app.schema import Report
from app.submission import Submission
from app.verifiers import c0
from app.verifiers.attestation import AttestedVerifier
from app.verifiers.c1 import C1Verifier
from app.verifiers.c2 import C2Verifier
from app.verifiers.specialists import C3Verifier, C4Verifier


class Verifier(Protocol):
    def verify(self, submission: Submission) -> Report: ...


class RulesVerifier:
    def verify(self, submission: Submission) -> Report:
        return c0.verify(submission)


def build_verifier(
    config: str,
    wrapper: ModelWrapper | None = None,
    *,
    attest: bool = False,
    parallel: bool = False,
) -> Verifier:
    name = config.upper()
    if name == "C0":
        if attest:
            raise ValueError("+A applies to C1, C2, C3, and C4")
        return RulesVerifier()
    if wrapper is None:
        raise ValueError(f"{name} needs the LLM wrapper")
    if name == "C1":
        inner: Verifier = C1Verifier(wrapper)
    elif name == "C2":
        inner = C2Verifier(wrapper)
    elif name == "C3":
        inner = C3Verifier(wrapper, parallel=parallel)
    elif name == "C4":
        inner = C4Verifier(wrapper, parallel=parallel)
    else:
        raise ValueError(f"unknown verifier config {config}")
    if not attest:
        return inner
    return AttestedVerifier(inner, wrapper.model_id)
