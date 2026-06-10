/**
 * Sitemap generator for Mission Pure.
 *
 * Auto-discovers every top-level .html file, maps index.html to "/", assigns
 * sensible priorities, and writes sitemap.xml with today's lastmod.
 *
 * Usage: node scripts/generate-sitemap.js
 * Recommended: run after adding/regenerating pages, before deploy.
 */

import { readdir, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://mission-pure.com";

// Pages we never want indexed (none currently). Add filenames to exclude.
const EXCLUDE = new Set([]);

function priorityFor(file) {
  if (file === "index.html") return "1.0";
  if (file === "service-areas.html") return "0.9";
  if (file === "whole-home-water-filtration.html") return "0.9";
  if (file === "under-sink-reverse-osmosis.html") return "0.9";
  if (file === "contact.html") return "0.7";
  if (file === "water-watch.html") return "0.8";
  // City landing pages and everything else
  return "0.8";
}

function locFor(file) {
  return file === "index.html" ? `${SITE}/` : `${SITE}/${file}`;
}

(async () => {
  const entries = await readdir(ROOT, { withFileTypes: true });
  const htmlFiles = entries
    .filter((e) => e.isFile() && e.name.toLowerCase().endsWith(".html"))
    .map((e) => e.name)
    .filter((name) => !EXCLUDE.has(name))
    .sort((a, b) => {
      // index first, then alphabetical
      if (a === "index.html") return -1;
      if (b === "index.html") return 1;
      return a.localeCompare(b);
    });

  const today = new Date().toISOString().slice(0, 10);

  const urls = [];
  for (const file of htmlFiles) {
    const filePath = path.join(ROOT, file);
    const info = await stat(filePath);
    // Skip empty placeholder files so we never publish thin/blank URLs.
    if (info.size < 200) {
      console.warn(`Skipping ${file} (size ${info.size} bytes looks empty)`);
      continue;
    }
    const lastmod = info.mtime.toISOString().slice(0, 10) || today;
    urls.push(
      `  <url>\n    <loc>${locFor(file)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <priority>${priorityFor(file)}</priority>\n  </url>`
    );
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
  await writeFile(path.join(ROOT, "sitemap.xml"), xml, "utf8");
  console.log(`Wrote sitemap.xml with ${urls.length} URLs.`);
})();
