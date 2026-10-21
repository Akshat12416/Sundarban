import { useEffect, useState } from "react";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";

import { Screen, TopBar } from "../../src/components/ui";
import type { CreditRow, Project } from "../../src/data/types";
import { useData } from "../../src/data/store";
import { colors } from "../../src/theme/tokens";

export default function HistoryScreen() {
  const data = useData();
  const [rows, setRows] = useState<CreditRow[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    void data.listCredits().then(setRows);
    void data.listProjects().then(setProjects);
  }, [data]);

  const credited = rows.reduce((sum, row) => sum + Number(row.credits), 0);
  const pending = projects.filter((item) => item.status === "approved").length;

  return (
    <Screen>
      <TopBar title="Credits" />
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
        <Summary title="Total earned" value={`${credited} CC`} dark />
        <Summary title="Pending issuance" value={String(pending)} />
      </View>
      <Text style={{ fontFamily: "Inter", color: colors.muted, marginBottom: 12 }}>
        Sample rows use a placeholder hash. A real issuance will use the Sepolia transaction.
      </Text>
      <ScrollView>
        {rows.map((row) => (
          <Pressable
            key={row.id}
            onPress={() => void Linking.openURL(`https://sepolia.etherscan.io/tx/${row.txHash}`)}
            style={{ backgroundColor: colors.white, borderRadius: 16, padding: 14, marginBottom: 10 }}
          >
            <Text style={{ fontFamily: "Inter", fontWeight: "700" }}>{row.projectName}</Text>
            <Text style={{ fontFamily: "Inter", color: colors.muted }}>{row.at.slice(0, 10)}</Text>
            <Text style={{ fontFamily: "Inter", color: colors.brand, fontWeight: "700" }}>{row.credits} CC</Text>
            <Text style={{ fontFamily: "Inter", color: colors.muted }}>{row.txHash.slice(0, 18)}…</Text>
          </Pressable>
        ))}
      </ScrollView>
    </Screen>
  );
}

function Summary({ title, value, dark }: { title: string; value: string; dark?: boolean }) {
  return (
    <View style={{ flex: 1, backgroundColor: dark ? colors.brand : colors.chip, borderRadius: 16, padding: 14 }}>
      <Text style={{ fontFamily: "Inter", color: dark ? colors.white : colors.ink }}>{title}</Text>
      <Text style={{ fontFamily: "Inter", fontSize: 24, fontWeight: "700", color: dark ? colors.white : colors.ink }}>{value}</Text>
    </View>
  );
}
