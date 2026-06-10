import { readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";

const version = process.argv[2] || new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 12);

function versionUrl(value) {
  return value.replace(/(\.(?:json|jpeg|css|js|jpg|png|svg))(?:\?v=[^"'`\)\s]+)?/gi, `$1?v=${version}`);
}

async function discoverHtmlFiles() {
  const entries = await readdir(".", { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".html"))
    .map((entry) => entry.name)
    .sort();
}

async function updateFile(file) {
  const filePath = path.resolve(file);
  const original = await readFile(filePath, "utf8");
  let next = original;

  if (file.endsWith(".html")) {
    next = next.replace(/\b(?:href|src)=("|')([^"']+)(\1)/gi, (match, quote, url) => {
      if (/^(?:https?:|mailto:|tel:|#)/i.test(url)) return match;
      return match.replace(url, versionUrl(url));
    });
  }

  if (path.basename(file) === "app.js") {
    next = next.replace(/const APP_BUILD = "[^"]+";/, `const APP_BUILD = "${version}";`);
    next = next.replace(/(const (?:DATASET_URL|DFW_ZIP_MAP_URL|CHEM_INFO_URL) = ")([^"]+)(";)/g, (_, start, url, end) => {
      return `${start}${versionUrl(url)}${end}`;
    });
  }

  if (next !== original) {
    await writeFile(filePath, next, "utf8");
    console.log(`Updated ${file}`);
  } else {
    console.log(`No changes needed in ${file}`);
  }
}

(async () => {
  const htmlFiles = await discoverHtmlFiles();
  const files = [...htmlFiles, "app.js"];
  await Promise.all(files.map(updateFile));
  console.log(`Cache-bust version: ${version}`);
})();
