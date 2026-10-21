import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { useSession } from "../../src/auth/AuthProvider";
import { PillButton, ProjectCard, Screen, TopBar } from "../../src/components/ui";
import { useData } from "../../src/data/store";
import type { Profile, Project } from "../../src/data/types";
import { colors } from "../../src/theme/tokens";

export default function ProfileScreen() {
  const data = useData();
  const { session, signOut } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tab, setTab] = useState<"projects" | "drafts">("projects");

  useFocusEffect(
    useCallback(() => {
      void data.getProfile().then(setProfile);
      void data.listProjects().then(setProjects);
    }, [data]),
  );

  const visible = tab === "drafts" ? projects.filter((item) => item.status === "draft") : projects;

  return (
    <Screen>
      <TopBar
        trailing={
          <Pressable onPress={() => router.push("/profile-edit")}>
            <Text style={{ fontFamily: "Inter", fontWeight: "700" }}>Edit</Text>
          </Pressable>
        }
      />
      <Text style={{ fontFamily: "Inter", fontSize: 28, fontWeight: "700" }}>{profile?.name || "Profile"}</Text>
      <Text style={{ fontFamily: "Inter", color: colors.muted, marginBottom: 8 }}>{session?.email}</Text>
      <Text style={{ fontFamily: "Inter", marginBottom: 8 }}>{profile?.bio}</Text>
      <Text style={{ fontFamily: "Inter", marginBottom: 12 }}>
        Wallet {profile?.walletAddress || "not set"}
      </Text>
      <Text style={{ fontFamily: "Inter", color: colors.muted, marginBottom: 12 }}>
        The device signing key is not available in Expo Go. It is added in the next build.
      </Text>
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
        <Pressable onPress={() => setTab("projects")}>
          <Text style={{ fontFamily: "Inter", fontWeight: tab === "projects" ? "700" : "500" }}>Projects</Text>
        </Pressable>
        <Pressable onPress={() => setTab("drafts")}>
          <Text style={{ fontFamily: "Inter", fontWeight: tab === "drafts" ? "700" : "500" }}>Drafts</Text>
        </Pressable>
      </View>
      <ScrollView>
        {visible.length === 0 ? <Text style={{ fontFamily: "Inter" }}>No projects yet.</Text> : null}
        {visible.map((item) => (
          <ProjectCard
            key={item.id}
            title={item.species}
            meta={item.region}
            status={item.status}
            onPress={() => router.push(`/project/${item.id}`)}
          />
        ))}
      </ScrollView>
      <PillButton
        label="Sign out"
        tone="ghost"
        onPress={() => {
          void signOut().then(() => router.replace("/sign-in"));
        }}
      />
    </Screen>
  );
}
