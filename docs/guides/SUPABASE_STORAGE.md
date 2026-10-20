# Supabase for evidence files

Do this before Phase 1. Firebase stays the place for Google sign-in and Firestore, both of which work on the free Spark plan. Photographs and documents go to Supabase Storage.

The phone does not talk to Supabase. It still posts each image to the verifier. The verifier writes the file and stores the path and the SHA-256 in Firestore. That matches the upload step in `docs/PLAN-SPEC.md` section 5.1.

Checked against [Supabase pricing](https://supabase.com/pricing) on 2026-10-20. The free plan includes:

| Item | Free plan |
|---|---|
| File storage | 1 GB |
| Largest file | 50 MB |
| Egress | 5 GB |
| Cached egress | 5 GB |
| Card required | No |
| Inactivity | The project pauses after 1 week without use |
| How many projects | 2 active free projects |

1 GB is enough for the demo and a small set of real projects. Keep the benchmark images on disk. A paused project rejects uploads until you open it in the dashboard and it becomes healthy again.

## 1. Create the project

1. Open [https://supabase.com/dashboard](https://supabase.com/dashboard) and sign up or sign in. GitHub or email is enough. Do not add a payment method.
2. Click **New project**.
3. Organization: your personal org.
4. Project name: `sundarban`.
5. Database password: click generate, then save it in your password manager. Supabase asks for this even though the app will not use their Postgres database.
6. Region: **South Asia (Mumbai)** if it is in the list. The choice is permanent for this project.
7. Click **Create new project** and wait until the status is healthy. This often takes a minute or two.

Paste the database password into `services/verifier/.env`:

```
SUPABASE_DB_PASSWORD=<the generated password>
```

The app does not connect with this password. It is there so the password is not only in the dashboard.

Check: the project home page shows a green healthy state and a project URL ending in `.supabase.co`.

## 2. Create a private bucket

1. In the left sidebar open **Storage**.
2. Click **New bucket**.
3. Name: `evidence`.
4. Leave **Public bucket** off. The switch must stay private.
5. If the form has a file size limit, set it to `50` MB. That is the free-plan maximum.
6. If it has allowed MIME types, enter `image/jpeg`, `image/png`, and `application/pdf`.
7. Click **Save** or **Create**.

Do not add a policy that allows public read, and do not turn the bucket public afterwards. With no public policy, the publishable key cannot read or write objects. The verifier’s secret key is the only key that should.

Check: the bucket row says **evidence** and **Private**.

## 3. Copy the URL and the secret key

1. Open **Project Settings** (the gear) → **API Keys**.
2. If you see **Create new API keys**, click it. That adds a publishable key and a secret key. Your project can keep working with either key style.
3. Copy the **Project URL**. It looks like `https://abcdefghijklmnop.supabase.co`. It is also on **Settings → Data API**, and in the **Connect** dialog.
4. Copy the **secret** key. It starts with `sb_secret_`. Use the one named `default` if several are listed.

If the page has no secret key and only shows a legacy **service_role** key, copy that instead. It is a long value starting with `eyJ`. Prefer `sb_secret_` when both exist. Supabase is retiring the `eyJ` keys at the end of 2026.

Leave the publishable key (`sb_publishable_...`) and the legacy `anon` key where they are. Do not put either in the Expo app or the admin web.

Paste into `services/verifier/.env`, next to the Firebase variables already there:

```
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SECRET_KEY=<sb_secret_... or the service_role key>
SUPABASE_STORAGE_BUCKET=evidence
```

No quotes. No `const`. One variable per line.

Check, from the repo root. This prints the bucket name and whether it is public. It does not print the key.

```
python3 - << 'PY'
import json, urllib.request
from pathlib import Path
env = {}
for line in Path("services/verifier/.env").read_text().splitlines():
    line = line.strip()
    if not line or line.startswith("#") or "=" not in line:
        continue
    k, v = line.split("=", 1)
    env[k] = v.strip().strip('"').strip("'")
url = env["SUPABASE_URL"].rstrip("/") + "/storage/v1/bucket/" + env["SUPABASE_STORAGE_BUCKET"]
req = urllib.request.Request(url, headers={
    "Authorization": "Bearer " + env["SUPABASE_SECRET_KEY"],
    "apikey": env["SUPABASE_SECRET_KEY"],
})
with urllib.request.urlopen(req) as res:
    data = json.load(res)
print("name", data.get("name") or data.get("id"))
print("public", data.get("public"))
PY
```

You want `name evidence` and `public False`. `git status` must not list `services/verifier/.env`.

## 4. Prove a file can go up and come down

Still from the repo root:

```
python3 - << 'PY'
import urllib.request
from pathlib import Path
env = {}
for line in Path("services/verifier/.env").read_text().splitlines():
    line = line.strip()
    if not line or line.startswith("#") or "=" not in line:
        continue
    k, v = line.split("=", 1)
    env[k] = v.strip().strip('"').strip("'")
# 1x1 PNG
png = bytes.fromhex(
    "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4"
    "890000000a49444154789c63000100000500010d0a2db40000000049454e44ae426082"
)
base = env["SUPABASE_URL"].rstrip("/") + "/storage/v1/object/" + env["SUPABASE_STORAGE_BUCKET"] + "/healthcheck.png"
headers = {
    "Authorization": "Bearer " + env["SUPABASE_SECRET_KEY"],
    "apikey": env["SUPABASE_SECRET_KEY"],
    "Content-Type": "image/png",
}
req = urllib.request.Request(base, data=png, headers=headers, method="POST")
with urllib.request.urlopen(req) as res:
    print("upload", res.status)
req = urllib.request.Request(base, headers=headers, method="DELETE")
with urllib.request.urlopen(req) as res:
    print("delete", res.status)
PY
```

You want `upload 200` or `upload 201`, then `delete 200`. The Storage page should not keep a file named `healthcheck.png`.

If upload returns 400 and mentions the MIME type, add `image/png` to the bucket’s allowed types and run the check again. If the project was paused, open the dashboard, wait until it is healthy, and run it again.

## What must never be committed

| Item | Why |
|---|---|
| `SUPABASE_SECRET_KEY` in `services/verifier/.env` | Bypasses every storage rule. Full access to the project. |
| `SUPABASE_DB_PASSWORD` | Database owner password. |
| A publishable or anon key inside the Expo app or `apps/admin-web` | The clients never upload to Supabase. A key in the app is an extra secret to leak. |
| The benchmark image set, uploaded “to have it in the cloud” | The free bucket is 1 GB. |

`services/verifier/.env` is already gitignored. Commit only `.env.example` files, with the names above and empty values, when Phase 1 adds that example.

## You are done when

- The Supabase project is healthy and on the free plan.
- Bucket `evidence` is private.
- The Python check prints `public False`, then `upload 200` or `upload 201`, and `delete 200`.
- `git status` does not show `.env`.

Tell the next session that evidence storage is Supabase, the bucket name is `evidence`, and the region you picked. Do not paste the secret key or the database password.

Firebase setup that is still yours, from `docs/guides/PHASE_1_PREREQUISITES.md`: Google sign-in, Firestore in production mode, the service account JSON, and `firebase login`. Skip the Blaze / Cloud Storage step. That section now points here.
