import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PhoneColumn, PillButton, StatusChip } from "../../src/components/ui";
import { useData } from "../../src/data/store";
import { hectaresFromAcres, STATUSES, type Project } from "../../src/data/types";
import { colors } from "../../src/theme/tokens";

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const data = useData();
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    if (id) {
      void data.getProject(id).then(setProject);
    }
  }, [data, id]);

  async function update(next: Project) {
    const saved = await data.saveProject(next);
    setProject(saved);
  }

  if (!project) {
    return (
      <PhoneColumn>
        <SafeAreaView style={{ flex: 1, padding: 16 }}>
          <Text style={{ fontFamily: "Inter" }}>Project not found.</Text>
          <PillButton label="Close" onPress={() => router.back()} />
        </SafeAreaView>
      </PhoneColumn>
    );
  }

  const reached = STATUSES.indexOf(project.status);

  return (
    <PhoneColumn>
      <SafeAreaView style={{ flex: 1, padding: 16 }}>
        <StatusChip status={project.status} />
        <Text style={{ fontFamily: "Inter", fontSize: 32, fontWeight: "700", marginVertical: 8 }}>{project.species}</Text>
        <Text style={{ fontFamily: "Inter", color: colors.muted, marginBottom: 12 }}>
          {project.treeCount} trees · {project.areaAcres} acres · {hectaresFromAcres(project.areaAcres)} ha · {project.region}
        </Text>
        <ScrollView contentContainerStyle={{ gap: 10, paddingBottom: 16 }}>
          <Text style={{ fontFamily: "Inter" }}>{project.description}</Text>
          {project.parcel ? (
            <Text style={{ fontFamily: "Inter" }}>
              Parcel {project.parcel.latitude}, {project.parcel.longitude} · {project.parcel.radiusM} m · accuracy {project.parcel.accuracyM} m
            </Text>
          ) : null}
          <Text style={{ fontFamily: "Inter" }}>
            Before photos {project.beforePhotos} · After photos {project.afterPhotos}
          </Text>
          {project.documentName ? <Text style={{ fontFamily: "Inter" }}>Document {project.documentName}</Text> : null}
          {project.adminNote ? (
            <View style={{ backgroundColor: colors.chip, borderRadius: 16, padding: 12 }}>
              <Text style={{ fontFamily: "Inter", fontWeight: "700" }}>Reviewer note</Text>
              <Text style={{ fontFamily: "Inter" }}>{project.adminNote}</Text>
            </View>
          ) : null}
          <Text style={{ fontFamily: "Inter", fontWeight: "700", marginTop: 8 }}>Status</Text>
          {STATUSES.map((status, index) => (
            <Text key={status} style={{ fontFamily: "Inter", color: index <= reached ? colors.black : colors.muted }}>
              {index <= reached ? "●" : "○"} {status.replaceAll("_", " ")}
            </Text>
          ))}
        </ScrollView>
        {project.status === "awaiting_after" ? (
          <PillButton
            label="Add an after photo"
            tone="green"
            onPress={() =>
              void update({
                ...project,
                afterPhotos: project.afterPhotos + 1,
                status: "submitted",
              })
            }
          />
        ) : null}
        {project.status === "needs_more_evidence" ? (
          <PillButton
            label="Recapture"
            tone="green"
            onPress={() =>
              void update({
                ...project,
                afterPhotos: project.afterPhotos + 1,
                status: "submitted",
                adminNote: "",
              })
            }
          />
        ) : null}
        <View style={{ height: 8 }} />
        <PillButton label="Close" tone="ghost" onPress={() => router.back()} />
      </SafeAreaView>
    </PhoneColumn>
  );
}
