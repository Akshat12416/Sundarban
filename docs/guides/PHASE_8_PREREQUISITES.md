# Before Phase 8

Phase 8 is the measured experiment. Do these steps yourself, in order. Do not start a paper run until each check passes. Do not pass `--split test` while you are still collecting A13 and A14.

The dev demo files under `bench/results/demo/` are not paper results. Leave them there.

## 1. Capture the A13 screen-recapture photos

A13 is a photograph of a benchmark after-image shown on another screen. The phone takes it through the app camera, not the image picker.

1. Put the benchmark after-images on a laptop or a second monitor. Use the files the generator already wrote for the dev split. Do not download a new photo and call it a benchmark item.
2. On the phone, install the development build. Expo Go cannot sign the capture. From `apps/mobile`, after `eas login`: `npx eas-cli@latest build --profile development --platform android`. Install the APK. Then `npx expo start --dev-client`.
3. Sign in with a contributor account pointed at the emulator (`EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST` and `EXPO_PUBLIC_FIRESTORE_EMULATOR_HOST` are the computer's LAN address).
4. Create a project, or open one that is allowed to capture. Stand so the second screen fills the camera preview. Dim the room enough that the screen is the subject, and turn off flash if it washes the picture out.
5. Capture 10 to 15 items. For each one, write a row before you take the next photo.

Create `bench/data/attack_raw/a13/sources.csv` with a header and one row per capture:

```csv
capture_file,source_item
a13-0001.jpg,legit-single-0006
```

`source_item` is the benchmark id whose after-image was on the screen. `capture_file` is the file you keep. Copy the captured JPEG off the phone into `bench/data/attack_raw/a13/` using that name.

Check: the CSV has 10 to 15 data rows, every `source_item` exists in `bench/data/manifest.jsonl`, and every `capture_file` is a JPEG in that folder. No row is blank. The capture was taken inside the app. A picture of the screen taken with the phone's normal camera app does not count.

## 2. Capture the A14 mock-location photos

A14 is a real capture whose GPS was supplied by a mock-location app. The parcel check should still see coordinates inside the parcel. The mock flag is recorded. It is not, by itself, a reason to reject.

1. On the Android phone, open Settings, About phone, and tap Build number seven times until Developer options turns on.
2. Open Settings, System, Developer options. Turn on the mock-location setting if the phone still has one. On current Android the switch is gone and the next step is enough.
3. Install a mock-location app from the Play Store, such as one that sets a single point. In Developer options, open "Select mock location app" and choose that app. If the list is empty, the app did not request the mock permission. Install a different one.
4. In the mock app, set latitude and longitude inside the parcel you will declare in Sundarban. Use the same six-decimal form the app stores. Stay inside the radius you set on the parcel step.
5. Open Sundarban, set the parcel centre to that same point, and capture 10 to 15 photos through the in-app camera. The phone can be anywhere. The GPS the app reads should be the mocked point.
6. Write `bench/data/attack_raw/a14/sources.csv`:

```csv
capture_file,parcel_latitude,parcel_longitude,mocked
a14-0001.jpg,22.000001,88.000001,yes
```

Copy the JPEGs into `bench/data/attack_raw/a14/`.

Check: Developer options shows the mock app selected. A capture's metadata `latitude` and `longitude` match the CSV, and they sit inside that parcel's radius. `mockLocation` on the metadata is true. You have 10 to 15 rows, and each file opens as a JPEG. Turn the mock app off when you are finished so later legitimate captures are not poisoned.

## 3. Keep an experiment log

Create `bench/EXPERIMENT_LOG.md`. Add a row when you start a run, when it stops, and when you change a frozen setting. One row is enough for each event. Include the date, the config (`C0`, `C1`, `C3`, `C4`, or `+A`), the split, the command, the result file path, and whether the run finished, failed, or was stopped.

Do not write a paper number in the log until `bench/metrics.py` has printed it from a result file.

Check: the log has a row for every file you intend to cite, and the path in the row is the file that is actually on disk.

## 4. Freeze the model, the prompts, and the thresholds

1. In `bench/.env` and `services/verifier/.env`, set `LLM_PROVIDER=gemini` and set `GEMINI_MODEL` to the exact id you will report. The demo id `ollama/qwen2.5vl:3b` is not that id.
2. Do not edit files in `services/verifier/prompts/` after this point. The version string is in the cache key. A prompt change needs a new version suffix, and then the old cache entries must not be reused for the paper.
3. Leave `services/verifier/app/rules_config.py` and `services/verifier/credits.json` as they are unless you write the change in `docs/decisions.md` and `docs/CHANGELOG-PAPER.md` first. The phash threshold, GPS radius, and credit factors are part of the method.
4. Record the frozen values in the experiment log: model id, prompt version names, phash threshold, GPS radius.

Check: `git status` shows no change under `services/verifier/prompts/`. Both env files name the same `GEMINI_MODEL`. A one-line note in the experiment log lists that id and the prompt versions.

## 5. Approve a cost budget

The runner refuses a Gemini run when the estimate is above `GEMINI_RUN_COST_CAP_USD` (or `MAX_RUN_COST` if that is set). The price table is `bench/prices.json`. The default tier is the paid standard rate.

1. Dry-run the configs you will actually cite. This counts tokens and does not call `generateContent`:

```bash
services/verifier/.venv/bin/python -m bench.run --config C1 --split dev --runs 1 --dry-run
```

Repeat for `C2`, `C3`, and `C4`, and for `--attest` if you will cite `+A`. Do not add `--force`.

2. Add the estimates. That sum is the budget. Set `GEMINI_RUN_COST_CAP_USD` in both env files to a number you accept for the whole set of final runs, not for a single call.
3. Confirm the key is billed. A key that still returns `generate_content_free_tier_requests` will stop the run at the free daily quota. A billed key is required before the final runs.
4. Write the budget and the dry-run totals in the experiment log.

Check: each dry-run exits 0 and prints an estimate. The cap is greater than or equal to the sum of the runs you will start. You have not passed `--split test`.

## When you are done

Phase 8 can start when A13 and A14 each have 10 to 15 rows, the experiment log exists, the model and prompts are unchanged, and the cost cap covers the dry-run sum. The first command is a dev-split dry-run, not a test-split run.
