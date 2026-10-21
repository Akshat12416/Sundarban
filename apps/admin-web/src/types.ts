export const STATUSES = [
  "draft",
  "awaiting_after",
  "submitted",
  "under_review",
  "approved",
  "rejected",
  "needs_more_evidence",
  "credited",
] as const;

export type ProjectStatus = (typeof STATUSES)[number];

export type Finding = {
  type: string;
  evidence: string;
  explanation: string;
};

export type AgentOutput = {
  agent: string;
  version: string;
  score: number;
  decision: string;
  findings: Finding[];
  confidence: number;
};

export type RiskReport = {
  id: string;
  overall_risk: string;
  recommendation: string;
  agent_outputs: AgentOutput[];
  report_hash: string;
  model_id: string;
  prompt_versions: string[];
};

export type EvidenceItem = {
  id: string;
  kind: string;
  attested: boolean;
  sha256: string;
  capturedAt: string;
};

export type Parcel = {
  latitude?: string;
  longitude?: string;
  radiusM?: number;
  accuracyM?: string;
};

export type ReviewProject = {
  id: string;
  ownerUid: string;
  status: ProjectStatus;
  species: string;
  treeCount: string;
  areaAcres: string;
  areaHa: string;
  region: string;
  description: string;
  organisationName: string;
  organisationId: string;
  kind: string;
  parcel: Parcel | null;
  documentName: string;
  documentKind: string;
  adminNote: string;
  updatedAt: string;
  risk: string;
};

export function statusLabel(status: string): string {
  return status.replaceAll("_", " ");
}
