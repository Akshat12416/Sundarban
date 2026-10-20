"""Price a run and exit before any generation call.

python -m bench.estimate_cost --config C1 --split dev --runs 1
"""

from __future__ import annotations

from bench.run import main


def estimate(argv: list[str] | None = None) -> int:
    args = ["--dry-run"]
    if argv:
        args.extend(argv)
    else:
        args.extend(["--config", "C1", "--split", "dev", "--runs", "1"])
    return main(args)


if __name__ == "__main__":
    raise SystemExit(estimate())
