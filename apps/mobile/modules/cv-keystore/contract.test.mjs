import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const kotlin = readFileSync(
  join(root, "android/src/main/java/expo/modules/cvkeystore/CvKeystoreModule.kt"),
  "utf8",
);
const typescript = readFileSync(join(root, "src/index.ts"), "utf8");
const swift = readFileSync(join(root, "ios/CvKeystoreModule.swift"), "utf8");

const kotlinNames = [...kotlin.matchAll(/suspend fun (\w+)\(/g)].map((match) => match[1]);
for (const name of ["generateKey", "getPublicKey", "sign", "securityLevel"]) {
  assert.ok(kotlinNames.includes(name), `Kotlin module is missing ${name}`);
  assert.match(typescript, new RegExp(`function ${name}|async function ${name}`));
}

assert.match(kotlin, /PURPOSE_SIGN/);
assert.match(kotlin, /DIGEST_SHA256/);
assert.match(kotlin, /secp256r1/);
assert.match(kotlin, /setIsStrongBoxBacked\(true\)/);
assert.match(kotlin, /SHA256withECDSA/);
assert.equal(kotlin.includes("KeyPairGenerator.getInstance(\"EC\")"), false);
assert.match(swift, /iOS keystore is out of scope/);
assert.match(typescript, /Expo Go cannot create this key/);
console.log("cv-keystore contract ok");
