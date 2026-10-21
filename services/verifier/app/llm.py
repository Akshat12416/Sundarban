"""The one LLM wrapper. Temperature is 0. The model id comes from configuration."""

from __future__ import annotations

import logging
import time
from dataclasses import dataclass
from typing import Any, Protocol

import httpx
from pydantic import ValidationError

from app.cache import CacheStore, cache_key
from app.schema import AgentOutput, Judgment, flag_judgment, judgment_schema, stamp

logger = logging.getLogger("sundarban.llm")

MAX_OUTPUT_TOKENS = 1024
# gemini-3.8-flash rejects thinking level "minimal". "low" is the lowest level it accepts.
THINKING_LEVEL = "low"


class LlmError(RuntimeError):
    pass


@dataclass(frozen=True)
class ModelCall:
    output: AgentOutput
    tokens: int
    latency_ms: float
    cache_hit: bool
    model_id: str
    prompt_version: str


class Generator(Protocol):
    def generate(
        self,
        *,
        model: str,
        parts: list[dict[str, Any]],
        schema: dict[str, Any],
        temperature: float,
        max_output_tokens: int,
    ) -> tuple[str, int]: ...


class GeminiGenerator:
    """Gemini REST. The API key is a query parameter and is never logged."""

    def __init__(self, api_key: str, client: httpx.Client | None = None) -> None:
        if not api_key:
            raise ValueError("GEMINI_API_KEY is not set")
        self._api_key = api_key
        self._client = client or httpx.Client(timeout=120.0)
        self._owns_client = client is None

    def close(self) -> None:
        if self._owns_client:
            self._client.close()

    def generate(
        self,
        *,
        model: str,
        parts: list[dict[str, Any]],
        schema: dict[str, Any],
        temperature: float,
        max_output_tokens: int,
    ) -> tuple[str, int]:
        response = self._post(
            f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
            {
                "contents": [{"role": "user", "parts": parts}],
                "generationConfig": {
                    "temperature": temperature,
                    "maxOutputTokens": max_output_tokens,
                    "responseMimeType": "application/json",
                    "responseSchema": schema,
                    "thinkingConfig": {"thinkingLevel": THINKING_LEVEL},
                },
            },
        )
        body = response.json()
        text = _response_text(body)
        tokens = int((body.get("usageMetadata") or {}).get("totalTokenCount") or 0)
        return text, tokens

    def count_tokens(self, model: str, parts: list[dict[str, Any]]) -> int:
        response = self._post(
            f"https://generativelanguage.googleapis.com/v1beta/models/{model}:countTokens",
            {"contents": [{"parts": parts}]},
        )
        return int(response.json().get("totalTokens") or 0)

    def _post(self, url: str, payload: dict[str, Any]) -> httpx.Response:
        delay = 2.0
        last_status = 0
        for _attempt in range(7):
            try:
                response = self._client.post(url, params={"key": self._api_key}, json=payload)
            except httpx.HTTPError as exc:
                raise LlmError(f"gemini transport {type(exc).__name__}") from None
            if response.status_code in {429, 503}:
                last_status = response.status_code
                time.sleep(delay)
                delay = min(delay * 2, 30)
                continue
            if response.status_code >= 400:
                message = _error_message(response).replace(self._api_key, "[redacted]")
                raise LlmError(f"gemini status {response.status_code} {message}".strip())
            return response
        raise LlmError(f"gemini status {last_status}")


class ModelWrapper:
    def __init__(self, generator: Generator, store: CacheStore, model_id: str) -> None:
        if not model_id:
            raise ValueError("GEMINI_MODEL is not set")
        self.generator = generator
        self.store = store
        self.model_id = model_id
        self.hits = 0
        self.misses = 0

    def complete(
        self,
        *,
        evidence_sha256: str,
        agent_id: str,
        prompt_version: str,
        parts: list[dict[str, Any]],
    ) -> ModelCall:
        key = cache_key(evidence_sha256, agent_id, prompt_version, self.model_id)
        started = time.perf_counter()
        found = self.store.get(key)
        if found is not None:
            self.hits += 1
            output = AgentOutput.model_validate(found.value)
            elapsed = (time.perf_counter() - started) * 1000
            logger.info(
                "llm_call agent=%s model=%s tokens=0 latency_ms=%.1f cache_hit=true",
                agent_id,
                self.model_id,
                elapsed,
            )
            return ModelCall(output, 0, elapsed, True, self.model_id, prompt_version)
        self.misses += 1
        output, tokens = self._call(agent_id, prompt_version, parts)
        self.store.put(key, output.model_dump())
        elapsed = (time.perf_counter() - started) * 1000
        logger.info(
            "llm_call agent=%s model=%s tokens=%s latency_ms=%.1f cache_hit=false",
            agent_id,
            self.model_id,
            tokens,
            elapsed,
        )
        return ModelCall(output, tokens, elapsed, False, self.model_id, prompt_version)

    def _call(
        self,
        agent_id: str,
        prompt_version: str,
        parts: list[dict[str, Any]],
    ) -> tuple[AgentOutput, int]:
        schema = judgment_schema()
        total_tokens = 0
        last_invalid = ""
        last_http = ""
        for _attempt in range(2):
            try:
                text, tokens = self.generator.generate(
                    model=self.model_id,
                    parts=parts,
                    schema=schema,
                    temperature=0,
                    max_output_tokens=MAX_OUTPUT_TOKENS,
                )
            except LlmError as exc:
                last_http = str(exc)
                continue
            total_tokens += tokens
            try:
                judgment = Judgment.model_validate_json(_strip_fence(text))
            except (ValidationError, ValueError) as exc:
                last_invalid = str(exc).splitlines()[0]
                continue
            return stamp(judgment, agent_id, prompt_version), total_tokens
        if last_invalid and not last_http:
            logger.info("llm_invalid agent=%s model=%s retried=true", agent_id, self.model_id)
            return stamp(flag_judgment(last_invalid), agent_id, prompt_version), total_tokens
        raise LlmError(last_http or "model call failed")


def _error_message(response: httpx.Response) -> str:
    try:
        message = str((response.json().get("error") or {}).get("message") or "")
    except ValueError:
        message = ""
    return message[:200]


def _strip_fence(text: str) -> str:
    stripped = text.strip()
    if stripped.startswith("```"):
        stripped = stripped.split("\n", 1)[-1]
        if stripped.endswith("```"):
            stripped = stripped[: stripped.rfind("```")]
    return stripped.strip()


def _response_text(body: dict[str, Any]) -> str:
    candidates = body.get("candidates") or []
    if not candidates:
        raise LlmError("gemini returned no candidate")
    parts = ((candidates[0].get("content") or {}).get("parts")) or []
    texts = [part.get("text", "") for part in parts if isinstance(part, dict) and part.get("text")]
    if not texts:
        raise LlmError("gemini returned no text")
    return "\n".join(texts)
