# Before Phase 1

Do these steps yourself, in order, before any agent scaffolds the app. They create a new Firebase project and put credentials on disk. They do not install app code.

Use a new project. The old one is `carbonvault-c2f6a`, and its web config is hard-coded in `legacy/*/src/firebase.js`. Leave that project alone, and lock it down or delete it when the move is finished.

Development will use the Firebase Emulator Suite. Creating the cloud project now does not mean the app should talk to production. Production-mode Firestore rules deny all client access until a later phase writes rules, and that is the setting you want.

`services/verifier/secrets/` is gitignored. Create it when a step below says so.

When a step says "paste", the file is the only place the value goes. Do not paste secrets into chat, into `docs/`, or into a commit.

## 1. Create a new Firebase project

1. Open [https://console.firebase.google.com/](https://console.firebase.google.com/) and sign in with the Google account that should own the project.
2. Click **Add project**.
3. Project name: `Sundarban`. The Project ID on the next line must not be `carbonvault-c2f6a`. If the suggested id is taken, accept a suffix. Write the id down.
4. Turn **Google Analytics** off. Continue.
5. Click **Create project**. Wait until the page says the project is ready, then click **Continue**.
6. Click the gear, **Project settings**, **General**. Copy **Project ID**.

Paste:

| Value | File | Variable |
|---|---|---|
| Project ID | `services/verifier/.env` | `FIREBASE_PROJECT_ID` |
| Same id | `services/verifier/secrets/firebase-web.env` | `VITE_FIREBASE_PROJECT_ID` |

Create both files. They do not exist yet. The second file holds the web config until `apps/admin-web` and the Expo app exist. Phase 1 copies those names into the app env files. Do not set `VITE_FIREBASE_DATABASE_URL`. Realtime Database is not used.

Check: the console header shows the new project name, and **Project settings → General** shows the id you pasted. `git status` does not list either file.

## 2. Enable Google sign-in

1. In the same project, open **Build → Authentication**.
2. Click **Get started**.
3. Open the **Sign-in method** tab.
4. Click **Google**, turn **Enable** on, pick your account as the support email, and click **Save**.
5. Open **Settings → Authorized domains**. `localhost` is already there. Add nothing else.

The standard Google provider does not give you a client secret to paste. Firebase creates the OAuth client.

The web app config is still required later so the client can call Auth. Register it now so the values have a home:

1. Gear → **Project settings** → **General**.
2. Under **Your apps**, click the web icon (`</>`).
3. App nickname: `admin-web`. Leave Firebase Hosting unchecked. Click **Register app**.
4. Copy the `firebaseConfig` fields into `services/verifier/secrets/firebase-web.env`. You can close the snippet. Skip the npm install the wizard offers.

Paste into `services/verifier/secrets/firebase-web.env`:

| Config field | Variable |
|---|---|
| `apiKey` | `VITE_FIREBASE_API_KEY` |
| `authDomain` | `VITE_FIREBASE_AUTH_DOMAIN` |
| `projectId` | `VITE_FIREBASE_PROJECT_ID` |
| `storageBucket` | `VITE_FIREBASE_STORAGE_BUCKET` |
| `messagingSenderId` | `VITE_FIREBASE_MESSAGING_SENDER_ID` |
| `appId` | `VITE_FIREBASE_APP_ID` |

Leave `measurementId` unset. Analytics is off. Leave `databaseURL` unset.

Check: **Authentication → Sign-in method** shows Google as **Enabled**. The web app is listed under **Project settings → General → Your apps**.

## 3. Create Firestore in production mode

1. Open **Build → Firestore Database**.
2. Click **Create database**.
3. Edition: **Standard**. The data model in the plan is standard documents.
4. Location: choose once. It cannot be changed.
   - `us-central1` if you want the Storage bucket to be eligible for the Always Free tier in step 4.
   - `asia-south1` (Mumbai) if you would rather have lower latency from India and pay Cloud Storage rates.
5. Rules: **Production mode**. The default rules deny all reads and writes.
6. Click **Create**.

Nothing from this step is a secret. Write the location you chose in a note for the next session. It belongs in `docs/PROJECT_STATE.md` as a name, which the next agent can record.

Check: the Firestore page shows an empty database. The **Rules** tab contains `allow read, write: if false`.

## 4. Cloud Storage and the paid plan

A new Firebase project needs the **Blaze** (pay as you go) plan to create or use a Cloud Storage bucket. That requirement has been in force since 3 February 2026. On the Spark plan the console will not open the bucket, and Storage API calls fail with 402 or 403.

Source: [Firebase Storage billing FAQ](https://firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024), checked 2026-10-20.

Blaze still includes no-cost usage. A new default bucket is named `PROJECT_ID.firebasestorage.app` and follows Cloud Storage pricing. For buckets in `us-west1`, `us-central1`, or `us-east1`, the Always Free limits are aggregated across those three regions ([Cloud Storage pricing](https://cloud.google.com/storage/pricing), checked 2026-10-20):

| Resource | Monthly Always Free limit |
|---|---|
| Standard storage | 5 GB-months |
| Class A operations | 5,000 |
| Class B operations | 50,000 |
| Data transfer | 100 GB from North America to each eligible destination (Australia and China excluded) |

Always Free does not apply to the Rapid storage class, and it does not apply to `asia-south1`. A brand-new Google Cloud billing account may also be offered a trial credit. The console is the place that says whether your account is eligible. Do not count on it.

### Options

1. **Blaze, bucket in `us-central1`, budget alert.** This is the option that can stay inside Always Free for Storage. Use it if a zero Storage bill matters more than round-trip time from India. You still link a card.
2. **Blaze, bucket in `asia-south1`, budget alert.** Same plan, closer region, Storage is billed at normal Cloud Storage rates. A student prototype is a small bill if the alert is set, and it is not free.
3. **Stay on Spark and use only the emulator.** The emulator does not need Blaze and does not store real photos. Local development is supposed to use the emulator anyway. A phone upload or a demo against a live bucket still needs option 1 or 2 before that path can run.

The old bucket on `carbonvault-c2f6a` is not one of the options.

### If you choose Blaze

1. Gear → **Usage and billing** → **Details and settings** → **Modify plan** → **Blaze**.
2. Link a Cloud Billing account. The account needs the **Owner** role on the project.
3. Accept the budget alert the wizard offers. Pick a low monthly amount you are willing to notice.
4. Open **Build → Storage** → **Get started**.
5. Start in **production mode** (deny rules).
6. If it asks for a location, use the region you chose in step 3. The console often ties the first bucket to the project's default location.
7. Copy the bucket name.

Paste the bucket name into `services/verifier/secrets/firebase-web.env` as `VITE_FIREBASE_STORAGE_BUCKET` if it differs from what the web-app wizard wrote.

Check: the Storage page shows a bucket ending in `.firebasestorage.app`. On Spark, that page sends you to the upgrade screen instead, which is the signal to use option 3 until you upgrade.

## 5. Generate a service account key

1. Gear → **Project settings** → **Service accounts**.
2. Leave **Firebase Admin SDK** selected.
3. Click **Generate new private key**, then **Generate key**. The browser downloads a JSON file.
4. Create the folder `services/verifier/secrets/` if it is not there.
5. Move the download to `services/verifier/secrets/firebase-admin.json`.
6. Delete the copy in `~/Downloads`.

Paste into `services/verifier/.env`:

```
GOOGLE_APPLICATION_CREDENTIALS=services/verifier/secrets/firebase-admin.json
FIREBASE_PROJECT_ID=<the id from step 1>
```

The JSON is the credential. Do not copy `private_key` into a second variable.

Check, from the repo root:

```
python3 -c "import json; p=json.load(open('services/verifier/secrets/firebase-admin.json')); print(p['project_id'])"
```

The printed id is the new project id. Then run `git status`. The JSON path and both env files are absent from the listing.

If that JSON is ever committed, open **Service accounts**, delete the key, generate a new one, and replace the file.

## 6. Install the Firebase CLI and log in

1. Install Node.js if `node -v` fails.
2. Run `npm install -g firebase-tools`.
3. Run `firebase login`. A browser opens. Choose the same Google account that owns the new project.
4. Run `firebase projects:list`.

Check: the command exits 0 and the new project id is in the list. `firebase login:list` shows that account.

The CLI stores its login under your home directory (`~/.config/configstore/firebase-tools.json` on macOS). That file stays there. Do not copy it into this repo, and do not put a `firebase login --token` value in any file in the repo.

## What must never be committed

| Item | Why |
|---|---|
| `services/verifier/secrets/firebase-admin.json` | Private key for the admin service account. |
| `services/verifier/.env` | Points at that key and names the project. |
| `services/verifier/secrets/firebase-web.env` | Web API key, sender id, and app id. |
| Any future `apps/*/.env` or Expo env file | Same web config, once Phase 1 creates the apps. |
| `~/.config/configstore/firebase-tools.json` | Your CLI login. |
| `legacy/**/firebase.js` and anything copied from it | Hard-coded fallback for the old project. |
| A downloaded key left in `~/Downloads` | Same private key as the secrets file. Delete it after the move. |

Commit `.env.example` files only, and only with empty values. The repo gitignore already ignores `.env` files and `services/verifier/secrets/`.

## You are done when

- A new project exists and its id is not `carbonvault-c2f6a`.
- Google is Enabled under Authentication.
- Firestore is in production mode and you know the region.
- You have either a Blaze bucket plus a budget alert, or a written choice to stay on the emulator until a demo needs a real bucket.
- `services/verifier/secrets/firebase-admin.json` exists, `git status` is clean of it, and the Python check prints the new project id.
- `firebase projects:list` shows the project.

Tell the next session the project id, the Firestore region, and whether the project is on Blaze. Do not paste the JSON or the API key.
