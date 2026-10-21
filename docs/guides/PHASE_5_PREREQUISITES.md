# Before Phase 5

Do these steps yourself before the mobile app is scaffolded. They prove the phone can see the Mac, pick how Phase 5b will be built, and put Firebase and the verifier where the app can reach them.

Do not paste keys, passwords, or the filled `apps/mobile/.env` into chat or into a commit.

The Firebase project is the existing one, `sundarban-a64ea`. Do not create another project and do not open `carbonvault-c2f6a`.

## 1. Expo Go on your phone and your Mac

This check uses Expo Go only. Phase 5b cannot stay on Expo Go, because the signing key has to live in the Android Keystore and Expo Go cannot create that key. Step 1 only proves the phone and the Mac can see each other.

1. On the phone, install **Expo Go** from the Play Store (Android) or the App Store (iPhone).
2. Put the phone and the Mac on the same Wi-Fi. Turn off any VPN on both.
3. On the Mac, open Terminal. Go somewhere that is **not** this repository, so the starter app is never committed:

```
cd /tmp
rm -rf expo-check
npx create-expo-app@latest expo-check
cd expo-check
npx expo start
```

4. A QR code appears in the terminal. In Expo Go, scan it (Android) or use the Camera app (iPhone). Wait until the starter screen is visible on the phone.

Check: the phone shows the Expo starter screen, and the terminal does not say the phone failed to connect. Then stop the server with Ctrl+C and delete the temporary app:

```
cd /tmp
rm -rf expo-check
```

`git status` in this repository must not list `expo-check`.

## 2. Choose the Phase 5b build

Phase 5b needs a development build, not Expo Go. Pick one of the two paths and finish that path only.

On 2026-10-21 this Mac had about 3 GB free after the local model download. Android Studio plus its SDK is larger than that. If `df -h /` still shows less than about 15 GB free, use the EAS path.

### Path A. EAS cloud build

Use this when you do not want Android Studio on the Mac. Expo builds the Android development client in the cloud. You install that client on the phone once.

1. Create a free Expo account at [https://expo.dev/signup](https://expo.dev/signup) if you do not have one.
2. On the Mac:

```
npm install -g eas-cli
eas login
```

The browser or the terminal asks you to sign in. Use the Expo account from step 1.

3. `apps/mobile` does not exist yet. After Phase 5a creates it, run this from `apps/mobile`, not from the repository root:

```
cd apps/mobile
eas build:configure
eas build --profile development --platform android
```

4. When the site shows a finished build, open the install link on the Android phone and install the development client. That client replaces Expo Go for this project.

Check: `eas whoami` prints your Expo username. The Expo website shows a development build with status finished. The phone has an app icon for the Sundarban development build, separate from Expo Go.

Do not commit `apps/mobile/android/`, keystores, or any file EAS prints a secret into. Commit `eas.json` only when Phase 5 adds it and it contains no passwords.

### Path B. Local build with Android Studio

Use this only when the Mac has the disk space.

1. Download Android Studio from [https://developer.android.com/studio](https://developer.android.com/studio). Open the `.dmg`, drag **Android Studio** to **Applications**, and open it.
2. The setup wizard: choose **Standard**. Let it install the Android SDK, Android SDK Platform, and Android SDK Build-Tools. Wait until it says the install finished.
3. Plug in the Android phone. On the phone, open **Settings → About phone** and tap **Build number** seven times. Go back to **Settings → System → Developer options** and turn **USB debugging** on. Accept the prompt that names this Mac.
4. In Android Studio, open **Device Manager** and confirm the phone is listed as an online device. You do not need a virtual device.
5. After Phase 5a creates `apps/mobile`, from that directory:

```
cd apps/mobile
npx expo run:android
```

The first run compiles the native app and installs it on the phone. Later starts can use `npx expo start --dev-client`.

Check: `adb devices` prints the phone serial and the word `device`, not `unauthorized`. The phone shows the Sundarban development build.

Do not commit `apps/mobile/android/`, `*.keystore`, `*.jks`, or `local.properties`.

## 3. Email/Password sign-in, and a Web app

Google sign-in may already be on. Leave it on. This step adds email and password, which the phone app will use.

1. Open [https://console.firebase.google.com/](https://console.firebase.google.com/) and select project **sundarban-a64ea**.
2. Open **Build → Authentication → Sign-in method**.
3. Click **Email/Password**. Turn **Enable** on. Leave the email-link option off. Click **Save**.
4. Open the gear, **Project settings → General**.
5. Under **Your apps**, click **Add app** and choose the **Web** icon (`</>`).
6. App nickname: `Sundarban mobile`. Do not turn on Firebase Hosting. Click **Register app**.
7. The page shows a `firebaseConfig` object. Copy the values into `apps/mobile/.env`, using the names in `apps/mobile/.env.example`. Create `apps/mobile/.env` by copying the example. The mapping is:

| Config field | Variable |
|---|---|
| `apiKey` | `EXPO_PUBLIC_FIREBASE_API_KEY` |
| `authDomain` | `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` |
| `projectId` | `EXPO_PUBLIC_FIREBASE_PROJECT_ID` |
| `messagingSenderId` | `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` |
| `appId` | `EXPO_PUBLIC_FIREBASE_APP_ID` |

8. Leave `EXPO_PUBLIC_VERIFIER_URL` for step 4. Click **Continue to console**. You can skip the rest of the wizard.

Check: **Authentication → Sign-in method** shows Email/Password as Enabled. **Project settings → Your apps** lists `Sundarban mobile`. `git status` does not list `apps/mobile/.env`.

There is no `google-services.json` in this step. If a later screen offers that file, download it only into `apps/mobile/` and do not commit it.

## 4. Verifier on the Mac, reachable from the phone

The phone cannot use `127.0.0.1`. That address is the phone itself. The app must use the Mac's Wi-Fi address.

Leave `FIRESTORE_EMULATOR_HOST` and `FIREBASE_AUTH_EMULATOR_HOST` set in `services/verifier/.env`. The phone talks to the API on the Mac, and the API keeps using the emulators. Do not point this step at production Firestore.

1. From the repository root, start the emulators if they are not already running:

```
JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home PATH="$JAVA_HOME/bin:$PATH" firebase emulators:start --only auth,firestore
```

2. In a second terminal:

```
cd services/verifier
.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
```

`--host 0.0.0.0` is what makes the service listen on the Wi-Fi address. The default host is loopback only.

3. On the Mac:

```
ipconfig getifaddr en0
curl -sS http://127.0.0.1:8000/health
```

`en0` is the usual Wi-Fi interface. If that command prints nothing, try `ipconfig getifaddr en1`.

4. Put that address into `apps/mobile/.env`:

```
EXPO_PUBLIC_VERIFIER_URL=http://THE_ADDRESS:8000
```

5. On the phone, open the browser and go to `http://THE_ADDRESS:8000/health`.

Check: the Mac curl and the phone browser both show JSON with `"status": "ok"`. If the Mac works and the phone does not, the firewall or the Wi-Fi is blocking it. Open **System Settings → Network → Firewall**. If the firewall is on, allow incoming connections for Python, or turn the firewall off while you develop. Some guest networks isolate clients from each other. Use a network where the phone can reach the Mac.

Stop the server with Ctrl+C when you are done. Do not leave a production Firebase credential in the mobile env. `GOOGLE_APPLICATION_CREDENTIALS` stays in `services/verifier/.env` only.

## What must never be committed

- `apps/mobile/.env` and any other filled `.env`
- `services/verifier/.env`, `bench/.env`, `contracts/.env`
- `services/verifier/secrets/` and any Admin SDK JSON
- `google-services.json`, `GoogleService-Info.plist`
- `*.keystore`, `*.jks`, `local.properties`
- `SUPABASE_SECRET_KEY`, `GEMINI_API_KEY`, `DEPLOYER_PRIVATE_KEY`, and the Supabase URL if it is only in `.env`
- the temporary `/tmp/expo-check` app, and a copied `android/` directory from a local build

`apps/mobile/.env.example` is the file that belongs in git. Its values stay empty except the project id.

Check from the repository root:

```
git status --short
git check-ignore -v apps/mobile/.env services/verifier/.env bench/.env
```

You want `git status` to show no `.env`, no JSON key, and no keystore. `git check-ignore` should print a gitignore rule for each of those three paths once the filled mobile file exists.
