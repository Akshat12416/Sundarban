# Before Phase 4

Do these checks before any verifier experiment. Phase 4 will call Gemini. The model id has to stay fixed, and a full run has to be priced before it starts.

Do not paste the API key into chat or into a commit.

The model id in both env files on this machine is `gemini-3.8-flash`. Confirm that id in AI Studio. If the list has replaced it, pick the new lower-cost Flash id, write that same id in both files, and tell the next session. After that, leave it unchanged.

## 1. Confirm the model and freeze it

1. Open [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing).
2. Find the row for the id in `GEMINI_MODEL`. It should be a Flash-class model, and its standard input and output price should be the lower one on that page (on 2026-10-20, `gemini-3.8-flash` standard input and output were free of charge).
3. Open [AI Studio](https://aistudio.google.com/) and the model list. Confirm the same id is still offered for this API key.
4. Open `services/verifier/.env` and `bench/.env`. `GEMINI_MODEL` must be that exact id in both files. Do not use a Pro model here.
5. Leave the id in place for the rest of the project. The analysis cache key includes the model id. Changing it splits the cache and changes the system the paper measures.

Check, from the repository root. This prints the model id and whether the name contains `flash`. It does not print the API key.

```
python3 - << 'PY'
from pathlib import Path
ids = {}
for name in ("services/verifier/.env", "bench/.env"):
    for line in Path(name).read_text().splitlines():
        if line.startswith("GEMINI_MODEL="):
            ids[name] = line.split("=", 1)[1].strip()
values = list(ids.values())
print("models", ids)
print("same_id", len(values) == 2 and values[0] == values[1] and bool(values[0]))
print("flash_class", bool(values) and all("flash" in item.lower() for item in values))
PY
```

You want `same_id True` and `flash_class True`.

## 2. Run the cost estimator before any full run

Phase 4 adds the estimator as `python -m bench.estimate_cost`. It is not in the tree yet. Do not start a full experiment until that command exists.

When it is there, run it from the repository root before every full run:

```
python -m bench.estimate_cost
```

It reads `GEMINI_MODEL` and `GEMINI_RUN_COST_CAP_USD` from `bench/.env`. It counts the calls the chosen configurations would make, prices them from the AI Studio price of the frozen model id, and prints a USD estimate. Exit 0 means the estimate is within the cap. Exit 2 means it is over the cap. Do not start the runner after exit 2. Shrink the run or raise the cap on purpose, then run the estimator again.

Check: the process exits 0, and the printed estimate is less than or equal to the cap. If Python says the module does not exist, Phase 4 has not added it. That is expected today. A full run still waits.

## 3. Set a per-run cost cap

1. Open `bench/.env`.
2. Add a line you choose, for example `GEMINI_RUN_COST_CAP_USD=5`. Use the most you are willing to spend on one run.
3. Save. The file stays gitignored.

This line does not by itself stop a request. Google will not read it. Phase 4's estimator and runner must stop when a run would pass it. Until that code exists, the billing alert below is the limit that actually fires.

Check:

```
python3 - << 'PY'
from pathlib import Path
cap = None
for line in Path("bench/.env").read_text().splitlines():
    if line.startswith("GEMINI_RUN_COST_CAP_USD="):
        cap = line.split("=", 1)[1].strip()
print("cap_set", bool(cap))
try:
    amount = float(cap or "")
except ValueError:
    amount = -1
print("cap_positive", amount > 0)
PY
```

You want `cap_set True` and `cap_positive True`. The script does not need to print the amount.

## 4. Set a billing alert

Do this if a card is linked to the Gemini project. Skip it if you are still on the free tier and no card is attached. Auth and Firestore on `sundarban-a64ea` can stay on Spark.

1. Open [Cloud Billing](https://console.cloud.google.com/billing).
2. Open the billing account linked to the Gemini project from the Phase 2 guide. That is not `sundarban-a64ea` unless you chose to bill Firebase too.
3. Go to **Budgets & alerts**.
4. Click **Create budget**.
5. Scope the budget to the Gemini project.
6. Set a monthly amount you want to notice. A small amount is enough.
7. Turn on email alerts at 50% and 90%.
8. Save.

The budget is monthly. The cap in section 3 is per run. Keep both.

Check: the budget is listed on **Budgets & alerts**. Send the test email if the page offers it. `sundarban-a64ea` still shows no Blaze plan if you left Firebase on Spark.

## You are done when

- The model check printed `same_id True` and `flash_class True`, and you have confirmed that id on the AI Studio list.
- `GEMINI_RUN_COST_CAP_USD` is a positive number in `bench/.env`.
- A billing alert exists on the Gemini project, or no card is linked and you are staying on the free tier.
- You have not started a full Gemini run. The estimator command is the gate for that, and it arrives in Phase 4.

Tell the next session the frozen model id, the cap, and whether the billing alert exists. Do not paste the API key.
