/**
 * IndexNow submitter for Mission Pure.
 *
 * Notifies IndexNow-compatible engines (Bing, Yandex, Seznam, Naver) the
 * moment pages change so they recrawl quickly. Reads URLs from sitemap.xml.
 *
 * Setup (one time):
 *   1. Generate a key (any 8-128 hex chars), e.g. via: node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
 *   2. Create a file at the site root named <key>.txt whose only contents is <key>.
 *      Deploy it so https://mission-pure.com/<key>.txt is reachable.
 *   3. Set the key in your shell:  setx INDEXNOW_KEY <key>   (Windows)
 *
 * Usage:
 *   node scripts/indexnow-ping.js            # dry-run: prints payload only
 *   node scripts/indexnow-ping.js --submit   # actually submits to IndexNow
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HOST = "mission-pure.com";
const ENDPOINT = "https://api.indexnow.org/indexnow";
const SUBMIT = process.argv.includes("--submit");

async function readSitemapUrls() {
  const xml = await readFile(path.join(ROOT, "sitemap.xml"), "utf8");
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((m) => m[1].trim());
}

(async () => {
  const urlList = await readSitemapUrls();
  if (urlList.length === 0) {
    console.error("No URLs found in sitemap.xml. Run `npm run sitemap` first.");
    process.exitCode = 1;
    return;
  }

  const key = process.env.INDEXNOW_KEY;
  console.log(`Found ${urlList.length} URLs in sitemap.xml.`);

  if (!SUBMIT) {
    console.log("\n[DRY RUN] Pass --submit to send. Payload preview:");
    console.log(JSON.stringify({ host: HOST, key: key || "<INDEXNOW_KEY not set>", urlList }, null, 2));
    return;
  }

  if (!key) {
    console.error("INDEXNOW_KEY is not set. See setup notes at the top of this file.");
    process.exitCode = 1;
    return;
  }

  const body = {
    host: HOST,
    key,
    keyLocation: `https://${HOST}/${key}.txt`,
    urlList,
  };

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(body),
    });
    console.log(`IndexNow responded ${res.status} ${res.statusText}`);
    if (res.status >= 400) {
      const text = await res.text();
      console.error(text);
      process.exitCode = 1;
    } else {
      console.log("Submitted successfully. Engines will recrawl shortly.");
    }
  } catch (e) {
    console.error("IndexNow submission failed:", e.message);
    process.exitCode = 1;
  }
})();
