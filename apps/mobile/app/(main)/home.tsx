import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { apiBase, fetchHealth } from "../../src/api/client";
import { useSession } from "../../src/auth/AuthProvider";
import { ProjectCard, Screen, TopBar } from "../../src/components/ui";
import { hectaresFromAcres, type Project } from "../../src/data/types";
import { useData } from "../../src/data/store";
import { colors } from "../../src/theme/tokens";

export default function HomeScreen() {
  const data = useData();
  const { session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tab, setTab] = useState<"projects" | "credits">("projects");
  const [health, setHealth] = useState("Verifier not configured");
  const [notices, setNotices] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void data.listProjects().then(setProjects);
      const base = apiBase();
      if (!base) {
        setHealth("Verifier not configured");
        return;
      }
      void fetchHealth()
        .then((body) => setHealth(body ? `Verifier ${body.status}` : "Verifier not configured"))
        .catch(() => setHealth("Verifier unreachable"));
    }, [data]),
  );

  const visible = tab === "credits" ? projects.filter((item) => item.status === "credited") : projects;
  const total = projects.filter((item) => item.status === "credited").length * 50;

  return (
    <Screen>
      <TopBar
        credits={String(total)}
        trailing={
          <Pressable onPress={() => setNotices((open) => !open)}>
            <Text style={{ fontFamily: "Inter", fontWeight: "700" }}>Alerts</Text>
          </Pressable>
        }
      />
      <Text style={{ fontFamily: "Inter", fontSize: 32, fontWeight: "700" }}>Welcome back</Text>
      <Text style={{ fontFamily: "Inter", color: colors.muted, marginBottom: 12 }}>{session?.email}</Text>
      <Text style={{ fontFamily: "Inter", color: colors.muted, marginBottom: 12 }}>{health}</Text>
      {notices ? (
        <View style={{ backgroundColor: colors.white, borderRadius: 16, padding: 12, marginBottom: 12 }}>
          {projects.slice(0, 3).map((item) => (
            <Text key={item.id} style={{ fontFamily: "Inter", marginBottom: 6 }}>
              {item.species} is {item.status.replaceAll("_", " ")}
            </Text>
          ))}
        </View>
      ) : null}
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
        <Tab label="My Projects" selected={tab === "projects"} onPress={() => setTab("projects")} />
        <Tab label="Credits" selected={tab === "credits"} onPress={() => setTab("credits")} />
      </View>
      <ScrollView>
        {visible.length === 0 ? (
          <Text style={{ fontFamily: "Inter", color: colors.muted }}>No projects yet. Use + New to start one.</Text>
        ) : null}
        {visible.map((item) => (
          <ProjectCard
            key={item.id}
            title={item.species}
            meta={`${item.areaAcres} acres · ${hectaresFromAcres(item.areaAcres)} ha · ${item.treeCount} trees`}
            status={item.status}
            onPress={() => router.push(`/project/${item.id}`)}
          />
        ))}
      </ScrollView>
    </Screen>
  );
}

function Tab({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: selected ? colors.black : colors.white,
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 8,
      }}
    >
      <Text style={{ color: selected ? colors.white : colors.black, fontFamily: "Inter", fontWeight: "700" }}>{label}</Text>
    </Pressable>
  );
}
