import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { useSession } from "../src/auth/AuthProvider";
import { colors } from "../src/theme/tokens";

export default function Index() {
  const { ready, session } = useSession();
  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.wash }}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }
  if (!session) {
    return <Redirect href="/sign-in" />;
  }
  return <Redirect href="/home" />;
}
