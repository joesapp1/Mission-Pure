import sharp from "sharp";
import { readdir, stat, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT   = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ASSETS = path.join(ROOT, "assets");
const QUALITY = 82;

// Keep favicon as PNG/ICO — browser favicon WebP support is inconsistent
const SKIP = new Set(["favicon.png", "favicon.svg"]);

// ── Step 1: Convert images ────────────────────────────────────────────────
console.log("Converting images to WebP...");
const converted = [];

for (const file of await readdir(ASSETS)) {
  if (SKIP.has(file)) continue;
  const ext = path.extname(file).toLowerCase();
  if (![".png", ".jpg", ".jpeg"].includes(ext)) continue;

  const inPath  = path.join(ASSETS, file);
  const outName = file.slice(0, -ext.length) + ".webp";
  const outPath = path.join(ASSETS, outName);

  const inKB = Math.round((await stat(inPath)).size / 1024);
  await sharp(inPath).webp({ quality: QUALITY }).toFile(outPath);
  const outKB  = Math.round((await stat(outPath)).size / 1024);
  const saving = Math.round((1 - outKB / inKB) * 100);
  console.log(`  ${file} → ${outName}: ${inKB}KB → ${outKB}KB  (-${saving}%)`);
  converted.push({ from: file, to: outName, ext });
}

if (converted.length === 0) {
  console.log("No images needed conversion.");
  process.exit(0);
}

// ── Step 2: Patch HTML / JS references ───────────────────────────────────
console.log("\nPatching asset references in HTML and JS...");

const rootEntries = await readdir(ROOT);
const targets = [
  ...rootEntries
    .filter(f => [".html", ".js"].includes(path.extname(f).toLowerCase()))
    .map(f => path.join(ROOT, f)),
  path.join(ROOT, "scripts", "trend-harvest.js"),
];

let patchCount = 0;
for (const filePath of targets) {
  let content;
  try { content = await readFile(filePath, "utf-8"); } catch { continue; }

  let updated = content;
  for (const { from, to } of converted) {
    if (from.startsWith("favicon")) continue; // never touch favicon refs
    updated = updated.replaceAll(`assets/${from}`, `assets/${to}`);
  }

  if (updated !== content) {
    await writeFile(filePath, updated, "utf-8");
    console.log(`  Patched ${path.relative(ROOT, filePath)}`);
    patchCount++;
  }
}

console.log(`\nDone — converted ${converted.length} images, patched ${patchCount} files.`);
console.log('Run  npm run deploy  to push changes live.');
