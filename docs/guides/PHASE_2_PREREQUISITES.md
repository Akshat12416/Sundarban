# Before Phase 2

Do this before the benchmark pilot. It creates a Gemini key and a folder of openly licensed plantation photos. It does not run the benchmark.

The key goes only in gitignored env files. Do not paste it into chat, docs, or a commit.

## 1. Create a Gemini API key

1. Open [Google AI Studio API keys](https://aistudio.google.com/apikey) and sign in with the Google account you want on the bill if you later enable billing.
2. Click **Create API key**.
3. When it asks for a project, create a new one for Gemini. Leave the Firebase project `sundarban-a64ea` on the Spark plan. Attaching billing to that project is a separate choice and is not required for Auth or Firestore.
4. Copy the key once. The page will not show it again in full.

Paste the same key into both files:

| File | Variable |
|---|---|
| `services/verifier/.env` | `GEMINI_API_KEY` |
| `bench/.env` | `GEMINI_API_KEY` |

Also set `GEMINI_MODEL` in both files. On 2026-10-20 the pricing page listed `gemini-3.8-flash` with standard input and output **Free of charge** on the free tier ([Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing)). Before you rely on that, open the model in AI Studio and confirm the price column still says free. If the id has changed, use the Flash model that still says free, and write that id in `GEMINI_MODEL`.

Check, from the repo root. This prints HTTP status and a model count. It does not print the key.

```
python3 - << 'PY'
import json, urllib.request
from pathlib import Path
env = {}
for line in Path("bench/.env").read_text().splitlines():
    line = line.strip()
    if not line or line.startswith("#") or "=" not in line:
        continue
    k, v = line.split("=", 1)
    env[k] = v.strip().strip('"').strip("'")
url = "https://generativelanguage.googleapis.com/v1beta/models?key=" + env["GEMINI_API_KEY"]
with urllib.request.urlopen(url, timeout=30) as res:
    data = json.load(res)
names = [m.get("name", "") for m in data.get("models", [])]
print("status", res.status)
print("models", len(names))
print("chosen_model_listed", any(env.get("GEMINI_MODEL", "") in n for n in names))
PY
```

You want status 200, a model count above zero, and `chosen_model_listed True`. `git status` must not list `bench/.env` or `services/verifier/.env`.

## 2. Free tier, call volume, and image generation

Checked on 2026-10-20.

Text and image **input** on a free Flash model is the path for reading evidence photos. The pricing page shows `gemini-3.8-flash` standard input and output as free of charge. Free-tier prompts can be used to improve Google's products. Paid tier turns that off.

Rate limits are not one number for every account. They are requests per minute, tokens per minute, and requests per day, per project, and they depend on the model. The pricing page does not publish a single RPM figure. Open [rate limits](https://ai.google.dev/gemini-api/docs/rate-limits) and the rate-limit view in AI Studio, and write down the RPM, TPM, and RPD for `GEMINI_MODEL`. Compare that RPD with the number of calls the pilot will make. A short pilot of evidence photos fits a free Flash quota when the dashboard still shows remaining requests. A `429` response means you hit the quota. Stop there. Do not invent a higher limit.

Image **generation** is different. On the same pricing page, image-output models (the Gemini image models, including the ones branded Nano Banana) show **Not available** on the free tier. The AI Studio page can show a daily image quota that still rejects calls until a billing account is linked. Generating the attack photos for class A4 needs that paid tier. Reviewing a real photograph with a Flash model does not.

Stay on the free tier for the verifier pilot. Link a billing account only when you are ready to generate images, and only on the Gemini project from step 1.

## 3. Set a budget alert before you generate images

Skip this step if you are not linking a card yet.

1. Open [Cloud Billing](https://console.cloud.google.com/billing).
2. Open the billing account you will link to the Gemini project.
3. Go to **Budgets & alerts**.
4. Click **Create budget**.
5. Scope it to the Gemini project, not `sundarban-a64ea`, unless you have decided that Firebase project should be billed too.
6. Set a monthly amount you are willing to notice. A small amount is enough for a first image-generation trial.
7. Turn on email alerts at 50% and 90%.
8. Save.

Check: the budget is listed on **Budgets & alerts**, and a test alert email is offered if the page shows **Send test email** or you receive the confirmation. The Firebase project stays on Spark.

## 4. Collect 40 to 60 openly licensed plantation photos

Save the files in `bench/data/raw/`. That folder is gitignored except `sources.csv`. Commit the catalogue. Do not commit the images.

Use only these licences: CC0, CC BY, CC BY-SA, or public domain. A photo that is merely free to view, or under the Unsplash licence, does not count.

1. Open [Wikimedia Commons](https://commons.wikimedia.org/).
2. Search for terms such as `mangrove plantation`, `tree planting sapling`, `afforestation`, and `mangrove nursery`.
3. Open a file page. Read the licence line. Keep the file only when it is CC0, CC BY, CC BY-SA, or public domain.
4. Download the original file. Name it with letters, numbers, and hyphens, for example `mangrove-saplings-01.jpg`.
5. Put it in `bench/data/raw/`.
6. Add one row to `bench/data/raw/sources.csv`. The header is already there:

```
filename,source_url,author,licence,accessed_on,notes
```

`source_url` is the Commons file page. `author` is the name on that page. `licence` is the short name, such as `CC BY-SA 4.0` or `CC0`. `accessed_on` is `YYYY-MM-DD`. `notes` can say what the photo shows, such as saplings in mud.

Repeat until you have 40 to 60 rows. iNaturalist and Flickr are acceptable only when the file page shows one of the licences above.

Check, from the repo root:

```
python3 - << 'PY'
import csv
from pathlib import Path
root = Path("bench/data/raw")
rows = list(csv.DictReader(root.joinpath("sources.csv").open()))
allowed = ("cc0", "cc by", "cc-by", "public domain")
missing = []
bad = []
for row in rows:
    path = root / row["filename"]
    if not path.is_file():
        missing.append(row["filename"])
    licence = row["licence"].strip().lower()
    if not any(licence.startswith(item) or item in licence for item in allowed):
        bad.append(row["filename"])
    if not row["source_url"].startswith("http") or not row["author"].strip():
        bad.append(row["filename"])
print("rows", len(rows))
print("missing_files", missing)
print("bad_rows", bad)
PY
```

You want `rows` between 40 and 60, `missing_files` empty, and `bad_rows` empty. `git status` shows `sources.csv` if you changed it, and does not show the photographs.

## You are done when

- Both env files contain `GEMINI_API_KEY` and `GEMINI_MODEL`, and the model check printed status 200.
- You have written down the RPM, TPM, and RPD from AI Studio for that model.
- Image generation is still unpaid, or a budget alert exists on the Gemini project before the first generated image.
- `sources.csv` has 40 to 60 complete rows and every filename is a real file in `bench/data/raw/`.

Tell the next session the model id and whether billing is linked. Do not paste the API key.
