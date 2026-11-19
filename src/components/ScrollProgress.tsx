"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

// Thin line on the right edge that fills as the page scrolls. Not on the
// home page: there the RJ45 cable (PageCable) already follows the scroll down
// the right margin, and on phones the two lines would sit side by side.
export default function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);
  const hidden = usePathname() === "/";

  useEffect(() => {
    if (hidden) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? window.scrollY / max : 0;
      if (bar.current) bar.current.style.transform = `scaleY(${progress})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [hidden]);

  if (hidden) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed right-0 top-0 z-50 h-full w-[2px]">
      <div ref={bar} className="h-full w-full origin-top scale-y-0 bg-highlight" />
    </div>
  );
}
