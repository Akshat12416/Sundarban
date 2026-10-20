# Before Phase 3

Do these checks yourself before the evidence service is built. They confirm the accounts and the local toolchain. They do not add routes.

Do not paste secrets into chat or into a commit.

## 1. Service account file

The verifier expects the Admin SDK JSON at `services/verifier/secrets/firebase-admin.json`. That path is gitignored. On this machine it is a link to the downloaded key in the same folder.

Check, from the repository root:

```
test -f services/verifier/secrets/firebase-admin.json && echo present
python3 -c "import json; print(json.load(open('services/verifier/secrets/firebase-admin.json'))['project_id'])"
```

You want `present` and `sundarban-a64ea`. `git status` must not list the JSON file.

## 2. Supabase

The bucket is the private bucket `evidence`. In `services/verifier/.env` set:

```
STORAGE_BACKEND=supabase
```

These three must already be non-empty. They stay server-side:

- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `SUPABASE_STORAGE_BUCKET`

Check. This prints yes/no and statuses. It does not print the secret or the URL.

```
python3 - << 'PY'
import json, urllib.request
from pathlib import Path
env = {}
for line in Path("services/verifier/.env").read_text().splitlines():
    s = line.strip()
    if not s or s.startswith("#") or "=" not in s:
        continue
    k, v = s.split("=", 1)
    env[k] = v.strip().strip('"').strip("'")
for name in ("SUPABASE_URL", "SUPABASE_SECRET_KEY", "SUPABASE_STORAGE_BUCKET"):
    print(name, "yes" if env.get(name) else "no")
print("STORAGE_BACKEND_supabase", env.get("STORAGE_BACKEND") == "supabase")
print("bucket_is_evidence", env.get("SUPABASE_STORAGE_BUCKET") == "evidence")
base = env["SUPABASE_URL"].rstrip("/")
key = env["SUPABASE_SECRET_KEY"]
bucket = env["SUPABASE_STORAGE_BUCKET"]
req = urllib.request.Request(
    base + "/storage/v1/bucket/" + bucket,
    headers={"Authorization": "Bearer " + key, "apikey": key},
)
with urllib.request.urlopen(req, timeout=30) as res:
    data = json.load(res)
print("bucket_http", res.status)
print("bucket_public", data.get("public"))
PY
```

You want every name `yes`, `STORAGE_BACKEND_supabase True`, `bucket_is_evidence True`, `bucket_http 200`, and `bucket_public False`.

## 3. Emulator ports

Auth uses 9099, Firestore uses 8080, and the emulator UI uses 4000. The hub also binds 4400.

Check they are free:

```
lsof -nP -iTCP:9099 -sTCP:LISTEN
lsof -nP -iTCP:8080 -sTCP:LISTEN
lsof -nP -iTCP:4000 -sTCP:LISTEN
lsof -nP -iTCP:4400 -sTCP:LISTEN
```

Each command should print nothing. If a row appears, stop that process before continuing.

Start the emulators once. Java 17 is not enough. JDK 21 is already installed and is not the default `java`.

```
JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home \
PATH="$JAVA_HOME/bin:$PATH" \
firebase emulators:start --only auth,firestore
```

You want the line `All emulators ready`. Then press Ctrl-C so the ports are free for the next session.

## 4. One Firebase project id line

`services/verifier/.env` currently sets `FIREBASE_PROJECT_ID` twice. Open the file and delete one of those two lines. Leave the other variables as they are.

Check:

```
python3 -c "print(sum(1 for line in open('services/verifier/.env') if line.startswith('FIREBASE_PROJECT_ID=')))"
```

You want `1`.

## 5. Python virtual environments

From the repository root, one environment per Python component:

```
cd services/verifier && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt && .venv/bin/pytest
cd ../..
cd contracts && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt && .venv/bin/pytest
cd ..
cd packages/test-vectors && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt && .venv/bin/pytest
```

The verifier check is the one Phase 3 needs. You want `1 passed` from `services/verifier`. The contract test needs a network call to Sepolia and should report `2 passed`. The vector tests should report `7 passed`.

`.venv` directories are gitignored.

## You are done when

- The service-account check prints `sundarban-a64ea`.
- The Supabase check prints `bucket_public False` and `STORAGE_BACKEND_supabase True`.
- The emulator ready line appeared, and the four port checks are empty again after you stop it.
- `FIREBASE_PROJECT_ID` occurs once in `services/verifier/.env`.
- `services/verifier/.venv/bin/pytest` passes.

Tell the next session that these checks passed. Do not paste the service account or the Supabase secret.
