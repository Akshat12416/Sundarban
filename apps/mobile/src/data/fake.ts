import type { CreditRow, DataSource, Profile, Project } from "./types";

const profile: Profile = {
  name: "Sample contributor",
  email: "contributor@example.com",
  phone: "",
  bio: "Sample profile used before the account is saved.",
  walletAddress: "",
  kind: "individual",
};

const projects: Project[] = [
  {
    id: "p-draft",
    kind: "individual",
    organisationId: "",
    organisationName: "",
    species: "Mangrove",
    treeCount: "120",
    areaAcres: "0.5",
    region: "Sundarban",
    description: "A draft that still needs a parcel and before photos.",
    parcel: null,
    documentName: "",
    documentKind: "",
    beforePhotos: 0,
    afterPhotos: 0,
    status: "draft",
    adminNote: "",
    updatedAt: "2026-10-18T09:00:00Z",
  },
  {
    id: "p-waiting",
    kind: "individual",
    organisationId: "",
    organisationName: "",
    species: "Sundari",
    treeCount: "400",
    areaAcres: "2",
    region: "Sundarban",
    description: "Before photos are in. After photos come later.",
    parcel: { latitude: "22.500001", longitude: "88.300001", radiusM: 40, accuracyM: "4.0" },
    documentName: "land-record.pdf",
    documentKind: "land_record",
    beforePhotos: 3,
    afterPhotos: 0,
    status: "awaiting_after",
    adminNote: "",
    updatedAt: "2026-10-19T09:00:00Z",
  },
  {
    id: "p-review",
    kind: "organisation",
    organisationId: "ORG-14",
    organisationName: "Sample Nursery",
    species: "Gewa",
    treeCount: "800",
    areaAcres: "3",
    region: "Sundarban",
    description: "Submitted and waiting for review.",
    parcel: { latitude: "22.351000", longitude: "88.912000", radiusM: 60, accuracyM: "6.0" },
    documentName: "mou.pdf",
    documentKind: "mou",
    beforePhotos: 3,
    afterPhotos: 3,
    status: "under_review",
    adminNote: "",
    updatedAt: "2026-10-20T09:00:00Z",
  },
  {
    id: "p-more",
    kind: "individual",
    organisationId: "",
    organisationName: "",
    species: "Mangrove",
    treeCount: "200",
    areaAcres: "1",
    region: "Sundarban",
    description: "The reviewer asked for another after photo.",
    parcel: { latitude: "22.100000", longitude: "88.700000", radiusM: 30, accuracyM: "5.0" },
    documentName: "land-record.pdf",
    documentKind: "land_record",
    beforePhotos: 3,
    afterPhotos: 1,
    status: "needs_more_evidence",
    adminNote: "Recapture the after photo in daylight, standing inside the parcel.",
    updatedAt: "2026-10-20T12:00:00Z",
  },
  {
    id: "p-credited",
    kind: "individual",
    organisationId: "",
    organisationName: "",
    species: "Mangrove",
    treeCount: "600",
    areaAcres: "2.5",
    region: "Sundarban",
    description: "Sample credited project. The transaction hash is not a real transfer.",
    parcel: { latitude: "21.949000", longitude: "88.429000", radiusM: 80, accuracyM: "3.0" },
    documentName: "land-record.pdf",
    documentKind: "land_record",
    beforePhotos: 3,
    afterPhotos: 3,
    status: "credited",
    adminNote: "",
    updatedAt: "2026-09-12T08:30:00Z",
  },
];

const credits: CreditRow[] = [
  {
    id: "c-1",
    projectId: "p-credited",
    projectName: "Mangrove · Sundarban",
    credits: "50",
    txHash: "0xsample00000000000000000000000000000000000000000000000000000001",
    at: "2026-09-12T08:30:00Z",
  },
];

let profileState = { ...profile };
let projectState = projects.map((item) => ({ ...item }));

export const fakeSource: DataSource = {
  async listProjects() {
    return projectState.map((item) => ({ ...item }));
  },
  async getProject(id) {
    const found = projectState.find((item) => item.id === id);
    return found ? { ...found } : null;
  },
  async saveProject(project) {
    const next = { ...project, updatedAt: new Date().toISOString() };
    const index = projectState.findIndex((item) => item.id === project.id);
    if (index >= 0) {
      projectState[index] = next;
    } else {
      projectState = [next, ...projectState];
    }
    return { ...next };
  },
  async listCredits() {
    return credits.map((item) => ({ ...item }));
  },
  async getProfile() {
    return { ...profileState };
  },
  async saveProfile(next) {
    profileState = { ...next };
    return { ...profileState };
  },
};
