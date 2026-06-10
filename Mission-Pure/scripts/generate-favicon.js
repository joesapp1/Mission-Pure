import pngToIco from "png-to-ico";
import sharp from "sharp";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const sourceSvg = resolve(root, "assets", "favicon.svg");
const pngPath = resolve(root, "assets", "favicon.png");
const targetFile = resolve(root, "favicon.ico");

async function run() {
  try {
    const svgBuffer = readFileSync(sourceSvg);
    const pngBuffer = await sharp(svgBuffer)
      .resize(512, 512, { fit: "contain" })
      .png({ compressionLevel: 9 })
      .toBuffer();
    writeFileSync(pngPath, pngBuffer);
    const icoBuffer = await pngToIco(pngBuffer);
    writeFileSync(targetFile, icoBuffer);
    console.log(`Generated ${pngPath} and ${targetFile}`);
  } catch (error) {
    console.error("Failed to build favicon", error);
    process.exitCode = 1;
  }
}

run();
