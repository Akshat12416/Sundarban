import { createHash } from "node:crypto";

export type Json =
  | null
  | boolean
  | number
  | string
  | Json[]
  | { [key: string]: Json };

export type ProofStep = {
  side: "left" | "right";
  sibling: Uint8Array;
};

export function canonicalJson(value: Json): string {
  rejectFloats(value);
  return stringify(value);
}

export function sha256(data: Uint8Array): Uint8Array {
  return new Uint8Array(createHash("sha256").update(data).digest());
}

export function metadataHash(metadata: { [key: string]: Json }): Uint8Array {
  return sha256(new TextEncoder().encode(canonicalJson(metadata)));
}

export function leafHash(
  imageSha256: Uint8Array,
  metadata: { [key: string]: Json },
  signature: Uint8Array,
): Uint8Array {
  if (imageSha256.length !== 32) {
    throw new Error("image_sha256 must be 32 bytes");
  }
  return sha256(concat([new Uint8Array([0x00]), imageSha256, metadataHash(metadata), signature]));
}

export function merkleRoot(leaves: Uint8Array[]): Uint8Array {
  if (leaves.length === 0) {
    throw new Error("a Merkle tree needs at least one leaf");
  }
  let level = leaves.map(asLeaf);
  while (level.length > 1) {
    if (level.length % 2 === 1) {
      level = [...level, level[level.length - 1]];
    }
    const next: Uint8Array[] = [];
    for (let i = 0; i < level.length; i += 2) {
      next.push(sha256(concat([new Uint8Array([0x01]), level[i], level[i + 1]])));
    }
    level = next;
  }
  return level[0];
}

export function merkleProof(leaves: Uint8Array[], index: number): ProofStep[] {
  if (leaves.length === 0) {
    throw new Error("a Merkle tree needs at least one leaf");
  }
  if (index < 0 || index >= leaves.length) {
    throw new Error("leaf index out of range");
  }
  let level = leaves.map(asLeaf);
  let cursor = index;
  const steps: ProofStep[] = [];
  while (level.length > 1) {
    if (level.length % 2 === 1) {
      level = [...level, level[level.length - 1]];
    }
    if (cursor % 2 === 0) {
      steps.push({ side: "right", sibling: level[cursor + 1] });
    } else {
      steps.push({ side: "left", sibling: level[cursor - 1] });
    }
    const next: Uint8Array[] = [];
    for (let i = 0; i < level.length; i += 2) {
      next.push(sha256(concat([new Uint8Array([0x01]), level[i], level[i + 1]])));
    }
    level = next;
    cursor = Math.floor(cursor / 2);
  }
  return steps;
}

export function verifyMerkleProof(leaf: Uint8Array, proof: ProofStep[], root: Uint8Array): boolean {
  let current = asLeaf(leaf);
  for (const step of proof) {
    if (step.sibling.length !== 32) {
      throw new Error("each sibling must be 32 bytes");
    }
    if (step.side === "left") {
      current = sha256(concat([new Uint8Array([0x01]), step.sibling, current]));
    } else if (step.side === "right") {
      current = sha256(concat([new Uint8Array([0x01]), current, step.sibling]));
    } else {
      throw new Error("proof side must be left or right");
    }
  }
  return bytesEqual(current, root);
}

function rejectFloats(value: Json): void {
  if (typeof value === "number") {
    if (!Number.isInteger(value)) {
      throw new TypeError("floats are not canonical; use a string with fixed decimals");
    }
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      rejectFloats(item);
    }
    return;
  }
  if (value !== null && typeof value === "object") {
    for (const item of Object.values(value)) {
      rejectFloats(item);
    }
  }
}

function stringify(value: Json): string {
  if (value === null) {
    return "null";
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  if (typeof value === "number") {
    return String(value);
  }
  if (typeof value === "string") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => stringify(item)).join(",")}]`;
  }
  const keys = Object.keys(value).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stringify(value[key])}`).join(",")}}`;
}

function asLeaf(leaf: Uint8Array): Uint8Array {
  if (leaf.length !== 32) {
    throw new Error("each leaf must be 32 bytes");
  }
  return leaf;
}

function concat(parts: Uint8Array[]): Uint8Array {
  const size = parts.reduce((total, part) => total + part.length, 0);
  const out = new Uint8Array(size);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

function bytesEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) {
    return false;
  }
  for (let i = 0; i < left.length; i += 1) {
    if (left[i] !== right[i]) {
      return false;
    }
  }
  return true;
}

export function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i += 1) {
    out[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

export function bytesToHex(bytes: Uint8Array): string {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
