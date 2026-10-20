"""Thresholds for the rules verifier. These are design choices, not measured results."""

from __future__ import annotations

from decimal import Decimal

# A planted hectare rarely holds more than a few thousand stems.
MAX_TREES_PER_HA = Decimal("4000")
MIN_AREA_HA = Decimal("0.0001")
MAX_AREA_HA = Decimal("10000")
# EXIF GPS farther than this from the declared parcel is inconsistent.
GPS_RADIUS_M = 1000
PHASH_THRESHOLD = 8

# Species that the rules know about, and the region words that are allowed.
# A region matches when one of these words appears in the submitted region.
SPECIES_REGIONS: dict[str, tuple[str, ...]] = {
    "mangrove": (
        "sundarban",
        "sunderban",
        "bengal",
        "tropical",
        "subtropical",
        "coast",
        "coastal",
        "india",
        "bangladesh",
        "indonesia",
        "estuary",
    ),
}

# A location claim that contains one of these words is not a land parcel.
IMPLAUSIBLE_LOCATION_WORDS = ("open ocean", "ocean", "at sea", "open water")

# Form fields a document must repeat when the submission includes them.
DOCUMENT_FIELDS = ("organisation", "owner_name", "species", "region")
