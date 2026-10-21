import Constants from "expo-constants";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { useEffect, useRef } from "react";

import { PillButton } from "../components/ui";
import { getFirebaseAuth } from "../firebase";

WebBrowser.maybeCompleteAuthSession();

export function GoogleSignIn({
  onDone,
  onError,
}: {
  onDone: () => void;
  onError: (message: string) => void;
}) {
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: webClientId || "missing.apps.googleusercontent.com",
    androidClientId,
  });

  const onDoneRef = useRef(onDone);
  const onErrorRef = useRef(onError);
  onDoneRef.current = onDone;
  onErrorRef.current = onError;

  useEffect(() => {
    if (response?.type !== "success") {
      return;
    }
    const idToken = response.authentication?.idToken ?? response.params.id_token;
    const auth = getFirebaseAuth();
    if (!auth || !idToken) {
      onErrorRef.current("Google did not return an ID token. Check the web client ID.");
      return;
    }
    void signInWithCredential(auth, GoogleAuthProvider.credential(idToken))
      .then(() => onDoneRef.current())
      .catch((caught: unknown) => {
        onErrorRef.current(caught instanceof Error ? caught.message : "Google sign-in failed.");
      });
  }, [response]);

  return (
    <PillButton
      label="Continue with Google"
      tone="ghost"
      disabled={!request}
      onPress={() => {
        if (Constants.executionEnvironment === "storeClient") {
          onError("Google sign-in is in the Android development build, not Expo Go.");
          return;
        }
        if (!webClientId) {
          onError("Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID from the Firebase Google provider.");
          return;
        }
        void promptAsync();
      }}
    />
  );
}
