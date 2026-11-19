"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

type Mode = "default" | "link" | "label" | "text" | "hidden";

const LINKS = "a, button, [role='button'], [role='tab'], label, summary, select";
const TEXT_FIELDS = "input:not([type='checkbox']):not([type='radio']):not([type='submit']):not([type='button']), textarea, [contenteditable='true']";
const BRAND_SURFACE = ".bg-brand";

/**
 * The site's cursor, for mouse users only (touch screens keep their own).
 * An amber dot sits exactly on the pointer and a ring follows a little
 * behind. The ring is white with mix-blend-mode "difference", so it shows
 * dark on the white pages. Over the sky-blue sections (anything inside a
 * .bg-brand element) the blend is switched off and it stays plain white,
 * since "difference" would turn it orange there. It changes with what is
 * under it:
 *   - links and buttons: the ring grows into a disc that inverts what it covers
 *   - anything with data-cursor="Label": an amber bubble with that word
 *   - text fields: the normal text cursor comes back
 *   - mouse button held: the ring shrinks a little
 */
export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<Mode>("hidden");
  const [label, setLabel] = useState("");
  const [pressed, setPressed] = useState(false);
  const [onBrand, setOnBrand] = useState(false);
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const bubble = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setEnabled(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    root.classList.add("custom-cursor");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const target = { x: -100, y: -100 };
    const trail = { x: -100, y: -100 };
    let seen = false;
    let frame = 0;

    const modeFor = (el: Element): Mode => {
      setOnBrand(Boolean(el.closest(BRAND_SURFACE)));
      if (el.closest(TEXT_FIELDS)) return "text";
      const labelled = el.closest<HTMLElement>("[data-cursor]");
      if (labelled?.dataset.cursor) {
        setLabel(labelled.dataset.cursor);
        return "label";
      }
      return el.closest(LINKS) ? "link" : "default";
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      target.x = e.clientX;
      target.y = e.clientY;
      if (!seen) {
        // First move: start the ring on the pointer instead of sliding in.
        seen = true;
        trail.x = target.x;
        trail.y = target.y;
        if (e.target instanceof Element) setMode(modeFor(e.target));
      }
      if (dot.current) dot.current.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`;
    };
    const onOver = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.target instanceof Element) setMode(modeFor(e.target));
    };
    // Hide while the pointer is outside the window.
    const onOut = (e: PointerEvent) => {
      if (!e.relatedTarget) setMode("hidden");
    };
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);

    const tick = () => {
      frame = requestAnimationFrame(tick);
      const ease = reduced ? 1 : 0.2;
      trail.x += (target.x - trail.x) * ease;
      trail.y += (target.y - trail.y) * ease;
      const moved = `translate3d(${trail.x}px, ${trail.y}px, 0)`;
      if (ring.current) ring.current.style.transform = moved;
      if (bubble.current) bubble.current.style.transform = moved;
    };
    frame = requestAnimationFrame(tick);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerout", onOut, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      root.classList.remove("custom-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, [enabled]);

  if (!enabled) return null;

  const hidden = mode === "hidden" || mode === "text";
  // Each layer is its own fixed element on purpose. A shared fixed wrapper
  // with a z-index is an isolated stacking context: the ring's "difference"
  // blend then mixes with the empty wrapper instead of the page, so the ring
  // stays plain white (invisible on white pages, and covering button text).
  const layer = "pointer-events-none fixed left-0 top-0 z-[100]";
  return (
    <div aria-hidden="true">
      {/* Ring (and the inverting disc over links). On the blue sections the
          plain ring skips the blend so it stays white; the disc over links
          keeps it, so the link text it covers stays readable. */}
      <div ref={ring} className={cn(layer, !(onBrand && mode !== "link") && "mix-blend-difference")}>
        <div
          className={cn(
            "-translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-white transition-[width,height,background-color,opacity,transform] duration-300 ease-out",
            mode === "link" ? "size-14 bg-white" : "size-9 bg-transparent",
            (hidden || mode === "label") && "opacity-0",
            pressed && "scale-[0.8]",
          )}
        />
      </div>
      {/* Label bubble; it moves with the ring (not blended, so it stays amber). */}
      <div ref={bubble} className={layer}>
        <div
          className={cn(
            "grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-highlight text-xs font-semibold uppercase tracking-[0.12em] text-white shadow-lg transition-[transform,opacity] duration-300 ease-out",
            mode === "label" ? "scale-100 opacity-100" : "scale-50 opacity-0",
            pressed && mode === "label" && "scale-90",
          )}
        >
          {label}
        </div>
      </div>
      {/* Dot, exactly on the pointer. */}
      <div ref={dot} className={layer}>
        <div
          className={cn(
            "size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-highlight transition-[opacity,transform] duration-200",
            (hidden || mode === "link" || mode === "label") && "scale-0 opacity-0",
          )}
        />
      </div>
    </div>
  );
}
