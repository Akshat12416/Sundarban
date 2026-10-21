import { router, Slot, usePathname } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PhoneColumn } from "../../src/components/ui";
import { colors } from "../../src/theme/tokens";

const tabs = [
  { href: "/home", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/history", label: "Credits" },
  { href: "/profile", label: "Profile" },
] as const;

export default function MainLayout() {
  const pathname = usePathname();
  return (
    <PhoneColumn>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <View style={{ flex: 1 }}>
          <Slot />
        </View>
        <View style={styles.bar}>
          {tabs.slice(0, 2).map((tab) => (
            <TabLink key={tab.href} label={tab.label} active={pathname === tab.href} onPress={() => router.push(tab.href)} />
          ))}
          <Pressable accessibilityRole="button" onPress={() => router.push("/wizard")} style={styles.centre}>
            <Text style={styles.centreText}>+ New</Text>
          </Pressable>
          {tabs.slice(2).map((tab) => (
            <TabLink key={tab.href} label={tab.label} active={pathname === tab.href} onPress={() => router.push(tab.href)} />
          ))}
        </View>
      </SafeAreaView>
    </PhoneColumn>
  );
}

function TabLink({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.tab}>
      <Text style={[styles.tabText, active && styles.tabActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 80,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  tab: { minWidth: 64, alignItems: "center" },
  tabText: { fontFamily: "Inter", color: colors.muted, fontWeight: "500" },
  tabActive: { color: colors.black, fontWeight: "700" },
  centre: {
    backgroundColor: colors.black,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  centreText: { color: colors.white, fontFamily: "Inter", fontWeight: "700" },
});
