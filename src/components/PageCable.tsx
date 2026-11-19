"use client";

import { sfx } from "@/lib/sound";
import { useEffect, useRef, useState } from "react";

/**
 * One RJ45 cable for the whole home page. It leaves the end of "keep" in the
 * hero headline, sweeps round the right side of "systems", slips under the
 * skills tape into the right-hand page margin, runs down the page and plugs
 * into the side of the contact block at the bottom.
 *
 * The plug end follows the scroll: scrolling down pulls the cable further
 * down the page, scrolling up winds it back. With sound on, the plug snaps in
 * with a "link up" beep at the bottom and clicks out when it is pulled back.
 * With reduced motion the whole cable is simply shown, already plugged in.
 *
 * The svg covers its positioned parent. It finds its anchors inside that
 * parent: the headline marked data-cable="start" and the block marked
 * data-cable="end". The headline part is drawn in em units of the h1
 * (1 unit = 0.01em), measured from the headline's own words, so it follows
 * the headline at any font size.
 */

type Geometry = {
  /** The whole cable. */
  d: string;
  /** Only the headline part; its length is where scrolling takes over. */
  headD: string;
  /** Pixels per headline unit. */
  k: number;
};

const CABLE_WIDTH = 4.5; // headline units
const PLUG_SCALE = 0.85; // the plug drawing below is in units, shrunk by this
const PLUG_LENGTH = 36 * PLUG_SCALE; // units, from the boot to the front of the plug
const PLUG_DEPTH = 12 * PLUG_SCALE; // how far the plug sits inside the contact block
const INTRO_DELAY = 900; // ms, lets the headline words rise first
const INTRO_MS = 1100;
const SAMPLE_STEP = 8; // px of cable between height samples
const UNPLUG_SLACK = 24; // px the plug must pull back before it counts as out
const TAPE_SLOPE = Math.tan((2 * Math.PI) / 180); // the skills tape is rotated -2deg

const r = (n: number) => Math.round(n * 10) / 10;
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** Right edge of the text and buttons inside an element (not of its boxes). */
function inkRight(el: HTMLElement): number {
  let right = -Infinity;
  const range = document.createRange();
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!node.textContent?.trim()) continue;
    range.selectNodeContents(node);
    right = Math.max(right, range.getBoundingClientRect().right);
  }
  el.querySelectorAll("a, button").forEach((b) => {
    right = Math.max(right, b.getBoundingClientRect().right);
  });
  return right;
}

function measure(root: HTMLElement): Geometry | null {
  const start = root.querySelector<HTMLElement>('[data-cable="start"]');
  const end = root.querySelector<HTMLElement>('[data-cable="end"]');
  const hero = start?.closest("section");
  const column = start?.parentElement;
  if (!start || !end || !hero || !column) return null;

  const box = root.getBoundingClientRect();
  const h1 = start.getBoundingClientRect();
  const k = parseFloat(getComputedStyle(start).fontSize) / 100;
  const at = (u: number, v: number): [number, number] => [
    h1.left - box.left + u * k,
    h1.top - box.top + v * k,
  ];

  // The page margin right of the content column (a narrow padding on phones).
  const margin = document.documentElement.clientWidth - box.right;
  const gx = box.width + margin / 2;
  const sway = clamp(margin / 2 - 12, 0, 18);

  // From tablet width up the orbit sits beside the text. The cable then drops
  // down a lane halfway between the rightmost text (the headline words, the
  // intro, the buttons) and the orbit, so it never crosses the orbit. On
  // phones the orbit sits above the headline and the cable keeps to the
  // headline's own shape. (The orbit is the hero's role="img" element.)
  const orbit = hero.querySelector<HTMLElement>('[role="img"]')?.getBoundingClientRect();
  const besideText = !!orbit && orbit.left >= column.getBoundingClientRect().right - 1;
  const wrapU = besideText
    ? ((inkRight(column) + orbit.left) / 2 - h1.left) / k
    : 410;

  // Headline part: out of "keep", round the right side of "systems", heading down.
  const [sx, sy] = at(273, 55);
  const [px, py] = at(wrapU, 147);
  const headD = `M ${r(sx)} ${r(sy)} C ${at(273 + (wrapU - 273) * 0.64, 55).map(r).join(" ")}, ${at(wrapU, 75).map(r).join(" ")}, ${r(px)} ${r(py)}`;
  let d = headD;

  // The skills tape's centre line (data-cable="tape"). The tape is rotated
  // -2deg, so the line rises to the right; without a tape, a level line just
  // under the hero.
  const heroBottom = hero.getBoundingClientRect().bottom - box.top;
  const tape = root.querySelector<HTMLElement>('[data-cable="tape"]');
  const tapeBox = tape?.getBoundingClientRect();
  const tapeHalf = tape ? tape.offsetHeight / 2 : 40;
  const tapeAt = (x: number) =>
    tapeBox
      ? tapeBox.top + tapeBox.height / 2 - box.top - (x - (tapeBox.left + tapeBox.width / 2 - box.left)) * TAPE_SLOPE
      : heroBottom + 5;

  // Into the margin. Beside the orbit, the cable drops down its lane, runs
  // along the middle of the skills tape (which sits on top and hides it) and
  // comes out below it in the margin. On phones the text below is full
  // width, so it turns into the margin right after the headline.
  let crossY: number;
  if (besideText) {
    const span = gx - px;
    const midX = px + span / 2;
    const bend = px + span * 0.15;
    const out = gx - span * 0.1;
    crossY = tapeAt(gx) + tapeHalf + 70;
    d += ` C ${r(px)} ${r(tapeAt(px) - 40)}, ${r(bend)} ${r(tapeAt(bend))}, ${r(midX)} ${r(tapeAt(midX))}`;
    d += ` C ${r(out)} ${r(tapeAt(out))}, ${r(gx)} ${r(tapeAt(gx) + 35)}, ${r(gx)} ${r(crossY)}`;
  } else {
    crossY = h1.bottom - box.top + 4;
    const dy = crossY - py;
    d += ` C ${r(px)} ${r(py + dy * 0.55)}, ${r(gx)} ${r(crossY - dy * 0.45)}, ${r(gx)} ${r(crossY)}`;
  }

  // Down the margin with a slight sway, like a cable hanging loose.
  const block = end.getBoundingClientRect();
  const blockTop = block.top - box.top;
  const blockRight = block.right - box.left;
  const ey = blockTop + clamp(block.height * 0.22, 48, 110);
  const hookY = Math.max(crossY, blockTop - 80);
  const turns = Math.max(1, Math.round((hookY - crossY) / 380));
  const seg = (hookY - crossY) / turns;
  let x = gx;
  let y = crossY;
  for (let i = 1; i <= turns; i++) {
    const nx = i === turns ? gx : gx + (i % 2 ? sway : -sway);
    d += ` C ${r(x)} ${r(y + seg / 2)}, ${r(nx)} ${r(y + seg / 2)}, ${r(nx)} ${r(y + seg)}`;
    x = nx;
    y += seg;
  }

  // Hook left into the side of the contact block, the plug pushed in.
  const ex = blockRight + (PLUG_LENGTH - PLUG_DEPTH) * k;
  // (PLUG_LENGTH and PLUG_DEPTH already include PLUG_SCALE.)
  const bend = clamp(margin * 0.6, 14, 70);
  d += ` C ${r(gx)} ${r(hookY + (ey - hookY) * 0.7)}, ${r(ex + bend)} ${r(ey)}, ${r(ex)} ${r(ey)}`;

  return { d, headD, k };
}

export default function PageCable() {
  const svg = useRef<SVGSVGElement>(null);
  const line = useRef<SVGPathElement>(null);
  const head = useRef<SVGPathElement>(null);
  const plug = useRef<SVGGElement>(null);
  const [geo, setGeo] = useState<Geometry | null>(null);

  // Drawn length and intro timing survive re-measuring.
  const drawn = useRef(0);
  const introAt = useRef<number | null>(null);
  const introDone = useRef(false);
  // Whether the plug sits in the contact block (null until the first frame).
  const plugged = useRef<boolean | null>(null);

  // Measure now, and again whenever the page reflows (fonts, images, resize).
  useEffect(() => {
    const root = svg.current?.parentElement;
    if (!root) return;
    introAt.current ??= performance.now() + INTRO_DELAY;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const next = measure(root);
        setGeo((prev) => (prev && next && prev.d === next.d ? prev : next));
      });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(root);
    window.addEventListener("resize", update);
    document.fonts?.ready.then(update);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  // Follow the scroll.
  useEffect(() => {
    const path = line.current;
    const headPath = head.current;
    const plugEl = plug.current;
    if (!geo || !path || !headPath || !plugEl) return;

    const total = path.getTotalLength();
    const start = Math.min(headPath.getTotalLength(), total);

    // Lowest point reached so far, sampled along the cable from the end of
    // the headline part, so a page height can be turned into a length.
    const heights: number[] = [];
    let lowest = -Infinity;
    for (let l = start; ; l += SAMPLE_STEP) {
      lowest = Math.max(lowest, path.getPointAtLength(Math.min(l, total)).y);
      heights.push(lowest);
      if (l >= total) break;
    }
    const top = heights[0];
    const bottom = heights[heights.length - 1];
    const lengthAtHeight = (y: number) => {
      let lo = 0;
      let hi = heights.length - 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (heights[mid] < y) lo = mid + 1;
        else hi = mid;
      }
      return Math.min(total, start + lo * SAMPLE_STEP);
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const goal = () => {
      if (reduced) return total;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? clamp(window.scrollY / max, 0, 1) : 1;
      // The last stretch runs level into the contact block, so heights can't
      // reach it: at the very bottom of the page the plug pushes fully in.
      if (progress > 0.995) return total;
      return lengthAtHeight(top + progress * (bottom - top));
    };

    const draw = (l: number) => {
      const visible = l > 0.5 ? "1" : "0";
      path.style.opacity = visible;
      plugEl.style.opacity = visible;
      path.style.strokeDasharray = `${l} ${total + 1}`;
      const tip = path.getPointAtLength(l);
      const from = path.getPointAtLength(Math.max(0, l - 2));
      const to = l < 2 ? path.getPointAtLength(2) : tip;
      const angle = (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI;
      plugEl.setAttribute(
        "transform",
        `translate(${r(tip.x)} ${r(tip.y)}) rotate(${r(angle)}) scale(${r(geo.k * PLUG_SCALE * 100) / 100})`,
      );
    };

    if (reduced) {
      introDone.current = true;
      drawn.current = total;
      draw(total);
      return;
    }

    drawn.current = Math.min(drawn.current, total);
    let frame = 0;
    const tick = (now: number) => {
      frame = 0;
      const want = goal();
      if (!introDone.current) {
        const t = clamp((now - (introAt.current ?? now)) / INTRO_MS, 0, 1);
        drawn.current = (1 - (1 - t) ** 3) * want;
        if (t >= 1) introDone.current = true;
      } else {
        drawn.current += (want - drawn.current) * 0.18;
        if (Math.abs(want - drawn.current) < 0.5) drawn.current = want;
      }
      draw(drawn.current);
      // Snap and "link up" when the plug goes fully in, a latch click when it
      // comes back out (with some slack, so a jitter at the bottom is quiet).
      const isIn = drawn.current >= total - 0.5;
      if (plugged.current === null) plugged.current = isIn;
      else if (!plugged.current && isIn) {
        plugged.current = true;
        sfx.plugIn();
      } else if (plugged.current && drawn.current < total - UNPLUG_SLACK) {
        plugged.current = false;
        sfx.unplug();
      }
      if (!introDone.current || drawn.current !== want) frame = requestAnimationFrame(tick);
    };
    const kick = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    draw(drawn.current);
    kick();
    window.addEventListener("scroll", kick, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", kick);
    };
  }, [geo]);

  return (
    <svg
      ref={svg}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[5] size-full overflow-visible text-highlight"
    >
      {geo && (
        <>
          <path ref={head} d={geo.headD} fill="none" stroke="none" />
          <path
            ref={line}
            d={geo.d}
            fill="none"
            stroke="currentColor"
            strokeWidth={CABLE_WIDTH * geo.k}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="0 1"
            opacity={0}
          />
          {/* A plain plug (side view) pointing along the cable. The white body
              is outlined so it still shows on the white sections. */}
          <g ref={plug} opacity={0}>
            <path d="M0 -5 L10 -8 L10 8 L0 5 Z" fill="currentColor" />
            <rect x={10} y={-10} width={26} height={20} rx={2.5} fill="#fff" stroke="currentColor" strokeWidth={2} />
            <path
              d="M33 -10 L18 -15.5 L16 -14 L28 -10 Z"
              fill="#fff"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinejoin="round"
            />
          </g>
        </>
      )}
    </svg>
  );
}
