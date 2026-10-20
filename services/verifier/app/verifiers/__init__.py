"""Verifier configurations C0, C1, and C2."""

from __future__ import annotations

from typing import Protocol

from app.llm import ModelWrapper
from app.schema import Report
from app.submission import Submission
from app.verifiers import c0
from app.verifiers.c1 import C1Verifier
from app.verifiers.c2 import C2Verifier


class Verifier(Protocol):
    def verify(self, submission: Submission) -> Report: ...


class RulesVerifier:
    def verify(self, submission: Submission) -> Report:
        return c0.verify(submission)


def build_verifier(config: str, wrapper: ModelWrapper | None = None) -> Verifier:
    name = config.upper()
    if name == "C0":
        return RulesVerifier()
    if wrapper is None:
        raise ValueError(f"{name} needs the LLM wrapper")
    if name == "C1":
        return C1Verifier(wrapper)
    if name == "C2":
        return C2Verifier(wrapper)
    raise ValueError(f"unknown verifier config {config}")
