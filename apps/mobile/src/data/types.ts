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

export type AccountKind = "individual" | "organisation";

export type Profile = {
  name: string;
  email: string;
  phone: string;
  bio: string;
  walletAddress: string;
  kind: AccountKind;
};

export type Parcel = {
  latitude: string;
  longitude: string;
  radiusM: number;
  accuracyM: string;
};

export type Project = {
  id: string;
  kind: AccountKind;
  organisationId: string;
  organisationName: string;
  species: string;
  treeCount: string;
  areaAcres: string;
  region: string;
  description: string;
  parcel: Parcel | null;
  documentName: string;
  documentKind: "land_record" | "mou" | "";
  beforePhotos: number;
  afterPhotos: number;
  status: ProjectStatus;
  adminNote: string;
  updatedAt: string;
};

export type CreditRow = {
  id: string;
  projectId: string;
  projectName: string;
  credits: string;
  txHash: string;
  at: string;
};

export type DataSource = {
  listProjects: () => Promise<Project[]>;
  getProject: (id: string) => Promise<Project | null>;
  saveProject: (project: Project) => Promise<Project>;
  listCredits: () => Promise<CreditRow[]>;
  getProfile: () => Promise<Profile>;
  saveProfile: (profile: Profile) => Promise<Profile>;
};

export function hectaresFromAcres(acres: string): string {
  const value = Number(acres);
  if (!Number.isFinite(value) || value < 0) {
    return "";
  }
  return (Math.round(value * 40.4686) / 100).toFixed(2);
}

export function statusLabel(status: ProjectStatus): string {
  return status.replaceAll("_", " ");
}
