#!/usr/bin/env node
// Writes every icon the site needs into public/: favicon.svg, favicon.ico,
// favicon-96x96.png, apple-touch-icon.png and the web app manifest icons
// (192, 512 and a maskable 512). The logo itself is drawn in logo.mjs.
// Usage: npm run icons   (uses sharp, which Next.js already installs)

import { writeFileSync } from "node:fs";
import path from "node:path";
import { loadSharp, logo } from "./logo.mjs";

const sharp = loadSharp();
const out = (name) => path.join(process.cwd(), "public", name);
const png = (svg, size) => sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();

/** A .ico file holding PNG images (supported by every current browser). */
function ico(images) {
  const header = Buffer.alloc(6 + images.length * 16);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, data }, i) => {
    const entry = 6 + i * 16;
    header.writeUInt8(size >= 256 ? 0 : size, entry);
    header.writeUInt8(size >= 256 ? 0 : size, entry + 1);
    header.writeUInt16LE(1, entry + 4); // colour planes
    header.writeUInt16LE(32, entry + 6); // bits per pixel
    header.writeUInt32LE(data.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...images.map((image) => image.data)]);
}

// The rounded tile fills more of its square, so the favicon still reads at 16px.
const tile = logo({ scale: 1.12 });
const full = logo({ background: "square", grid: true, scale: 0.9 });
const maskable = logo({ background: "square", grid: true, scale: 0.8 });

writeFileSync(out("favicon.svg"), tile);
writeFileSync(out("favicon-96x96.png"), await png(tile, 96));
writeFileSync(out("web-app-manifest-192x192.png"), await png(tile, 192));
writeFileSync(out("web-app-manifest-512x512.png"), await png(tile, 512));
writeFileSync(out("web-app-manifest-maskable-512x512.png"), await png(maskable, 512));
writeFileSync(out("apple-touch-icon.png"), await png(full, 180));
writeFileSync(
  out("favicon.ico"),
  ico(await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await png(tile, size) })))),
);

console.log("Icons written to public/.");
