import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps, type ViewStyle } from "react-native";
import type { ReactNode } from "react";

import type { ProjectStatus } from "../data/types";
import { statusLabel } from "../data/types";
import { colors, radius, space, type as typeToken } from "../theme/tokens";

export function PhoneColumn({ children }: { children: ReactNode }) {
  return <View style={styles.column}>{children}</View>;
}

export function Screen({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

export function TopBar({
  title,
  credits,
  trailing,
}: {
  title?: string;
  credits?: string;
  trailing?: ReactNode;
}) {
  return (
    <View style={styles.topBar}>
      <Text style={styles.brand}>Sundarban</Text>
      <View style={styles.topActions}>
        {credits !== undefined ? (
          <View style={styles.creditChip}>
            <Text style={styles.creditText}>{credits} CC</Text>
          </View>
        ) : null}
        {trailing}
        {title ? <Text style={styles.topTitle}>{title}</Text> : null}
      </View>
    </View>
  );
}

export function PillButton({
  label,
  onPress,
  tone = "black",
  disabled,
}: {
  label: string;
  onPress: () => void;
  tone?: "black" | "green" | "ghost";
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.pill,
        tone === "green" && styles.pillGreen,
        tone === "ghost" && styles.pillGhost,
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.pillLabel, tone === "ghost" && styles.pillLabelDark]}>{label}</Text>
    </Pressable>
  );
}

export function Field({ label, ...input }: { label: string } & TextInputProps) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput placeholderTextColor={colors.muted} style={styles.field} {...input} />
    </View>
  );
}

export function StatusChip({ status }: { status: ProjectStatus }) {
  const tone = chipTone(status);
  return (
    <View style={[styles.status, tone.box]}>
      <Text style={[styles.statusText, tone.text]}>{statusLabel(status)}</Text>
    </View>
  );
}

export function ProjectCard({
  title,
  meta,
  status,
  onPress,
}: {
  title: string;
  meta: string;
  status: ProjectStatus;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.photo}>
        <Text style={styles.photoText}>{title}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardMeta}>{meta}</Text>
        <StatusChip status={status} />
      </View>
    </Pressable>
  );
}

function chipTone(status: ProjectStatus): { box: ViewStyle; text: { color: string } } {
  if (status === "approved") {
    return { box: { backgroundColor: colors.chip }, text: { color: colors.brand } };
  }
  if (status === "credited") {
    return { box: { backgroundColor: colors.brand }, text: { color: colors.white } };
  }
  if (status === "rejected") {
    return { box: { backgroundColor: "#FECACA" }, text: { color: colors.danger } };
  }
  if (status === "draft" || status === "needs_more_evidence") {
    return { box: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line }, text: { color: colors.ink } };
  }
  return { box: { backgroundColor: colors.black }, text: { color: colors.white } };
}

const styles = StyleSheet.create({
  column: {
    flex: 1,
    width: "100%",
    maxWidth: 393,
    alignSelf: "center",
    backgroundColor: colors.wash,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.wash,
    paddingHorizontal: space.inset,
    paddingBottom: 16,
  },
  topBar: {
    minHeight: 72,
    paddingTop: 8,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: {
    fontFamily: typeToken.family,
    fontSize: 16,
    fontWeight: "700",
    color: colors.brand,
  },
  topActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  topTitle: { fontFamily: typeToken.family, fontSize: 16, fontWeight: "700" },
  creditChip: {
    backgroundColor: colors.chip,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  creditText: { color: colors.brand, fontWeight: "700", fontFamily: typeToken.family },
  pill: {
    backgroundColor: colors.black,
    borderRadius: radius.pill,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  pillGreen: { backgroundColor: colors.brand },
  pillGhost: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  pillLabel: { color: colors.white, fontFamily: typeToken.family, fontWeight: "700", fontSize: 16 },
  pillLabelDark: { color: colors.black },
  disabled: { opacity: 0.45 },
  fieldWrap: { gap: 6 },
  fieldLabel: { fontFamily: typeToken.family, fontWeight: "500", color: colors.ink },
  field: {
    minHeight: space.field,
    borderRadius: radius.field,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    fontFamily: typeToken.family,
    fontSize: 16,
  },
  status: { alignSelf: "flex-start", borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontFamily: typeToken.family, fontSize: 12, fontWeight: "700", textTransform: "capitalize" },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.card,
    overflow: "hidden",
    marginBottom: 12,
  },
  photo: {
    height: 120,
    backgroundColor: colors.chip,
    justifyContent: "flex-end",
    padding: 12,
  },
  photoText: { fontFamily: typeToken.family, fontWeight: "700", color: colors.ink },
  cardBody: { padding: 12, gap: 6 },
  cardTitle: { fontFamily: typeToken.family, fontSize: 18, fontWeight: "700" },
  cardMeta: { fontFamily: typeToken.family, color: colors.muted },
});
