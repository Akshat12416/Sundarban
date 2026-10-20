import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import {
  type Json,
  bytesToHex,
  canonicalJson,
  hexToBytes,
  leafHash,
  merkleProof,
  merkleRoot,
  metadataHash,
  verifyMerkleProof,
} from "./index.ts";

const vectorsPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "test-vectors",
  "vectors.json",
);
const vectors = JSON.parse(readFileSync(vectorsPath, "utf8")) as {
  canonicalJson: { name: string; value: Json; canonical: string }[];
  metadataHash: { name: string; metadata: { [key: string]: Json }; sha256: string }[];
  leafHash: {
    name: string;
    imageSha256: string;
    metadata: { [key: string]: Json };
    signature: string;
    leaf: string;
  }[];
  merkleRoot: { name: string; leaves: string[]; root: string }[];
};

describe("shared vectors", () => {
  it("matches canonical JSON", () => {
    assert.ok(vectors.canonicalJson.length >= 10);
    for (const item of vectors.canonicalJson) {
      assert.equal(canonicalJson(item.value), item.canonical, item.name);
    }
  });

  it("matches metadata hashes", () => {
    assert.ok(vectors.metadataHash.length >= 10);
    for (const item of vectors.metadataHash) {
      assert.equal(bytesToHex(metadataHash(item.metadata)), item.sha256, item.name);
    }
  });

  it("matches leaf hashes", () => {
    assert.ok(vectors.leafHash.length >= 10);
    for (const item of vectors.leafHash) {
      const leaf = leafHash(hexToBytes(item.imageSha256), item.metadata, hexToBytes(item.signature));
      assert.equal(bytesToHex(leaf), item.leaf, item.name);
    }
  });

  it("matches Merkle roots and verifies every proof", () => {
    assert.ok(vectors.merkleRoot.length >= 10);
    for (const item of vectors.merkleRoot) {
      const leaves = item.leaves.map(hexToBytes);
      const root = merkleRoot(leaves);
      assert.equal(bytesToHex(root), item.root, item.name);
      leaves.forEach((leaf, index) => {
        const proof = merkleProof(leaves, index);
        assert.equal(verifyMerkleProof(leaf, proof, root), true, `${item.name}:${index}`);
      });
    }
  });
});

describe("canonical JSON", () => {
  it("rejects floats and keeps 6-decimal coordinate strings", () => {
    assert.throws(() => canonicalJson({ latitude: 22.5 }), /floats/);
    const encoded = canonicalJson({
      accuracy: "4.0",
      latitude: "22.500001",
      longitude: "88.300001",
    });
    assert.equal(
      encoded,
      '{"accuracy":"4.0","latitude":"22.500001","longitude":"88.300001"}',
    );
  });
});
