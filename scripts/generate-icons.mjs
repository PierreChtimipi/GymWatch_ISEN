import sharp from "sharp";
import { readFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const svgBuffer = readFileSync(join(root, "public", "favicon.svg"));

mkdirSync(join(root, "public"), { recursive: true });

const icons = [
  { name: "pwa-64x64.png", size: 64 },
  { name: "pwa-192x192.png", size: 192 },
  { name: "pwa-512x512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
  { name: "maskable-icon-512x512.png", size: 512, padding: 0.1 },
];

for (const icon of icons) {
  const size = icon.size;
  let pipeline = sharp(svgBuffer).resize(size, size);

  if (icon.padding) {
    // maskable: add safe-zone padding (10% each side)
    const inner = Math.round(size * (1 - icon.padding * 2));
    pipeline = sharp(svgBuffer)
      .resize(inner, inner)
      .extend({
        top: Math.round(size * icon.padding),
        bottom: Math.round(size * icon.padding),
        left: Math.round(size * icon.padding),
        right: Math.round(size * icon.padding),
        background: { r: 245, g: 166, b: 35, alpha: 1 },
      });
  }

  await pipeline.png().toFile(join(root, "public", icon.name));
  console.log(`✓ ${icon.name}`);
}

console.log("Icons generated.");
