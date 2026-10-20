"""Editable keyword lists for real-photo classification.

Matching is a case-insensitive substring test against the notes text.
A note that hits both lists is unclassified.
"""

BEFORE_KEYWORDS = [
    "barren",
    "bare",
    "empty plot",
    "unplanted",
    "cleared",
    "fallow",
    "degraded",
    "mudflat",
]

AFTER_KEYWORDS = [
    "sapling",
    "saplings",
    "planted",
    "seedling",
    "seedlings",
    "young trees",
    "nursery",
    "rows of",
    "restoration",
    "replanted",
    "forested",
    "mature trees",
    "canopy",
]

# Classes that reuse another submission. Their registry_context names that item.
REGISTRY_CONTEXT_CLASSES = ("A1", "A2", "A12")

# Built from leftover real photos, one photo each, in this order.
LEFTOVER_ATTACKS = ("A3", "A6", "A7", "A8", "A9", "A10", "A11", "A12")
