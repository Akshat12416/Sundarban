"""Check bench/data/manifest.jsonl against the generator rules.

    python -m bench.validate
"""

from __future__ import annotations

import argparse
import json
from collections import defaultdict
from pathlib import Path

from bench.catalog import repo_root


def load_manifest(path: Path) -> list[dict]:
    rows = []
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.strip():
            rows.append(json.loads(line))
    return rows


def real_filenames(item: dict) -> list[str]:
    return [photo["filename"] for photo in item["photos"] if photo["origin"] == "real"]


def validate(items: list[dict]) -> list[str]:
    errors: list[str] = []
    owners: dict[str, list[dict]] = defaultdict(list)
    for item in items:
        label = item.get("label")
        if label not in {"legit", "attack"}:
            errors.append(f"{item.get('id')}: bad label")
            continue
        if label == "legit" and item.get("attack_class") is not None:
            errors.append(f"{item['id']}: legit item has an attack class")
        if label == "attack" and not item.get("attack_class"):
            errors.append(f"{item['id']}: attack item has no class")
        expected = "unattested" if item.get("attack_class") in {"A1", "A2", "A3", "A4"} else "valid"
        if item.get("attestation") != expected:
            errors.append(f"{item['id']}: attestation should be {expected}")
        if item.get("attack_class") == "A4":
            if item.get("ai_role") not in {"before", "after"}:
                errors.append(f"{item['id']}: A4 ai_role missing")
            if item.get("registry_context") != []:
                errors.append(f"{item['id']}: A4 registry_context is not empty")
            roles = {photo["role"]: photo for photo in item["photos"]}
            if item.get("ai_role") == "before":
                if roles.get("before", {}).get("origin") != "synthetic":
                    errors.append(f"{item['id']}: fake-before item has no synthetic before")
                if roles.get("after", {}).get("origin") != "real":
                    errors.append(f"{item['id']}: fake-before item has no real after")
            if item.get("ai_role") == "after":
                if roles.get("after", {}).get("origin") != "synthetic":
                    errors.append(f"{item['id']}: fake-after item has no synthetic after")
                if roles.get("before", {}).get("origin") != "real":
                    errors.append(f"{item['id']}: fake-after item has no real before")
        for name in real_filenames(item):
            owners[name].append(item)

    for name, group in owners.items():
        splits = {item["split"] for item in group}
        if len(splits) != 1:
            errors.append(f"{name} crosses dev/test")
        if len(group) == 1:
            continue
        homes = [item for item in group if item.get("label") == "legit" or item.get("attack_class") == "A4"]
        if len(homes) != 1:
            errors.append(f"{name} is used by more than one owning item")
            continue
        home_id = homes[0]["id"]
        for item in group:
            if item["id"] == home_id:
                continue
            if item.get("attack_class") in {"A1", "A2", "A12"} and home_id in item.get("registry_context", []):
                continue
            if item.get("attack_class") in {"A5", "A10", "A11"} and item.get("source_item") == home_id:
                continue
            errors.append(f"{name} is used twice by {item['id']}")
    return errors


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description="Validate bench/data/manifest.jsonl")
    parser.add_argument("--root", type=Path, default=None)
    parser.add_argument("--manifest", type=Path, default=None)
    args = parser.parse_args(argv)
    root = args.root or repo_root()
    path = args.manifest or (root / "bench" / "data" / "manifest.jsonl")
    errors = validate(load_manifest(path))
    if errors:
        for error in errors:
            print(error)
        raise SystemExit(1)
    print(f"pass {path.name} {len(load_manifest(path))} items")


if __name__ == "__main__":
    main()
