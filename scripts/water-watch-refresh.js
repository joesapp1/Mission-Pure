import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";
import { XMLParser } from "fast-xml-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const DATA_DIR = path.join(projectRoot, "data");
const SOURCES_PATH = path.join(DATA_DIR, "water-watch-sources.json");
const FEED_OUTPUT_PATH = path.join(DATA_DIR, "water-watch-feed.json");
const WATER_WATCH_PAGE = path.join(projectRoot, "water-watch.html");

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });

const FALLBACK_ENTRIES = [
  {
    id: "fallback-arlington",
    sourceId: "mission-pure",
    sourceLabel: "Mission Pure Logs",
    city: "Arlington",
    title: "Arlington trihalomethanes trend upward heading into summer",
    summary:
      "Technician sampling along the Trinity River corridor shows TTHMs hovering around 2.4× our health guideline. Swapping catalytic carbon at year 4 keeps shower steam from smelling like a pool.",
    url: "arlington-irving-water-filtration.html",
    publishedAt: new Date().toISOString(),
    tags: ["TTHM", "chloramine"],
  },
  {
    id: "fallback-plano",
    sourceId: "mission-pure",
    sourceLabel: "Mission Pure Logs",
    city: "Plano",
    title: "Plano moms opt for whole-home + RO combo",
    summary:
      "Community Q&A revealed NTMWD chloramine taste during baby bottle prep. Families are pairing whole-home catalytic carbon with under-sink RO to keep PFAS and TTHMs out of the kitchen.",
    url: "frisco-plano-water-filtration.html",
    publishedAt: new Date().toISOString(),
    tags: ["NTMWD", "PFAS"],
  },
  {
    id: "fallback-mckinney",
    sourceId: "mission-pure",
    sourceLabel: "Mission Pure Logs",
    city: "McKinney",
    title: "Lead service line bypass keeps 75071 kitchen safe",
    summary:
      "We replaced a corroded service line feeding a 1990s home and routed drinking water through under-sink RO while the city finalizes a permanent upgrade.",
    url: "service-areas.html#metroGrid",
    publishedAt: new Date().toISOString(),
    tags: ["lead", "RO"],
  },
];

async function readJson(file) {
  const raw = await fs.readFile(file, "utf-8");
  return JSON.parse(raw);
}

async function fetchRss(source) {
  const response = await fetch(source.url, {
    headers: {
      "user-agent": "MissionPureWaterWatch/1.0 (+https://mission-pure.com)",
      accept: "application/rss+xml, application/xml;q=0.9, */*;q=0.8",
    },
  });
  if (!response.ok) {
    throw new Error(`RSS request failed (${response.status} ${response.statusText})`);
  }

  const xml = await response.text();
  const data = parser.parse(xml);
  const items =
    ensureArray(data?.rss?.channel?.item) ||
    ensureArray(data?.feed?.entry) ||
    [];

  const limit = source.limit ?? 3;

  return items
    .slice(0, limit)
    .map((item) => normalizeRssItem(item, source))
    .filter(Boolean);
}

function normalizeRssItem(item, source) {
  const title = String(item.title || item["media:title"] || "Untitled").trim();
  const description =
    String(item.description || item.summary || item.content || "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  const publishedAt = item.pubDate || item.updated || item.published || new Date().toISOString();
  const link = String(item.link?.["@_href"] || item.link || source.url).trim();

  const haystack = `${title} ${description}`.toLowerCase();
  const keywords = source.keywords || [];
  const hasKeyword = keywords.length === 0 || keywords.some((kw) => haystack.includes(kw.toLowerCase()));

  if (!hasKeyword) return null;

  const id = `${source.id}-${crypto.createHash("md5").update(title + publishedAt).digest("hex").slice(0, 8)}`;

  return {
    id,
    sourceId: source.id,
    sourceLabel: source.label,
    city: source.city,
    title,
    summary: (description || `${source.city} water update`).trim(),
    url: link,
    publishedAt: new Date(publishedAt).toISOString(),
    tags: source.tags || [],
    cta: source.defaultCta || "service-areas.html",
  };
}

async function collectEntries() {
  const sources = await readJson(SOURCES_PATH);
  const results = [];

  for (const source of sources) {
    try {
      if (source.type === "rss") {
        const entries = await fetchRss(source);
        results.push(...entries);
      } else {
        console.warn(`Unsupported source type: ${source.type}`);
      }
    } catch (error) {
      console.warn(`Failed to fetch ${source.label}: ${error.message}`);
    }
  }

  return results;
}

function ensureArray(value) {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null) return [];
  return [value];
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Recently";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function summarize(entry) {
  if (entry.summary?.length <= 220) return entry.summary;
  return `${entry.summary.slice(0, 217)}...`;
}

function buildFeaturedHtml(featured, facts) {
  const factItems = facts
    .map(
      (fact) => `            <div class="fact">
              <div class="fact-label">${escapeHtml(fact.label)}</div>
              <div class="fact-value">${escapeHtml(fact.value)}</div>
            </div>`
    )
    .join("\n");

  return `          <article class="featured" id="featuredStory">
            <div class="eyebrow">Featured analysis</div>
            <h2>${escapeHtml(featured.title)}</h2>
            <p class="muted">${escapeHtml(summarize(featured))}</p>
            <ul class="list">
              <li>City focus: ${escapeHtml(featured.city)}</li>
              <li>Source: ${escapeHtml(featured.sourceLabel)}</li>
              <li>Published: ${escapeHtml(formatDate(featured.publishedAt))}</li>
            </ul>
            <a class="link" href="${escapeHtml(featured.url)}">Read source →</a>
          </article>
          <aside class="fact-panel">
            <div class="panel-title">In-field readings</div>
            <div class="muted">Technician snapshots + public alerts.</div>
${factItems}
          </aside>`;
}

function buildPostsHtml(entries) {
  return entries
    .map(
      (entry) => `            <article class="post-card">
              <div class="post-tag">${escapeHtml(entry.city)} alert</div>
              <h3>${escapeHtml(entry.title)}</h3>
              <p class="muted">${escapeHtml(summarize(entry))}</p>
              <ul class="list">
                <li>Source: ${escapeHtml(entry.sourceLabel)}</li>
                <li>Published: ${escapeHtml(formatDate(entry.publishedAt))}</li>
                <li>Tags: ${escapeHtml(entry.tags.join(", ") || "water quality")}</li>
              </ul>
              <a class="link" href="${escapeHtml(entry.cta || entry.url)}">Learn more →</a>
            </article>`
    )
    .join("\n\n");
}

function injectBlock(content, startMarker, endMarker, htmlBlock) {
  const startIndex = content.indexOf(startMarker);
  const endIndex = content.indexOf(endMarker);
  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    throw new Error(`Markers ${startMarker} / ${endMarker} not found in water-watch.html`);
  }

  const before = content.slice(0, startIndex + startMarker.length);
  const after = content.slice(endIndex);
  const trimmed = `\n${htmlBlock}\n          `;
  return `${before}${trimmed}${after}`;
}

async function updateWaterWatchPage(featured, posts) {
  const page = await fs.readFile(WATER_WATCH_PAGE, "utf-8");

  const facts = [featured, ...posts].slice(0, 3).map((entry) => ({
    label: `${entry.city} update`,
    value: summarize(entry),
  }));

  const featuredHtml = buildFeaturedHtml(featured, facts);
  const postsHtml = buildPostsHtml(posts);

  let next = injectBlock(page, "<!-- WATER_WATCH_FEATURED:START -->", "<!-- WATER_WATCH_FEATURED:END -->", featuredHtml);
  next = injectBlock(next, "<!-- WATER_WATCH_POSTS:START -->", "<!-- WATER_WATCH_POSTS:END -->", postsHtml);

  await fs.writeFile(WATER_WATCH_PAGE, next);
}

async function saveFeed(entries) {
  const payload = {
    generatedAt: new Date().toISOString(),
    entries,
  };
  await fs.writeFile(FEED_OUTPUT_PATH, JSON.stringify(payload, null, 2));
}

async function run() {
  const collected = await collectEntries();

  const merged = [...collected, ...FALLBACK_ENTRIES]
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, 6);

  const [featured, ...rest] = merged;
  const posts = rest.slice(0, 3);

  await saveFeed(merged);
  await updateWaterWatchPage(featured, posts);

  console.log(`Water Watch refreshed with ${merged.length} entries (featured: ${featured.title}).`);
}

run().catch((error) => {
  console.error("Water Watch refresh failed", error);
  process.exitCode = 1;
});
