import { collection, doc, getDocs, updateDoc } from "firebase/firestore";

import { db } from "./firebase";
import {
  STATUSES,
  type AgentOutput,
  type EvidenceItem,
  type Finding,
  type Parcel,
  type ProjectStatus,
  type ReviewProject,
  type RiskReport,
} from "./types";

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function isStatus(value: unknown): value is ProjectStatus {
  return typeof value === "string" && (STATUSES as readonly string[]).includes(value);
}

function parcel(value: unknown): Parcel | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  return value as Parcel;
}

function findings(value: unknown): Finding[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }
    const row = item as Record<string, unknown>;
    return [
      {
        type: text(row.type),
        evidence: text(row.evidence),
        explanation: text(row.explanation),
      },
    ];
  });
}

function agents(value: unknown): AgentOutput[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }
    const row = item as Record<string, unknown>;
    return [
      {
        agent: text(row.agent),
        version: text(row.version),
        score: typeof row.score === "number" ? row.score : 0,
        decision: text(row.decision),
        findings: findings(row.findings),
        confidence: typeof row.confidence === "number" ? row.confidence : 0,
      },
    ];
  });
}

export async function listProjects(): Promise<ReviewProject[]> {
  if (!db) {
    throw new Error("Firestore is not configured");
  }
  const snapshot = await getDocs(collection(db, "projects"));
  const projects = await Promise.all(snapshot.docs.map(async (item) => {
    const data = item.data();
    const report = await latestReport(item.id);
    return {
      id: item.id,
      ownerUid: text(data.ownerUid),
      status: isStatus(data.status) ? data.status : "draft",
      species: text(data.species),
      treeCount: text(data.treeCount),
      areaAcres: text(data.areaAcres),
      areaHa: text(data.areaHa),
      region: text(data.region),
      description: text(data.description),
      organisationName: text(data.organisationName),
      organisationId: text(data.organisationId),
      kind: text(data.kind),
      parcel: parcel(data.parcel),
      documentName: text(data.documentName),
      documentKind: text(data.documentKind),
      adminNote: text(data.adminNote),
      updatedAt: text(data.updatedAt),
      risk: report?.overall_risk || "unknown",
    } satisfies ReviewProject;
  }));
  return projects.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export async function latestReport(projectId: string): Promise<RiskReport | null> {
  if (!db) {
    return null;
  }
  const snapshot = await getDocs(collection(db, "reports", projectId, "versions"));
  if (snapshot.empty) {
    return null;
  }
  const newest = [...snapshot.docs].sort((left, right) => left.id.localeCompare(right.id)).at(-1);
  if (!newest) {
    return null;
  }
  const data = newest.data();
  const versions = data.prompt_versions ?? data.promptVersions;
  return {
    id: newest.id,
    overall_risk: text(data.overall_risk ?? data.overallRisk),
    recommendation: text(data.recommendation),
    agent_outputs: agents(data.agent_outputs ?? data.agentOutputs),
    report_hash: text(data.report_hash ?? data.reportHash),
    model_id: text(data.model_id ?? data.modelId),
    prompt_versions: Array.isArray(versions) ? versions.filter((item) => typeof item === "string") : [],
  };
}

export async function listEvidence(projectId: string): Promise<EvidenceItem[]> {
  if (!db) {
    return [];
  }
  const snapshot = await getDocs(collection(db, "projects", projectId, "evidence"));
  return snapshot.docs.map((item) => {
    const data = item.data();
    const metadata = data.metadata && typeof data.metadata === "object" ? data.metadata as Record<string, unknown> : {};
    return {
      id: item.id,
      kind: text(data.kind),
      attested: data.attested === true,
      sha256: text(data.sha256),
      capturedAt: text(metadata.capturedAt),
    };
  });
}

export async function recordDecision(projectId: string, status: ProjectStatus, adminNote: string): Promise<void> {
  if (!db) {
    throw new Error("Firestore is not configured");
  }
  await updateDoc(doc(db, "projects", projectId), {
    status,
    adminNote,
    decidedAt: new Date().toISOString(),
  });
}
