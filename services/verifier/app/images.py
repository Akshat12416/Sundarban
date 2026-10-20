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
    gps_latitude: str | None = None
    gps_longitude: str | None = None


def prepare_image(original: bytes, content_type: str) -> PreparedImage:
    image = Image.open(io.BytesIO(original))
    image.load()
    exif = _read_exif(image)
    latitude, longitude = _gps_strings(image)
    digest = hashlib.sha256(original).hexdigest()
    normalized = _normalize_jpeg(image)
    phash = dhash(Image.open(io.BytesIO(normalized)))
    return PreparedImage(
        sha256=digest,
        phash=phash,
        exif=exif,
        normalized_jpeg=normalized,
        content_type=content_type or "image/jpeg",
        gps_latitude=latitude,
        gps_longitude=longitude,
    )


def dhash(image: Image.Image) -> str:
    """64-bit difference hash, returned as 16 hex characters."""
    gray = image.convert("L").resize((9, 8), Image.Resampling.LANCZOS)
    pixels = list(gray.get_flattened_data())
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


def _gps_strings(image: Image.Image) -> tuple[str | None, str | None]:
    gps = image.getexif().get_ifd(0x8825)
    if not gps:
        return None, None
    latitude = _dms_to_decimal(gps.get(2), gps.get(1))
    longitude = _dms_to_decimal(gps.get(4), gps.get(3))
    if latitude is None or longitude is None:
        return None, None
    return f"{latitude:.6f}", f"{longitude:.6f}"


def _dms_to_decimal(dms: object, ref: object) -> float | None:
    if not isinstance(dms, (tuple, list)) or len(dms) < 3 or not isinstance(ref, str):
        return None
    try:
        degrees = _ratio(dms[0]) + _ratio(dms[1]) / 60 + _ratio(dms[2]) / 3600
    except (TypeError, ZeroDivisionError, ValueError):
        return None
    if ref.upper() in {"S", "W"}:
        degrees = -degrees
    return degrees


def _ratio(value: object) -> float:
    if isinstance(value, tuple) and len(value) == 2 and value[1]:
        return float(value[0]) / float(value[1])
    return float(value)  # type: ignore[arg-type]


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
