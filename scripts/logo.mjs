// The site logo, drawn as SVG. Shared by build-icons.mjs (favicon and app
// icons) and build-brand.mjs (GitHub images).
//
// The logo is the hero's orbit as a mark: a white core with a tilted ring
// around it and the orange "heart" dot riding the ring, on the site's sky
// blue. The ring passes behind the top of the core and in front of the
// bottom (with a thin gap), so it reads as an orbit, not a flat ellipse.

import { createRequire } from "node:module";

// Site palette (globals.css: --brand, --highlight).
export const BLUE = "#0099ff";
export const ORANGE = "#ff5a1f";
export const WHITE = "#ffffff";

// Geometry on a 512 canvas, centred on 256.
const C = 256;
const RX = 168; // ring
const RY = 40;
const RING = 22; // ring stroke
const GAP = 8; // blue gap between the ring and the core where it crosses
const CORE = 78;
const TILT = -20; // degrees
const HEART = 30;
const HEART_AT = 25; // degrees round the ring from its right end, towards the front
const CORNER = 116; // rounded tile radius for the plain icons

const at = (deg) => {
  const a = (deg * Math.PI) / 180;
  return [C + RX * Math.cos(a), C + RY * Math.sin(a)];
};

/**
 * @param {object} o
 * @param {"tile" | "square" | "none"} [o.background] a rounded tile (the
 *   plain icons), a full-bleed square (apple and maskable icons, which the
 *   system rounds itself, and the GitHub avatar), or none (the mark alone, to
 *   place on a blue page)
 * @param {boolean} [o.grid] the hero's faint graph-paper grid behind the mark
 * @param {number} [o.scale] grow or shrink the mark (maskable icons keep it
 *   in the central safe circle)
 */
export function logo({ background = "tile", grid = false, scale = 1 } = {}) {
  const tile = {
    tile: `<rect width="512" height="512" rx="${CORNER}" fill="${BLUE}"/>`,
    square: `<rect width="512" height="512" fill="${BLUE}"/>`,
    none: "",
  }[background];
  const lines = [];
  if (grid) {
    for (let p = 64; p < 512; p += 64) {
      lines.push(`<path d="M${p} 0V512M0 ${p}H512"/>`);
    }
  }
  const front = `M ${C - RX} ${C} A ${RX} ${RY} 0 0 0 ${C + RX} ${C}`;
  const [hx, hy] = at(HEART_AT);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  ${tile}
  ${grid ? `<g stroke="${WHITE}" stroke-opacity="0.13" stroke-width="2">${lines.join("")}</g>` : ""}
  <g transform="translate(${C} ${C}) scale(${scale}) rotate(${TILT}) translate(${-C} ${-C})">
    <clipPath id="core"><circle cx="${C}" cy="${C}" r="${CORE + 1}"/></clipPath>
    <ellipse cx="${C}" cy="${C}" rx="${RX}" ry="${RY}" fill="none" stroke="${WHITE}" stroke-width="${RING}"/>
    <circle cx="${C}" cy="${C}" r="${CORE}" fill="${WHITE}"/>
    <path d="${front}" fill="none" stroke="${BLUE}" stroke-width="${RING + GAP * 2}" clip-path="url(#core)"/>
    <path d="${front}" fill="none" stroke="${WHITE}" stroke-width="${RING}" stroke-linecap="round"/>
    <circle cx="${hx.toFixed(1)}" cy="${hy.toFixed(1)}" r="${HEART}" fill="${ORANGE}" stroke="${BLUE}" stroke-width="${GAP + 1}"/>
  </g>
</svg>
`;
}

/** sharp (Next.js installs it), or a clear message and exit. */
export function loadSharp() {
  try {
    return createRequire(import.meta.url)("sharp");
  } catch {
    console.error("sharp is missing. Run npm install (Next.js brings it in) and retry.");
    process.exit(1);
  }
}
