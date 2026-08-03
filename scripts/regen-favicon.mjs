import pngToIco from "png-to-ico";
import sharp from "sharp";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const pngPath = resolve(root, "assets", "favicon.png");
const targetFile = resolve(root, "favicon.ico");

const squarePng = await sharp(pngPath)
  .resize(256, 256, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();

const icoBuffer = await pngToIco(squarePng);
writeFileSync(targetFile, icoBuffer);
console.log(`Generated favicon.ico from assets/favicon.png (${icoBuffer.length} bytes)`);
