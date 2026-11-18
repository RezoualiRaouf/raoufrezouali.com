"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

// Slides content up into place the first time it scrolls into view. Content
// already on screen at load, and everything without JavaScript, stays visible.
export default function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"static" | "hidden" | "shown">("static");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
    setState("hidden");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setState("shown");
        observer.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={state === "shown" ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn(
        state === "hidden" && "translate-y-8 opacity-0",
        state === "shown" && "translate-y-0 opacity-100 transition-all duration-700 ease-out",
        className,
      )}
    >
      {children}
    </div>
  );
}
