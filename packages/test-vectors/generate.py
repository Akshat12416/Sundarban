"""Write vectors.json from the reference implementation."""

import json
from pathlib import Path

from reference import build_vectors


def main() -> None:
    out = Path(__file__).with_name("vectors.json")
    out.write_text(json.dumps(build_vectors(), indent=2) + "\n", encoding="utf-8")
    print(out)


if __name__ == "__main__":
    main()
