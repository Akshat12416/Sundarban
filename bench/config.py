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
    "clearing",
    "fallow",
    "degraded",
    "desert",
    "dry earth",
    "cracked earth",
    "parched",
    "no vegetation",
    "devoid of vegetation",
    "idle beach",
    "idle land",
    "exposed soil",
    "mudflat",
    "mud flat",
    "tidal flat",
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
    "reforestation",
    "regeneration",
    "regrowth",
    "recovery",
    "forest",
    "forested",
    "vegetation",
    "woodland",
    "dense trees",
    "greenery",
    "man-made forest",
    "mature trees",
    "canopy",
]

# These words show up in both barren and planted descriptions. Never use them.
EXCLUDED_KEYWORDS = ("plantation", "planting")

# Classes that reuse another submission. Their registry_context names that item.
REGISTRY_CONTEXT_CLASSES = ("A1", "A2", "A12")

# Built from leftover real photos, one photo each, in this order.
LEFTOVER_ATTACKS = ("A3", "A6", "A7", "A8", "A9", "A10", "A11", "A12")
