import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const DATA_DIR = path.join(projectRoot, "data");
const FEED_PATH = path.join(DATA_DIR, "water-watch-feed.json");
const HISTORY_PATH = path.join(DATA_DIR, "gbp-post-history.json");
const CONFIG_DEFAULT = path.join(projectRoot, "config", "gbp.config.json");
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const POSTS_BASE = "https://businessprofile.googleapis.com/v1";

async function readJson(file) {
  const raw = await fs.readFile(file, "utf-8");
  return JSON.parse(raw);
}

async function readJsonIfExists(file, fallback) {
  try {
    return await readJson(file);
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: true,
    configPath: CONFIG_DEFAULT,
    previewPath: null,
  };

  for (const arg of args) {
    if (arg === "--live" || arg === "--no-dry-run") {
      options.dryRun = false;
    } else if (arg.startsWith("--config=")) {
      options.configPath = path.resolve(arg.split("=")[1]);
    } else if (arg.startsWith("--preview=")) {
      options.previewPath = path.resolve(arg.split("=")[1]);
    } else if (arg === "--help" || arg === "-h") {
      options.help = true;
    }
  }

  return options;
}

function printHelp() {
  console.log(`Usage: node scripts/gbp-poster.js [options]\n\nOptions:\n  --config=PATH     Path to gbp.config.json (default: ${CONFIG_DEFAULT})\n  --preview=PATH    Write payload preview JSON to PATH\n  --live            Actually call the Business Profile API (requires credentials)\n  --help            Show this message\n`);
}

function requireConfigFields(config) {
  const required = ["locationId", "callToAction", "callToAction.actionType", "callToAction.url"];
  const missing = required.filter((key) => !get(config, key));
  if (missing.length > 0) {
    throw new Error(`Config missing required fields: ${missing.join(", ")}`);
  }
}

function get(obj, pathExpression) {
  return pathExpression.split(".").reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

async function loadFeedEntries() {
  const feed = await readJson(FEED_PATH);
  const entries = Array.isArray(feed?.entries) ? feed.entries : [];
  if (entries.length === 0) throw new Error("No entries available. Run npm run waterwatch:refresh first.");
  return entries.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
}

async function loadHistory() {
  const history = await readJsonIfExists(HISTORY_PATH, { posted: [] });
  history.posted = Array.isArray(history.posted) ? history.posted : [];
  return history;
}

function hashEntry(entry) {
  return crypto.createHash("md5").update(`${entry.id}-${entry.publishedAt}`).digest("hex");
}

function selectEntry(entries, history) {
  const postedSet = new Set(history.posted);
  return entries.find((entry) => !postedSet.has(hashEntry(entry))) || entries[0];
}

function trimSummary(text, suffix) {
  const combined = suffix ? `${text.trim()} ${suffix.trim()}` : text.trim();
  const limit = 730; // GBP posts cap at 1500 chars; stay well under.
  if (combined.length <= limit) return combined;
  return `${combined.slice(0, limit - 3).trim()}...`;
}

function resolveUrl(base, value) {
  if (!value) return value;
  try {
    return new URL(value, base).toString();
  } catch {
    return value;
  }
}

function buildPayload(entry, config) {
  const summarySource = entry.summary || entry.title || "Water quality update";
  const summary = trimSummary(summarySource, config.summarySuffix || "");

  const callToAction = {
    actionType: config.callToAction.actionType,
    url: resolveUrl(config.siteBaseUrl || "https://mission-pure.com/", entry.cta || config.callToAction.url),
  };

  const payload = {
    languageCode: "en-US",
    topicType: "STANDARD",
    summary,
    callToAction,
  };

  if (Array.isArray(config.media) && config.media.length > 0) {
    payload.media = config.media.map((item) => ({
      mediaFormat: item.mediaFormat || "PHOTO",
      sourceUrl: resolveUrl(config.siteBaseUrl || "https://mission-pure.com/", item.sourceUrl),
    }));
  }

  return payload;
}

async function writePreview(previewPath, entry, payload) {
  if (!previewPath) return;
  await fs.mkdir(path.dirname(previewPath), { recursive: true });
  await fs.writeFile(
    previewPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        entry,
        payload,
      },
      null,
      2
    )
  );
}

function hasApiCredentials(config) {
  return Boolean(config.clientId && config.clientSecret && config.refreshToken);
}

async function fetchAccessToken(config) {
  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    refresh_token: config.refreshToken,
    grant_type: "refresh_token",
  });

  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to refresh access token (${response.status}): ${text}`);
  }

  const json = await response.json();
  return json.access_token;
}

async function publishPost(locationId, payload, token) {
  const endpoint = `${POSTS_BASE}/${locationId}/localPosts`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Post request failed (${response.status}): ${text}`);
  }

  return response.json();
}

async function saveHistory(history) {
  await fs.writeFile(HISTORY_PATH, JSON.stringify(history, null, 2));
}

async function main() {
  const options = parseArgs();
  if (options.help) {
    printHelp();
    return;
  }

  const config = await readJson(options.configPath).catch((error) => {
    if (error.code === "ENOENT") {
      throw new Error(`Config not found at ${options.configPath}. Copy config/gbp.config.example.json to gbp.config.json and fill it out.`);
    }
    throw error;
  });

  requireConfigFields(config);

  const entries = await loadFeedEntries();
  const history = await loadHistory();
  const entry = selectEntry(entries, history);
  if (!entry) throw new Error("Unable to select entry for posting.");

  const payload = buildPayload(entry, config);
  const previewPath = options.previewPath || config.draftPreviewPath;
  await writePreview(previewPath, entry, payload);

  if (options.dryRun) {
    console.log(`[dry-run] Built GBP post for entry ${entry.id}. Preview saved to ${previewPath || "(not set)"}.`);
    return;
  }

  if (!hasApiCredentials(config)) {
    throw new Error("Live mode requires clientId, clientSecret, and refreshToken in the config file.");
  }

  const token = await fetchAccessToken(config);
  const response = await publishPost(config.locationId, payload, token);

  history.posted.push(hashEntry(entry));
  await saveHistory(history);

  console.log(`Posted '${entry.title}' to GBP. Post name: ${response.name}`);
}

main().catch((error) => {
  console.error("GBP post failed", error);
  process.exitCode = 1;
});
