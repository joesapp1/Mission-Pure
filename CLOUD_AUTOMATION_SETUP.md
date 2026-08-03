# Cloud Ingestion & Workspace Automation Setup

Use this doc to deploy the Google Cloud + Workspace probes that keep Water Watch, GBP, and inbound ops on autopilot.

---
## 1. Water Watch Ingestion Cloud Function
**Code:** `cloud/waterwatch-ingest`

### Deploy
```bash
cd cloud/waterwatch-ingest
npm install
# Replace REGION with e.g. us-central1
# WATERWATCH_SOURCES is the JSON from data/water-watch-sources.json
 gcloud functions deploy waterwatchIngest \
  --gen2 \
  --runtime=nodejs20 \
  --region=us-central1 \
  --entry-point=ingestFeeds \
  --source=. \
  --trigger-http \
  --allow-unauthenticated \
  --set-env-vars="WATERWATCH_SOURCES=$(cat ../../data/water-watch-sources.json)"
```
> Gen2 Functions require an Artifact Registry repo; if prompted, run `gcloud artifacts repositories create cloud-run-source-deployments --repository-format=DOCKER --location=us-central1` once.

### Firestore & Pub/Sub
1. Enable Firestore in **Native mode**.
2. Create collection `waterWatchEntries` (documents will use deterministic IDs).
3. Create Pub/Sub topic `waterwatch.alerts` (push subscription optional for email bot).

### Scheduler
Run hourly to keep feeds fresh:
```bash
gcloud scheduler jobs create http waterwatch-hourly \
  --schedule="0 * * * *" \
  --uri="https://REGION-PROJECT.cloudfunctions.net/waterwatchIngest" \
  --http-method=GET
```
Add OIDC auth if you disabled `--allow-unauthenticated`.

---
## 2. GBP Autoposter Prep (Workspace/GCP)
1. Copy `config/gbp.config.example.json` → `config/gbp.config.json` and fill in:
   - `locationId`: from GBP API explorer once access granted.
   - `clientId`/`clientSecret`: OAuth desktop creds.
   - `refreshToken`: generated via OAuth consent + offline access.
2. Until approval: `npm run gbp:post` generates `tmp/gbp-preview.json` for review.
3. After approval: run `npm run gbp:post -- --live` locally or wrap in Cloud Run job with Secret Manager vars.

---
## 3. Google Alerts → Firestore Probe
1. Create Google Alerts for keywords ("Plano boil notice", "PFAS Dallas", etc.) targeting joe@mission-pure.com.
2. In Gmail, create label `WaterWatch/Alerts` and filter the alert emails into it.
3. Open [script.google.com](https://script.google.com) as joe@:
```js
function harvestAlerts() {
  const label = GmailApp.getUserLabelByName('WaterWatch/Alerts');
  if (!label) return;
  const threads = label.getThreads(0, 20);
  const firestore = FirestoreApp.getFirestore('', '', 'mission-pure-gbp');
  threads.forEach((thread) => {
    const msg = thread.getMessages().pop();
    firestore.updateDocument(`waterWatchEntries/alert-${msg.getId()}`, {
      sourceId: 'google-alert',
      sourceLabel: 'Google Alert',
      city: 'DFW',
      title: msg.getSubject(),
      summary: msg.getPlainBody().slice(0, 400),
      url: msg.getPlainBody().match(/https?:\/\/\S+/)?.[0] || '',
      publishedAt: msg.getDate().toISOString(),
      tags: ['alert'],
    });
    thread.removeLabel(label);
  });
}
```
4. Add the **Clock** trigger to run every 15 minutes. (Install [FirestoreApp library](https://github.com/grahamearley/FirestoreGoogleAppsScript) first.)

---
## 4. Search Console Submission Script
- Enable Search Console API.
- Apps Script (or Cloud Run) flow:
  1. Watch `/incident-pages` folder in repo; when new HTML pushes, append URL to Google Sheet or Firestore `incidentQueue` collection.
  2. Script iterates queue nightly, calling `UrlInspection.index.inspect` for each.
  3. Email summary of results to joe@ + log in BigQuery.
- Benefits: instant indexing, visibility into coverage errors before they affect GBP/local rankings.

---
## 5. Workspace Contact Web App (Formspree replacement)
1. Apps Script Web App receives POST from `contact.html` (update `app.js` endpoint once deployed).
2. Script stores submissions in Sheets + sends Gmail draft using Nova-style summary (already generated client-side).
3. Optional: send Google Chat webhook ping or SMS (via Twilio) for hot leads.

---
## 6. Media Automation (Vertex AI)
1. Enable Vertex AI + Cloud Storage.
2. Apps Script monitors Drive folder `Water Watch Prompts` for new Docs.
3. Script invokes Vertex Imagen API, saves output to `gs://mission-pure-gbp-media`, and writes the public URL into Firestore entry.
4. GBP autoposter picks up the image when posting (config `media.sourceUrl`).

Following these steps gives us end-to-end ingestion, review, and publishing workflows built on Google-native tools. Once Business Profile API access lands, flip the autoposter to live mode and the rest of the system is already feeding it quality content.

---

## 7. Search Console Trend Harvester (Hot Searches)
**Code:** `scripts/trend-harvest.js` + `data/trend-topics.json`

This mirrors the working Pinnacle Web automation but targets Mission Pure keywords (odor, PFAS, boil notices, hardness, etc.). It turns live Search Console queries into the `hot-searches.html` landing page + `data/trend-feed.json` so we always have fresh SEO content tied to ZIP lookups.

### Local run (fallback mode)
```bash
# Uses data/trend-topics.json and fake queries if Search Console isn't reachable.
TREND_USE_FALLBACK=1 npm run trends:harvest
```

### Production env vars
Store these in Secret Manager or a `.env` the Cloud Build trigger can source:

| Variable | Purpose |
| --- | --- |
| `GSC_SITE_URL` | Search Console property to query, e.g. `https://mission-pure.com` or `sc-domain:mission-pure.com`. |
| `GOOGLE_APPLICATION_CREDENTIALS_JSON` | Service-account JSON for `serviceaccount1@mission-pure-gbp.iam.gserviceaccount.com`. Base64‑encode before inserting into Secret Manager. |
| `TREND_OUTPUT_HTML` | Optional. Path Cloud Build should write the rendered page to (defaults to `${REPO_DIR}/hot-searches.html`). |
| `TREND_FEED_PATH` | Optional. Defaults to `${REPO_DIR}/data/trend-feed.json`. |
| `TREND_POST_LIMIT` | Optional. Defaults to 5. |
| `TREND_LOOKBACK_DAYS` | Optional. Defaults to 1 (24h window). |

### Cloud Build trigger (runs in existing `mission-pure-gbp` project)
1. Create Secret Manager entry `missionpure-gsc-key` with the JSON from the screenshot above (key ID `8ff14bc...` or `24e7af3...`).
2. Grant `serviceAccount:serviceaccount1@mission-pure-gbp.iam.gserviceaccount.com` the roles:
   - `roles/searchconsole.viewer`
   - `roles/secretmanager.secretAccessor` (for the secret above)
   - `roles/storage.admin` (if build pushes to `gs://mission-pure-static`)
3. Cloud Build trigger `missionpure-hotsearches` pointing at this repo/branch:
   ```yaml
   steps:
     - name: "gcr.io/cloud-builders/npm"
       args: ["install"]
     - name: "gcr.io/cloud-builders/npm"
       entrypoint: bash
       args:
         - -c
         - |
           echo "$MISSIONPURE_GSC_KEY" > key.json
           export GOOGLE_APPLICATION_CREDENTIALS_JSON=$(cat key.json)
           npm run trends:harvest
     - name: "gcr.io/cloud-builders/gsutil"
       args:
         - rsync
         - -r
         - .
         - gs://mission-pure-static
   substitutions:
     _GSC_SITE_URL: "https://mission-pure.com"
   secretEnv:
     - MISSIONPURE_GSC_KEY
   ```
   Adjust the `gsutil rsync` target to match your hosting bucket/prefix (e.g. `gs://mission-pure-static/site`).

### Scheduler (twice daily, Central Time)
Use the existing Cloud Scheduler service account or create one dedicated to automation. Two jobs keep parity with Pinnacle Web:
```bash
gcloud scheduler jobs create http missionpure-trends-3pm \
  --schedule="0 15 * * *" \
  --time-zone="America/Chicago" \
  --uri="https://cloudbuild.googleapis.com/v1/projects/mission-pure-gbp/locations/us-central1/triggers/TRIGGER_ID:run" \
  --oauth-service-account-email=serviceaccount1@mission-pure-gbp.iam.gserviceaccount.com \
  --message-body='{"branchName":"main", "substitutions": {"_GSC_SITE_URL": "https://mission-pure.com"}}'

gcloud scheduler jobs create http missionpure-trends-9pm \
  --schedule="0 21 * * *" \
  --time-zone="America/Chicago" \
  --uri="https://cloudbuild.googleapis.com/v1/projects/mission-pure-gbp/locations/us-central1/triggers/TRIGGER_ID:run" \
  --oauth-service-account-email=serviceaccount1@mission-pure-gbp.iam.gserviceaccount.com \
  --message-body='{"branchName":"main", "substitutions": {"_GSC_SITE_URL": "https://mission-pure.com"}}'
```
Replace `TRIGGER_ID` with the ID from the Cloud Build trigger created above. Jobs hit the trigger at 3 pm and 9 pm Central forever, just like the Pinnacle Web setup.

### Output artifacts
- `hot-searches.html`: publish alongside the rest of the static site (sitemap already refreshed).
- `data/trend-feed.json`: optional ingestion for other scripts (Nova, GBP autoposter, etc.).
- `sitemap.xml`: re-run `npm run sitemap` post-build or include it as an extra Cloud Build step so the new page stays indexed.

With these steps the Mission Pure automation reuses the proven Pinnacle Web flow, but the probe now watches water-specific queries, routes visitors toward ZIP lookup + Water Watch, and keeps posting twice a day without babysitting.
