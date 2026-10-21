import "react-native-gesture-handler";

import { Inter_400Regular, Inter_500Medium, Inter_700Bold, useFonts } from "@expo-google-fonts/inter";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider } from "../src/auth/AuthProvider";
import { DataProvider } from "../src/data/store";
import { colors } from "../src/theme/tokens";

export default function RootLayout() {
  useFonts({
    Inter: Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
  });

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <DataProvider>
          <View style={{ flex: 1, backgroundColor: colors.wash }}>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.wash } }} />
          </View>
        </DataProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
