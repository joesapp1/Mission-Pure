import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";
import { google } from "googleapis";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const SITE_URL = process.env.GSC_SITE_URL || "https://mission-pure.com";
const SITE_DOMAIN = SITE_URL.replace(/https?:\/\//i, "");
const OUTPUT_HTML = process.env.TREND_OUTPUT_HTML || path.join(ROOT, "hot-searches.html");
const FEED_PATH = process.env.TREND_FEED_PATH || path.join(ROOT, "data", "trend-feed.json");
const TOPIC_CONFIG = process.env.TREND_TOPIC_FILE || path.join(ROOT, "data", "trend-topics.json");
const DEFAULT_REGION = process.env.TREND_DEFAULT_REGION || "North Texas";
const MAX_POSTS = Number(process.env.TREND_POST_LIMIT || 5);
const LOOKBACK_DAYS = Number(process.env.TREND_LOOKBACK_DAYS || 1);

const FALLBACK_QUERIES = [
  "smelly tap water",
  "dallas pfas update",
  "fort worth boil notice",
  "plano hard water",
  "mission pure water filter"
];

const CITY_HINTS = [
  { label: "Dallas", keywords: ["dallas", "dwu", "white rock"] },
  { label: "Fort Worth", keywords: ["fort worth", "tarrant", "trwd"] },
  { label: "Plano / Frisco", keywords: ["plano", "frisco", "ntmwd"] },
  { label: "McKinney / Allen", keywords: ["mckinney", "allen", "collin"] },
  { label: "Lewisville / Denton", keywords: ["lewisville", "denton", "upper trinity"] },
];

async function readTopics() {
  const raw = await fs.readFile(TOPIC_CONFIG, "utf-8");
  return JSON.parse(raw);
}

async function fetchSearchConsoleRows() {
  const keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const inlineJson =
    process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  if (!keyFile && !inlineJson) {
    throw new Error(
      "Set GOOGLE_APPLICATION_CREDENTIALS to the Mission Pure service-account key path or provide GOOGLE_APPLICATION_CREDENTIALS_JSON"
    );
  }

  const auth = new google.auth.GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
    keyFile: inlineJson ? undefined : keyFile,
    credentials: inlineJson ? JSON.parse(inlineJson) : undefined,
  });

  const sc = google.searchconsole({ version: "v1", auth });
  const endDate = new Date();
  const startDate = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
  const body = {
    startDate: startDate.toISOString().slice(0, 10),
    endDate: endDate.toISOString().slice(0, 10),
    dimensions: ["query"],
    rowLimit: Number(process.env.GSC_ROW_LIMIT || 50),
    type: "web",
  };

  const { data } = await sc.searchanalytics.query({ siteUrl: SITE_URL, requestBody: body });
  return data.rows || [];
}

function fallbackRows() {
  return FALLBACK_QUERIES.map((query) => ({ keys: [query], clicks: 0, impressions: 0 }));
}

function detectRegion(query) {
  const normalized = query.toLowerCase();
  for (const hint of CITY_HINTS) {
    if (hint.keywords.some((kw) => normalized.includes(kw))) {
      return hint.label;
    }
  }
  return DEFAULT_REGION;
}

function pickTopic(topics, query) {
  const normalized = query.toLowerCase();
  for (const topic of topics) {
    if (!topic.keywords || topic.keywords.length === 0) continue;
    if (topic.keywords.some((kw) => normalized.includes(kw.toLowerCase()))) {
      return topic;
    }
  }
  return topics.find((t) => t.id === "general") || topics[topics.length - 1];
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || `trend-${crypto.randomBytes(3).toString("hex")}`;
}

function interpolate(template, replacements) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => replacements[key] ?? ``);
}

function buildPosts(rows, topics) {
  const posts = [];
  const seen = new Set();

  for (const row of rows) {
    const query = String(row.keys?.[0] || "").trim();
    if (!query) continue;

    const topic = pickTopic(topics, query);
    const region = detectRegion(query);
    const slug = slugify(`${topic.id}-${query}`);
    if (seen.has(slug)) continue;

    const replacements = {
      query,
      cityOrRegion: region,
    };

    const title = interpolate(topic.title, replacements);
    const intro = interpolate(topic.intro, replacements);
    const bullets = (topic.bullets || []).map((b) => interpolate(b, replacements));

    posts.push({
      slug,
      query,
      clicks: row.clicks ?? 0,
      impressions: row.impressions ?? 0,
      ctr: row.ctr ?? 0,
      position: row.position ?? 0,
      topicId: topic.id,
      title,
      intro,
      bullets,
      ctaLabel: topic.ctaLabel,
      ctaUrl: topic.ctaUrl,
      region,
    });

    seen.add(slug);
    if (posts.length >= MAX_POSTS) break;
  }

  return posts;
}

function buildHtml(posts) {
  const generatedAt = new Date().toLocaleString("en-US", { timeZone: "America/Chicago" });
  const cards = posts
    .map(
      (post) => `          <article class="trend-card">
            <div class="trend-eyebrow">Trending search: “${escapeHtml(post.query)}”</div>
            <h2>${escapeHtml(post.title)}</h2>
            <p class="muted">${escapeHtml(post.intro)}</p>
            <ul class="list">
              ${post.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("\n              ")}
            </ul>
            <div class="trend-meta">Region: ${escapeHtml(post.region)} · Topic: ${escapeHtml(post.topicId)}</div>
            <a class="btn btn-primary" href="${escapeAttr(post.ctaUrl)}">${escapeHtml(post.ctaLabel || "Book Mission Pure")}</a>
          </article>`
    )
    .join("\n\n");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Mission Pure | Real-time water search trends</title>
    <meta name="description" content="Mission Pure auto-builds landing pages for the hottest water-related searches so North Texas homeowners act fast." />
    <link rel="canonical" href="https://mission-pure.com/hot-searches.html" />
    <link rel="stylesheet" href="styles.css?v=202605310925" />
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header nav-ready">
      <div class="container header-inner">
        <a class="brand" href="index.html" aria-label="Mission Pure home">
          <img class="brand-logo" src="assets/logo.png?v=202605310925" alt="Mission Pure" />
          <div class="brand-text">
            <div class="brand-tagline">Mission Pure Hot Searches</div>
          </div>
        </a>
        <button class="nav-toggle" id="navToggle" type="button" aria-label="Toggle navigation" aria-expanded="false">
          <span class="nav-toggle-box"><span class="nav-toggle-line"></span></span>
        </button>
        <nav class="header-actions" aria-label="Primary">
          <a class="btn btn-ghost" href="service-areas.html">Service Areas</a>
          <a class="btn btn-ghost" href="water-watch.html">Water Watch</a>
          <button class="btn btn-ghost" id="openZipModalBtn" type="button">Check contaminants</button>
          <a class="btn btn-primary" href="contact.html">Book consult</a>
        </nav>
      </div>
    </header>

    <main id="main" class="section">
      <div class="container">
        <div class="section-head">
          <h1>Real-time water concern searches</h1>
          <div class="muted">Generated on ${escapeHtml(generatedAt)} from Search Console property ${escapeHtml(
            SITE_DOMAIN
          )}. These posts tie each query back to ZIP lookups, Water Watch data, and install CTAs.</div>
        </div>
        <div class="trend-grid">
${cards}
        </div>
      </div>
    </main>

    <footer class="site-footer">
      <div class="container">
        <div>Mission Pure © ${new Date().getFullYear()}</div>
        <div>Need help fast? <a href="tel:+19512043095">Call +1 (951) 204-3095</a></div>
      </div>
    </footer>

    <script defer src="app.js?v=202605310925"></script>
  </body>
</html>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/\"/g, "&quot;");
}

async function writeFeed(posts) {
  const payload = {
    generatedAt: new Date().toISOString(),
    property: SITE_URL,
    posts,
  };
  await fs.mkdir(path.dirname(FEED_PATH), { recursive: true });
  await fs.writeFile(FEED_PATH, JSON.stringify(payload, null, 2));
}

async function writePage(posts) {
  const html = buildHtml(posts);
  await fs.writeFile(OUTPUT_HTML, html);
}

async function run() {
  const topics = await readTopics();
  let rows;
  try {
    rows = process.env.TREND_USE_FALLBACK === "1" ? fallbackRows() : await fetchSearchConsoleRows();
  } catch (error) {
    console.warn("Search Console request failed, using fallback queries.", error.message);
    rows = fallbackRows();
  }

  const posts = buildPosts(rows, topics);
  if (posts.length === 0) {
    throw new Error("No posts generated from Search Console data.");
  }

  await writeFeed(posts);
  await writePage(posts);
  console.log(`Generated ${posts.length} trend posts from property ${SITE_URL}.`);
}

run().catch((error) => {
  console.error("Trend harvest failed", error);
  process.exitCode = 1;
});
