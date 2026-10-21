import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSession } from "../src/auth/AuthProvider";
import { Field, PhoneColumn, PillButton } from "../src/components/ui";
import { colors } from "../src/theme/tokens";

export default function SignInScreen() {
  const { signIn, signUp, useSample, configured } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function run(action: "in" | "up") {
    setBusy(true);
    setError("");
    try {
      if (action === "in") {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      router.replace("/home");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PhoneColumn>
      <SafeAreaView style={{ flex: 1, padding: 16 }}>
        <ScrollView contentContainerStyle={{ gap: 16, paddingTop: 48 }}>
          <Text style={{ fontFamily: "Inter", fontSize: 40, fontWeight: "700", letterSpacing: -0.5 }}>
            Sundarban
          </Text>
          <Text style={{ fontFamily: "Inter", fontSize: 16, lineHeight: 24, color: colors.muted }}>
            Photos are captured in this app. Email and password sign-in works here. Google sign-in and the device signing key come in the next build.
          </Text>
          <Field label="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
          <Field label="Password" secureTextEntry value={password} onChangeText={setPassword} />
          {error ? <Text style={{ color: colors.danger, fontFamily: "Inter" }}>{error}</Text> : null}
          <PillButton label={busy ? "Please wait" : "Sign in"} onPress={() => void run("in")} disabled={busy} />
          <PillButton label="Create account" tone="green" onPress={() => void run("up")} disabled={busy} />
          <PillButton
            label={configured ? "Browse sample projects" : "Continue with sample data"}
            tone="ghost"
            onPress={() => {
              useSample();
              router.replace("/home");
            }}
          />
          {!configured ? (
            <Text style={{ fontFamily: "Inter", color: colors.muted }}>
              Firebase keys are not in apps/mobile/.env yet. Sample data still opens every screen.
            </Text>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </PhoneColumn>
  );
}
