"""Read EXIF, then hash and normalise. Firestore stores paths and hashes only."""

from __future__ import annotations

import hashlib
import io
from dataclasses import dataclass

from PIL import Image
from PIL.ExifTags import TAGS

LONG_EDGE = 1600


@dataclass(frozen=True)
class PreparedImage:
    sha256: str
    phash: str
    exif: dict[str, str]
    normalized_jpeg: bytes
    content_type: str


def prepare_image(original: bytes, content_type: str) -> PreparedImage:
    image = Image.open(io.BytesIO(original))
    image.load()
    exif = _read_exif(image)
    digest = hashlib.sha256(original).hexdigest()
    normalized = _normalize_jpeg(image)
    phash = dhash(Image.open(io.BytesIO(normalized)))
    return PreparedImage(
        sha256=digest,
        phash=phash,
        exif=exif,
        normalized_jpeg=normalized,
        content_type=content_type or "image/jpeg",
    )


def dhash(image: Image.Image) -> str:
    """64-bit difference hash, returned as 16 hex characters."""
    gray = image.convert("L").resize((9, 8), Image.Resampling.LANCZOS)
    pixels = list(gray.getdata())
    bits = 0
    for y in range(8):
        row = y * 9
        for x in range(8):
            bits = (bits << 1) | (1 if pixels[row + x] > pixels[row + x + 1] else 0)
    return f"{bits:016x}"


def _read_exif(image: Image.Image) -> dict[str, str]:
    found: dict[str, str] = {}
    for tag, value in image.getexif().items():
        if isinstance(value, (bytes, bytearray)):
            continue
        name = str(TAGS.get(tag, tag))
        found[name] = value if isinstance(value, str) else str(value)
    return found


def _normalize_jpeg(image: Image.Image) -> bytes:
    rgb = image.convert("RGB")
    width, height = rgb.size
    long_edge = max(width, height)
    if long_edge > LONG_EDGE:
        scale = LONG_EDGE / long_edge
        rgb = rgb.resize(
            (max(1, round(width * scale)), max(1, round(height * scale))),
            Image.Resampling.LANCZOS,
        )
    buffer = io.BytesIO()
    rgb.save(buffer, format="JPEG", quality=90)
    return buffer.getvalue()
