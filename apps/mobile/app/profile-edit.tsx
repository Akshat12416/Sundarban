import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Field, PhoneColumn, PillButton } from "../src/components/ui";
import { useData } from "../src/data/store";
import type { Profile } from "../src/data/types";

export default function ProfileEditScreen() {
  const data = useData();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    void data.getProfile().then(setProfile);
  }, [data]);

  if (!profile) {
    return null;
  }

  return (
    <PhoneColumn>
      <SafeAreaView style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontFamily: "Inter", fontSize: 32, fontWeight: "700", marginBottom: 12 }}>Edit profile</Text>
        <ScrollView contentContainerStyle={{ gap: 12 }}>
          <Field label="Name" value={profile.name} onChangeText={(name) => setProfile({ ...profile, name })} />
          <Field label="Phone" value={profile.phone} onChangeText={(phone) => setProfile({ ...profile, phone })} />
          <Field label="Bio" value={profile.bio} onChangeText={(bio) => setProfile({ ...profile, bio })} multiline />
          <Field
            label="Wallet address"
            autoCapitalize="none"
            value={profile.walletAddress}
            onChangeText={(walletAddress) => setProfile({ ...profile, walletAddress })}
          />
        </ScrollView>
        <PillButton
          label="Save"
          tone="green"
          onPress={() => {
            void data.saveProfile(profile).then(() => router.back());
          }}
        />
      </SafeAreaView>
    </PhoneColumn>
  );
}
