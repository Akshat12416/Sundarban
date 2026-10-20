"""Classify a catalogue note as before_like, after_like, or unclassified."""

from bench.config import AFTER_KEYWORDS, BEFORE_KEYWORDS


def classify_notes(notes: str) -> str:
    text = (notes or "").casefold()
    before = any(keyword.casefold() in text for keyword in BEFORE_KEYWORDS)
    after = any(keyword.casefold() in text for keyword in AFTER_KEYWORDS)
    if before and not after:
        return "before_like"
    if after and not before:
        return "after_like"
    return "unclassified"
