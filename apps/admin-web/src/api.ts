import { auth } from "./firebase";

export function verifierBase(): string {
  return (import.meta.env.VITE_VERIFIER_URL || "").replace(/\/$/, "");
}

export async function evidenceUrl(evidenceId: string): Promise<string> {
  const base = verifierBase();
  const user = auth?.currentUser;
  if (!base || !user) {
    throw new Error("Verifier URL or admin session is missing");
  }
  const token = await user.getIdToken();
  const response = await fetch(`${base}/v1/files/${evidenceId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { detail?: string } | null;
    throw new Error(body?.detail || `Verifier responded ${response.status}`);
  }
  const payload = (await response.json()) as { url?: string };
  if (!payload.url) {
    throw new Error("Verifier did not return a file URL");
  }
  return payload.url;
}
