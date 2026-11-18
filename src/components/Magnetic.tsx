"use client";

import { cn } from "@/lib/utils";
import { useRef } from "react";

// Pulls its child gently toward the cursor while hovered, then springs back.
export default function Magnetic({
  children,
  strength = 0.35,
  className,
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  const move = (e: React.PointerEvent<HTMLSpanElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    el.style.transition = "transform 0.15s ease-out";
    el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
  };

  const leave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = "transform 0.6s cubic-bezier(0.2, 1.4, 0.4, 1)";
    el.style.transform = "translate(0, 0)";
  };

  return (
    <span
      ref={ref}
      onPointerMove={move}
      onPointerLeave={leave}
      className={cn("inline-block motion-reduce:!transform-none", className)}
    >
      {children}
    </span>
  );
}
