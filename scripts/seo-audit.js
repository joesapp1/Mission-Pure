/**
 * SEO / AEO audit probe for Mission Pure.
 *
 * Scans every top-level .html file and verifies the on-page signals search
 * engines and answer engines rely on. Prints a per-page report and exits with
 * a non-zero code if any required check fails (so it can gate a deploy).
 *
 * Usage:
 *   node scripts/seo-audit.js            # audit, exit 1 on failures
 *   node scripts/seo-audit.js --warn     # report only, always exit 0
 */

import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WARN_ONLY = process.argv.includes("--warn");

function descriptionContent(h) {
  const m = h.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  return m ? m[1].trim() : null;
}

function titleContent(h) {
  const m = h.match(/<title>([^<]+)<\/title>/i);
  return m ? m[1].trim() : null;
}

// Hard requirements: a missing tag fails the audit.
const REQUIRED = [
  { id: "lang", label: "html lang attribute", test: (h) => /<html[^>]*\blang=/i.test(h) },
  { id: "title", label: "<title> present", test: (h) => titleContent(h) !== null },
  { id: "description", label: "meta description present", test: (h) => descriptionContent(h) !== null },
  { id: "canonical", label: "canonical link", test: (h) => /<link[^>]*rel=["']canonical["']/i.test(h) },
  { id: "robots", label: "meta robots", test: (h) => /<meta[^>]*name=["']robots["']/i.test(h) },
  { id: "og:title", label: "og:title", test: (h) => /property=["']og:title["']/i.test(h) },
  { id: "og:image", label: "og:image", test: (h) => /property=["']og:image["']/i.test(h) },
  { id: "twitter", label: "twitter:card", test: (h) => /name=["']twitter:card["']/i.test(h) },
  { id: "h1", label: "exactly one <h1>", test: (h) => (h.match(/<h1[\s>]/gi) || []).length === 1 },
  { id: "jsonld", label: "JSON-LD structured data", test: (h) => /application\/ld\+json/i.test(h) },
  { id: "viewport", label: "viewport meta", test: (h) => /name=["']viewport["']/i.test(h) },
];

// Recommendations: warnings only, never fail the build.
const RECOMMENDED = [
  {
    id: "title-len",
    label: "title length 15-65 chars (avoids SERP truncation)",
    test: (h) => {
      const t = titleContent(h);
      return t !== null && t.length >= 15 && t.length <= 65;
    },
  },
  {
    id: "desc-len",
    label: "description length 70-160 chars (avoids SERP truncation)",
    test: (h) => {
      const d = descriptionContent(h);
      return d !== null && d.length >= 70 && d.length <= 160;
    },
  },
  { id: "faq", label: "FAQPage schema (great for AEO)", test: (h) => /"FAQPage"/.test(h) },
  { id: "breadcrumb", label: "BreadcrumbList schema", test: (h) => /"BreadcrumbList"/.test(h) },
];

function validateJsonLd(html) {
  const blocks = [...html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)];
  const errors = [];
  blocks.forEach((b, i) => {
    try {
      JSON.parse(b[1].trim());
    } catch (e) {
      errors.push(`JSON-LD block #${i + 1} is invalid: ${e.message}`);
    }
  });
  return errors;
}

(async () => {
  const entries = await readdir(ROOT, { withFileTypes: true });
  const htmlFiles = entries
    .filter((e) => e.isFile() && e.name.toLowerCase().endsWith(".html"))
    .map((e) => e.name)
    .sort();

  let failures = 0;
  let warnings = 0;

  for (const file of htmlFiles) {
    const info = await stat(path.join(ROOT, file));
    if (info.size < 200) {
      console.log(`\n[SKIP] ${file} (empty placeholder, ${info.size} bytes)`);
      continue;
    }
    const html = await readFile(path.join(ROOT, file), "utf8");
    const failed = REQUIRED.filter((c) => !c.test(html));
    const missingRec = RECOMMENDED.filter((c) => !c.test(html));
    const jsonErrors = validateJsonLd(html);

    const ok = failed.length === 0 && jsonErrors.length === 0;
    console.log(`\n${ok ? "[PASS]" : "[FAIL]"} ${file}`);
    failed.forEach((c) => console.log(`   x missing: ${c.label}`));
    jsonErrors.forEach((e) => console.log(`   x ${e}`));
    missingRec.forEach((c) => {
      console.log(`   ! recommended: ${c.label}`);
      warnings += 1;
    });

    if (!ok) failures += 1;
  }

  console.log(`\n----------------------------------------`);
  console.log(`Audited ${htmlFiles.length} files | ${failures} failing | ${warnings} recommendations`);

  if (failures > 0 && !WARN_ONLY) {
    process.exitCode = 1;
  }
})();
