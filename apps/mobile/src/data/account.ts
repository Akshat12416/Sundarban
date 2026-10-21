import AsyncStorage from "@react-native-async-storage/async-storage";

import { overlayProject, publishProject } from "./publish";
import type { CreditRow, DataSource, Profile, Project } from "./types";

type AccountFile = {
  profile: Profile;
  projects: Project[];
  credits: CreditRow[];
};

export function accountSource(uid: string, email: string): DataSource {
  const key = `sundarban.account.${uid}`;
  let current: AccountFile | null = null;

  async function load(): Promise<AccountFile> {
    if (current) {
      return current;
    }
    const raw = await AsyncStorage.getItem(key);
    if (raw) {
      try {
        current = JSON.parse(raw) as AccountFile;
        return current;
      } catch {
        current = null;
      }
    }
    current = {
      profile: {
        name: "",
        email,
        phone: "",
        bio: "",
        walletAddress: "",
        kind: "individual",
      },
      projects: [],
      credits: [],
    };
    await AsyncStorage.setItem(key, JSON.stringify(current));
    return current;
  }

  async function save(next: AccountFile): Promise<void> {
    current = next;
    await AsyncStorage.setItem(key, JSON.stringify(next));
  }

  return {
    async listProjects() {
      const projects = (await load()).projects.map((item) => ({ ...item }));
      const overlaid = await Promise.all(projects.map((item) => overlayProject(item).catch(() => item)));
      return overlaid;
    },
    async getProject(id) {
      const found = (await load()).projects.find((item) => item.id === id);
      if (!found) {
        return null;
      }
      return overlayProject({ ...found }).catch(() => ({ ...found }));
    },
    async saveProject(project) {
      const file = await load();
      const next = { ...project, updatedAt: new Date().toISOString() };
      const index = file.projects.findIndex((item) => item.id === project.id);
      const projects = [...file.projects];
      if (index >= 0) {
        projects[index] = next;
      } else {
        projects.unshift(next);
      }
      await save({ ...file, projects });
      try {
        const published = await publishProject(uid, next);
        projects[index >= 0 ? index : 0] = published;
        await save({ ...file, projects });
        return { ...published };
      } catch {
        return { ...next };
      }
    },
    async listCredits() {
      return (await load()).credits.map((item) => ({ ...item }));
    },
    async getProfile() {
      return { ...(await load()).profile };
    },
    async saveProfile(profile) {
      const file = await load();
      await save({ ...file, profile: { ...profile } });
      return { ...profile };
    },
  };
}
