#!/usr/bin/env node
// Writes the GitHub images into brand/:
//   github-avatar.png          1024x1024, for the profile picture (GitHub crops
//                              it to a circle; the mark stays inside it)
//   github-social-preview.png  1280x640, for a repository's Settings > Social
//                              preview, in the hero's style
// Usage: npm run brand   (uses sharp and headless Chrome or Edge; the social
// preview loads Inter and Instrument Serif from Google Fonts, so it needs a
// connection, or it falls back to system fonts)

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { BLUE, ORANGE, loadSharp, logo } from "./logo.mjs";

const sharp = loadSharp();
const outDir = path.join(process.cwd(), "brand");
mkdirSync(outDir, { recursive: true });

// Avatar: the logo on a full square with the hero grid. The mark is large
// (GitHub often shows avatars at 20 to 40px) but stays inside the circle
// GitHub crops it to.
const avatar = logo({ background: "square", grid: true, scale: 1.05 });
await sharp(Buffer.from(avatar)).resize(1024, 1024).png().toFile(path.join(outDir, "github-avatar.png"));

// Social preview: the hero headline on the left, the orbit mark on the right.
const browser = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
]
  .filter(Boolean)
  .find((candidate) => existsSync(candidate));
if (!browser) {
  console.error("No Chrome or Edge binary found. Set CHROME_PATH and retry.");
  process.exit(1);
}

const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600&family=Instrument+Serif:ital@1&display=block">
<style>
  html, body { margin: 0; width: 1280px; height: 640px; overflow: hidden; }
  body { position: relative; background: ${BLUE}; color: #fff; font-family: Inter, "Segoe UI", Arial, sans-serif; }
  .grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgb(255 255 255 / 0.13) 1px, transparent 1px),
      linear-gradient(90deg, rgb(255 255 255 / 0.13) 1px, transparent 1px);
    background-size: 64px 64px;
    -webkit-mask-image: linear-gradient(to bottom, #000 55%, transparent);
  }
  .text { position: absolute; left: 88px; top: 0; bottom: 0; width: 680px; display: flex; flex-direction: column; justify-content: center; }
  .eyebrow { font-size: 19px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; opacity: 0.8; }
  h1 { margin: 20px 0 0; font-size: 104px; font-weight: 600; line-height: 0.92; letter-spacing: -0.045em; }
  h1 em { font-family: "Instrument Serif", Georgia, serif; font-weight: 400; letter-spacing: 0; }
  .role { margin-top: 30px; font-size: 25px; line-height: 1.4; opacity: 0.92; }
  .role b { white-space: nowrap; font-weight: 600; text-decoration: underline; text-decoration-color: ${ORANGE}; text-decoration-thickness: 3px; text-underline-offset: 6px; }
  .url { margin-top: 34px; display: flex; align-items: center; gap: 10px; font-size: 21px; font-weight: 600; }
  .url::before { content: ""; width: 10px; height: 10px; border-radius: 50%; background: ${ORANGE}; }
  .mark { position: absolute; right: 36px; top: 50%; width: 500px; height: 500px; transform: translateY(-50%); }
  .mark svg { width: 100%; height: 100%; }
</style>
</head>
<body>
  <div class="grid"></div>
  <div class="text">
    <div class="eyebrow">Raouf Rezouali — Algeria</div>
    <h1>I keep<br>systems<br><em>running.</em></h1>
    <div class="role">Junior Systems &amp; Network Administrator at <b>Hope Technology</b></div>
    <div class="url">raoufrezouali.com</div>
  </div>
  <div class="mark">${logo({ background: "none" })}</div>
</body>
</html>`;

// A throwaway profile keeps the headless run separate from any open browser.
const work = mkdtempSync(path.join(tmpdir(), "brand-chrome-"));
const page = path.join(work, "social.html");
const shot = path.join(work, "social.png");
writeFileSync(page, html);
try {
  execFileSync(
    browser,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--hide-scrollbars",
      "--force-device-scale-factor=1",
      "--window-size=1280,640",
      "--virtual-time-budget=6000", // lets the web fonts load first
      `--user-data-dir=${path.join(work, "profile")}`,
      `--screenshot=${shot}`,
      pathToFileURL(page).href,
    ],
    { stdio: "ignore" },
  );
  // Crop to exactly 1280x640 in case the window adds a few pixels.
  await sharp(shot)
    .extract({ left: 0, top: 0, width: 1280, height: 640 })
    .png()
    .toFile(path.join(outDir, "github-social-preview.png"));
} finally {
  rmSync(work, { recursive: true, force: true });
}

console.log("GitHub images written to brand/.");
