"""Loader stub for device attacks populated in Phase 8.

Manifest rows for these classes, once captures exist, use the same fields as
every other item: id, label, split, attack_class, ai_role, registry_context,
photos. ai_role is null. registry_context is []. photos[].origin is "device".
A13 is screen recapture. A14 is mock GPS. Neither row is invented here.
"""

from pathlib import Path


def load_device_capture_items(root: Path) -> list[dict]:
    """Return A13 and A14 items from bench/data/device_captures/.

    The directory is not read yet. Phase 8 drops real captures in
    bench/data/device_captures/a13/ and bench/data/device_captures/a14/
    and this function starts returning rows. Until then it returns an empty list.
    """
    _ = root
    return []
