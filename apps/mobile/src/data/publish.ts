import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

import { apiBase } from "../api/client";
import { getFirebaseAuth, getFirebaseDb } from "../firebase";
import { hectaresFromAcres, STATUSES, type Project, type ProjectStatus } from "./types";

const writable = new Set(["draft", "awaiting_after", "needs_more_evidence"]);

function isStatus(value: unknown): value is ProjectStatus {
  return typeof value === "string" && (STATUSES as readonly string[]).includes(value);
}

function formFields(uid: string, project: Project): Record<string, unknown> {
  return {
    ownerUid: uid,
    kind: project.kind,
    organisationId: project.organisationId,
    organisationName: project.organisationName,
    species: project.species,
    treeCount: project.treeCount,
    areaAcres: project.areaAcres,
    areaHa: hectaresFromAcres(project.areaAcres),
    region: project.region,
    description: project.description,
    parcel: project.parcel,
    documentName: project.documentName,
    documentKind: project.documentKind,
    beforePhotos: project.beforePhotos,
    afterPhotos: project.afterPhotos,
    updatedAt: project.updatedAt,
  };
}

async function submitToVerifier(projectId: string, token: string): Promise<void> {
  const base = apiBase();
  if (!base) {
    throw new Error("Verifier URL is not set");
  }
  const response = await fetch(`${base}/v1/projects/${projectId}/submit`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { detail?: string } | null;
    throw new Error(body?.detail || `Verifier responded ${response.status}`);
  }
}

export async function publishProject(uid: string, project: Project): Promise<Project> {
  const db = getFirebaseDb();
  const auth = getFirebaseAuth();
  const user = auth?.currentUser;
  if (!db || !user || user.uid !== uid) {
    return project;
  }
  const ref = doc(db, "projects", project.id);
  const existing = await getDoc(ref);
  if (!existing.exists()) {
    await setDoc(ref, { ...formFields(uid, project), status: "draft" });
  } else if (writable.has(String(existing.data().status))) {
    await updateDoc(ref, formFields(uid, project));
  }
  if (project.status === "submitted") {
    const remote = (await getDoc(ref)).data()?.status;
    if (remote !== "submitted" && remote !== "under_review" && remote !== "approved" && remote !== "rejected" && remote !== "credited") {
      await submitToVerifier(project.id, await user.getIdToken());
    }
  }
  return overlayProject(project);
}

export async function overlayProject(project: Project): Promise<Project> {
  const db = getFirebaseDb();
  if (!db) {
    return project;
  }
  const snap = await getDoc(doc(db, "projects", project.id));
  if (!snap.exists()) {
    return project;
  }
  const data = snap.data();
  return {
    ...project,
    status: isStatus(data.status) ? data.status : project.status,
    adminNote: typeof data.adminNote === "string" ? data.adminNote : project.adminNote,
  };
}
