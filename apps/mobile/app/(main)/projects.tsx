import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text } from "react-native";

import { ProjectCard, Screen, TopBar } from "../../src/components/ui";
import { hectaresFromAcres, type Project } from "../../src/data/types";
import { useData } from "../../src/data/store";
import { colors } from "../../src/theme/tokens";

export default function ProjectsScreen() {
  const data = useData();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    void data.listProjects().then(setProjects);
  }, [data]);

  return (
    <Screen>
      <TopBar title="My Projects" />
      <ScrollView>
        {projects.length === 0 ? (
          <Text style={{ fontFamily: "Inter", color: colors.muted }}>No projects yet.</Text>
        ) : (
          projects.map((item) => (
            <ProjectCard
              key={item.id}
              title={`${item.species} · ${item.region}`}
              meta={`${item.areaAcres} acres · ${hectaresFromAcres(item.areaAcres)} ha · ${item.treeCount} trees`}
              status={item.status}
              onPress={() => router.push(`/project/${item.id}`)}
            />
          ))
        )}
      </ScrollView>
    </Screen>
  );
}
