import * as FileSystem from "expo-file-system";
import {
  canonicalJson,
  metadataHash,
  sha256,
  type Json,
} from "@sundarban/cv-crypto";

import { apiBase } from "../api/client";
import { getFirebaseAuth } from "../firebase";
import { DEVICE_KEY_ALIAS, generateKey, getPublicKey, sign } from "../../modules/cv-keystore/src";

export const MAX_GPS_ACCURACY_M = 20;

export type CaptureMetadata = {
  latitude: string;
  longitude: string;
  accuracy: string;
  capturedAt: string;
  deviceId: string;
  projectId: string;
  nonce: string;
  mockLocation: boolean;
};

export type CaptureResult = {
  accepted: boolean;
  reason: string;
};

async function authHeader(): Promise<string> {
  const user = getFirebaseAuth()?.currentUser;
  if (!user) {
    throw new Error("Sign in before capturing attested evidence.");
  }
  return `Bearer ${await user.getIdToken()}`;
}

async function readError(response: Response): Promise<string> {
  const text = await response.text();
  try {
    const body = JSON.parse(text) as { detail?: unknown };
    if (typeof body.detail === "string") {
      return body.detail;
    }
  } catch {
    // The body was not JSON.
  }
  return text || `The verifier returned ${response.status}.`;
}

export async function registerProject(projectId: string): Promise<void> {
  const base = apiBase();
  if (!base) {
    throw new Error("Set EXPO_PUBLIC_API_URL to the Mac running the verifier.");
  }
  const response = await fetch(`${base}/v1/projects`, {
    method: "POST",
    headers: {
      Authorization: await authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ projectId }),
  });
  if (!response.ok && response.status !== 200) {
    throw new Error(await readError(response));
  }
}

export async function enrolDevice(): Promise<string> {
  const level = await generateKey(DEVICE_KEY_ALIAS);
  const publicKey = await getPublicKey(DEVICE_KEY_ALIAS);
  const base = apiBase();
  if (!base) {
    throw new Error("Set EXPO_PUBLIC_API_URL to the Mac running the verifier.");
  }
  const response = await fetch(`${base}/v1/devices`, {
    method: "POST",
    headers: {
      Authorization: await authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      deviceId: DEVICE_KEY_ALIAS,
      publicKey,
      securityLevel: level,
    }),
  });
  if (!response.ok) {
    throw new Error(await readError(response));
  }
  return level;
}

export function fixedCoordinate(value: number): string {
  return value.toFixed(6);
}

export function fixedAccuracy(metres: number): string {
  return metres.toFixed(1);
}

export function metadataForCapture(input: {
  latitude: number;
  longitude: number;
  accuracyM: number;
  capturedAt: string;
  projectId: string;
  nonce: string;
  mockLocation: boolean;
}): CaptureMetadata {
  if (!Number.isFinite(input.accuracyM) || input.accuracyM > MAX_GPS_ACCURACY_M) {
    throw new Error(`GPS accuracy must be ${MAX_GPS_ACCURACY_M} m or better.`);
  }
  return {
    latitude: fixedCoordinate(input.latitude),
    longitude: fixedCoordinate(input.longitude),
    accuracy: fixedAccuracy(input.accuracyM),
    capturedAt: input.capturedAt,
    deviceId: DEVICE_KEY_ALIAS,
    projectId: input.projectId,
    nonce: input.nonce,
    mockLocation: input.mockLocation,
  };
}

export async function attestedUpload(input: {
  projectId: string;
  photoUri: string;
  latitude: number;
  longitude: number;
  accuracyM: number;
  mockLocation: boolean;
}): Promise<CaptureResult> {
  const base = apiBase();
  if (!base) {
    return { accepted: false, reason: "Set EXPO_PUBLIC_API_URL to the Mac running the verifier." };
  }
  let metadata: CaptureMetadata;
  try {
    metadata = metadataForCapture({
      ...input,
      capturedAt: new Date().toISOString(),
      nonce: "",
    });
  } catch (caught) {
    return { accepted: false, reason: caught instanceof Error ? caught.message : "Location rejected." };
  }
  const nonceResponse = await fetch(`${base}/v1/nonce`, {
    method: "POST",
    headers: {
      Authorization: await authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ projectId: input.projectId }),
  });
  if (!nonceResponse.ok) {
    return { accepted: false, reason: await readError(nonceResponse) };
  }
  const nonceBody = (await nonceResponse.json()) as { nonce: string };
  metadata = { ...metadata, nonce: nonceBody.nonce };
  const encoded = await FileSystem.readAsStringAsync(input.photoUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const image = base64ToBytes(encoded);
  const imageHash = sha256(image);
  const metaHash = metadataHash(metadata as unknown as { [key: string]: Json });
  const message = concat(imageHash, metaHash);
  canonicalJson(metadata as unknown as Json);
  const signature = await sign(DEVICE_KEY_ALIAS, message);
  const body = new FormData();
  body.append("metadata", JSON.stringify(metadata));
  body.append("signature", signature);
  body.append("kind", "before");
  body.append("file", {
    uri: input.photoUri,
    name: "capture.jpg",
    type: "image/jpeg",
  } as unknown as Blob);
  const uploaded = await fetch(`${base}/v1/projects/${input.projectId}/evidence`, {
    method: "POST",
    headers: { Authorization: await authHeader() },
    body,
  });
  if (!uploaded.ok) {
    return { accepted: false, reason: await readError(uploaded) };
  }
  return { accepted: true, reason: "Accepted." };
}

function base64ToBytes(value: string): Uint8Array {
  const binary = globalThis.atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function concat(left: Uint8Array, right: Uint8Array): Uint8Array {
  const out = new Uint8Array(left.length + right.length);
  out.set(left, 0);
  out.set(right, left.length);
  return out;
}
