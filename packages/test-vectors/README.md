# Test vectors

`reference.py` is the byte-level reference for plan section 5.1. `generate.py` writes `vectors.json`. The test recomputes every case from that file.

```
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python generate.py
.venv/bin/pytest
```

Latitude and longitude are strings with six decimal places. Floats are not canonical.
Leaf bytes are `0x00 || image SHA-256 || SHA-256(canonical metadata) || signature`.
An internal Merkle node is `SHA-256(0x01 || left || right)`. An odd level duplicates its last node.
