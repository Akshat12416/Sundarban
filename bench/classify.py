"""Classify a catalogue note as before_like, after_like, or unclassified."""

from bench.config import AFTER_KEYWORDS, BEFORE_KEYWORDS, EXCLUDED_KEYWORDS


def _usable(keywords: list[str]) -> list[str]:
    excluded = {word.casefold() for word in EXCLUDED_KEYWORDS}
    return [word for word in keywords if word.casefold() not in excluded]


def classify_notes(notes: str) -> str:
    text = (notes or "").casefold()
    before = any(keyword.casefold() in text for keyword in _usable(BEFORE_KEYWORDS))
    after = any(keyword.casefold() in text for keyword in _usable(AFTER_KEYWORDS))
    if before and not after:
        return "before_like"
    if after and not before:
        return "after_like"
    return "unclassified"


def composite_orientation(notes: str) -> str | None:
    """Return composite_lr or composite_tb when the note describes one site.

    Left/right is the default. Top/bottom is used only when the note says so.
    """
    text = (notes or "").casefold()
    explicit_lr = "left side before" in text or "right side after" in text
    same_place = "same land" in text or "same site" in text
    both_sides = "before" in text and "after" in text and same_place
    if not explicit_lr and not both_sides:
        return None
    if "top" in text or "bottom" in text:
        return "composite_tb"
    return "composite_lr"
