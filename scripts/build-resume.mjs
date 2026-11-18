#!/usr/bin/env node
// Renders resume/resume.html to public/resume.pdf with headless Chrome or Edge.
// Usage: npm run resume   (set CHROME_PATH to use a specific browser binary)

import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const input = path.join(root, "resume", "resume.html");
const output = path.join(root, "public", "resume.pdf");

const candidates = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].filter(Boolean);

const browser = candidates.find((candidate) => existsSync(candidate));
if (!browser) {
  console.error("No Chrome or Edge binary found. Set CHROME_PATH and retry.");
  process.exit(1);
}

// A throwaway profile keeps the headless run separate from any open browser.
const profile = mkdtempSync(path.join(tmpdir(), "resume-chrome-"));

try {
  execFileSync(
    browser,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-pdf-header-footer",
      `--user-data-dir=${profile}`,
      `--print-to-pdf=${output}`,
      pathToFileURL(input).href,
    ],
    { stdio: "inherit" },
  );
} finally {
  rmSync(profile, { recursive: true, force: true });
}

console.log(`Resume written to ${path.relative(root, output)}`);
