"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

type Props = {
  text: string;
  /** Words (exact match, punctuation included) drawn in the italic accent serif. */
  accent?: string[];
  as?: "h1" | "h2" | "p" | "span";
  className?: string;
  /** "load" animates straight away; "view" waits until scrolled into view. */
  trigger?: "load" | "view";
  delay?: number;
  stagger?: number;
};

/**
 * Each word slides up from behind a mask, one after another.
 * Without JavaScript, or with reduced motion, the text is simply shown.
 */
export default function RevealText({
  text,
  accent = [],
  as = "h2",
  className,
  trigger = "view",
  delay = 0,
  stagger = 70,
}: Props) {
  // Typed to fit every allowed tag (h1, h2, p, span).
  const ref = useRef<HTMLHeadingElement & HTMLParagraphElement & HTMLSpanElement>(null);
  // "static" = plain text (server render, reduced motion, or already on screen
  // for view triggers); "armed" = hidden, waiting; "play" = animating in.
  const [state, setState] = useState<"static" | "armed" | "play">(
    trigger === "load" ? "play" : "static",
  );

  useEffect(() => {
    if (trigger === "load") return;
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;
    setState("armed");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setState("play");
        observer.disconnect();
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [trigger]);

  const words = text.split(" ");
  const Tag = as;

  // Words stay real text (no aria-hidden) so screen readers and search
  // engines read the sentence normally.
  return (
    <Tag ref={ref} className={className}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="-mb-[0.12em] inline-block overflow-hidden pb-[0.12em] align-bottom"
        >
          <span
            className={cn(
              "inline-block",
              accent.includes(word) && "accent-word",
              state === "armed" && "translate-y-[105%]",
              state === "play" && "motion-safe:animate-rise",
            )}
            style={state === "play" ? { animationDelay: `${delay + i * stagger}ms` } : undefined}
          >
            {word}
          </span>
          {i < words.length - 1 && " "}
        </span>
      ))}
    </Tag>
  );
}
