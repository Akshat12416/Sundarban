import { Platform } from "react-native";
import { requireNativeModule } from "expo";

export const DEVICE_KEY_ALIAS = "cv_device_key";

export type SecurityLevel = "StrongBox" | "TEE" | "software" | "unknown";

type NativeCvKeystore = {
  generateKey(alias: string): Promise<string>;
  getPublicKey(alias: string): Promise<string>;
  sign(alias: string, data: Uint8Array): Promise<string>;
  securityLevel(alias: string): Promise<string>;
};

function nativeModule(): NativeCvKeystore {
  if (Platform.OS === "ios") {
    throw new Error("iOS keystore is out of scope. Sundarban attestation is Android only.");
  }
  if (Platform.OS !== "android") {
    throw new Error(
      "Hardware keystore requires the Android development build. Expo Go cannot create this key.",
    );
  }
  return requireNativeModule<NativeCvKeystore>("CvKeystore");
}

export async function generateKey(alias: string = DEVICE_KEY_ALIAS): Promise<SecurityLevel> {
  return (await nativeModule().generateKey(alias)) as SecurityLevel;
}

export async function getPublicKey(alias: string = DEVICE_KEY_ALIAS): Promise<string> {
  return nativeModule().getPublicKey(alias);
}

export async function sign(alias: string, data: Uint8Array): Promise<string> {
  return nativeModule().sign(alias, data);
}

export async function securityLevel(alias: string = DEVICE_KEY_ALIAS): Promise<SecurityLevel> {
  return (await nativeModule().securityLevel(alias)) as SecurityLevel;
}
