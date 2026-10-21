export type Health = {
  status: string;
  storageBackend?: string;
};

export function apiBase(): string {
  const value = process.env.EXPO_PUBLIC_API_URL || process.env.EXPO_PUBLIC_VERIFIER_URL || "";
  return value.replace(/\/$/, "");
}

export async function fetchHealth(): Promise<Health | null> {
  const base = apiBase();
  if (!base) {
    return null;
  }
  const response = await fetch(`${base}/health`);
  if (!response.ok) {
    throw new Error(`Verifier responded ${response.status}`);
  }
  return (await response.json()) as Health;
}
