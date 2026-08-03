# Google Workspace + Cloud Automation Blueprint

Mission Pure's automation stack is designed to keep Water Watch, GBP, and inbound responses fully synchronized without daily manual work. This document tracks what infrastructure exists now, what still needs OAuth/secret approval, and how each Google Workspace + Cloud component fits together.

## Goals
1. **Continuously ingest water intelligence** (RSS, alerts, sensors) and prime Water Watch + GBP copy.
2. **Auto-publish to Google Business Profile** 2–3 times/day the moment API access is granted.
3. **Answer inbound requests instantly** with human-style confirmations, Workspace follow-ups, and CRM-ready data.
4. **Maximize SEO signals** by ensuring new landing pages, schema, and GBP media are indexed/submitted immediately.

## Platform Overview
| Layer | Service | Purpose | Status |
| --- | --- | --- | --- |
| Data ingestion | Cloud Scheduler → Cloud Functions (Node) | Poll RSS/API feeds, normalize entries, push to Firestore/Pub/Sub | Ready to implement (code scaffold next) |
| Editorial review | Firestore + Google Sheets view | Ops-friendly queue to approve/edit Water Watch + GBP copy | Pending |
| Publishing | Node CLI + Cloud Run job | Reads queue, generates GBP post JSON, calls Business Profile API once OAuth is approved | CLI scaffold in progress |
| Notifications | Apps Script + Gmail/Chat | Send daily “new alerts” digest + failure notifications | Pending |
| Inquiry automation | Workspace Web App + Gmail drafts | Replace Formspree, store submissions internally, prep replies | Pending |
| SEO monitoring | Search Console API + BigQuery | Submit new URLs, pull coverage/performance metrics | Pending |

## Prerequisites Checklist
- [x] Google Cloud project `mission-pure-gbp` with billing enabled.
- [x] Workspace domain `mission-pure.com` with joe@mission-pure.com as Super Admin.
- [x] Business Profile API access request submitted (case 8-3185000041526).
- [ ] Business Profile API approval email (required before generating OAuth credentials).
- [ ] Service account with Firestore + Secret Manager access for automation jobs.

## Workstreams
### 1. Water Watch Feed → Cloud
- **Current**: `scripts/water-watch-refresh.js` + Task Scheduler refresh site HTML and JSON feed locally.
- **Next**: Mirror logic inside a Cloud Function that runs hourly via Cloud Scheduler, writing normalized entries to Firestore `waterWatchEntries` collection and Pub/Sub `waterwatch.alerts`.
- **Benefit**: Central queue can power GBP posts, email digests, and landing-page generators even if the site repo isn’t open.

### 2. GBP Autoposter
- **Current**: GBP assets documented in `GBP_ASSETS.md`; autoposter script being scaffolded (`scripts/gbp-poster.js`).
- **Next**:
  1. Create OAuth client (Desktop) + refresh token once API access is approved.
  2. Store credentials in Secret Manager (`GBP_OAUTH_JSON`, `GBP_REFRESH_TOKEN`).
  3. Run autoposter via Cloud Run or Windows Task Scheduler using the shared config file.
- **Publishing logic**:
  - Select top entry from Firestore/JSON feed that hasn’t been published (tracked via hash).
  - Build Google Business Profile `localPosts` payload with CTA + optional media.
  - Support `--dry-run` (default until approval) to dump JSON preview without hitting API.

### 3. Google Alerts + Apps Script Probe
- **Purpose**: Catch early mentions of boil notices, PFAS lawsuits, or DWU infrastructure issues.
- **Flow**: Google Alert → Gmail label `WaterWatch/Alerts` → Apps Script scheduled trigger → parse subject/body → append to Google Sheet + push to the same Firestore collection.
- **Action**: Create `apps-scripts/alerts-forwarder.gs` to authenticate via Workspace account (no OAuth client needed beyond Apps Script’s built-in scopes).

### 4. Search Console Automation
- **Automation**: Apps Script or Cloud Run job that:
  1. Reads `/incident-pages/*.html` commits (or Firestore queue) nightly.
  2. Calls Search Console API `urlInspection.index.inspect` to fetch coverage.
  3. Calls `indexing` API equivalents via URL Inspection API (beta) or logs manual instructions if not available.
  4. Emails a summarized report (indexed, discover, errors) to joe@mission-pure.com.
- **Benefit**: Ensures every Water Watch incident page is eligible for Discover + news surfaces quickly.

### 5. Contact + Inquiry Automation
- **Current**: Contact form posts to Formspree, displays instant human-style confirmation, provides copy/email actions.
- **Next**:
  - Deploy Workspace Web App (Apps Script) to receive POSTs, validate reCAPTCHA (if added), store rows in Sheets, and auto-create Gmail drafts referencing Nova’s summary.
  - Optional Twilio/Workspace Chat notification via Apps Script Webhook.

### 6. Auto-generated Media Pipeline
- **Concept**: Use Google Drive folder as a queue for Water Watch prompts. Apps Script listens for new docs, sends prompt to Imagen (via Vertex AI API), stores PNG/JPEG output in Cloud Storage, and returns the URL for GBP autoposter.
- **Status**: Pending Vertex AI enablement + service account.

### 7. Structured Data + Link Health Monitor
- **Automation**: Cloud Run job crawls mission-pure.com nightly, tests JSON-LD via Rich Results API, and validates internal links. Results stored in BigQuery + emailed if issues appear.

## Rollout Priorities
1. Finish GBP autoposter CLI + config (in repo, ready for tokens).
2. Add Cloud Function scaffold + Scheduler instructions (ingestion to Firestore/Pub/Sub).
3. Replace Formspree with Workspace Web App + Gmail drafts.
4. Layer on Alerts probe + Search Console automation.
5. Add media-generation + structured data monitors.

Once Business Profile API access arrives, we only need to drop in OAuth credentials and switch the autoposter from `--dry-run` to live mode; everything else will already be staged.
