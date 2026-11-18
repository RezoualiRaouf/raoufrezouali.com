"use client";

import { useInView, useReducedMotion, useWebGL } from "@/lib/hooks";
import dynamic from "next/dynamic";
import { useRef } from "react";

// Flat stand-in: shown while three.js loads and when WebGL is unavailable.
function FlatCube() {
  return (
    <div className="flex size-full items-center justify-center">
      <div className="grid size-[58%] rotate-12 grid-cols-3 gap-1.5 rounded-2xl bg-[#0b2545] p-1.5 shadow-2xl">
        {["#f3f5f9", "#0b2545", "#ff5a1f", "#0a84e8", "#f3f5f9", "#0b2545", "#f3f5f9", "#ff5a1f", "#0b2545"].map((color, i) => (
          <div key={i} className="rounded-md" style={{ background: color }} />
        ))}
      </div>
    </div>
  );
}

const Cube = dynamic(() => import("./Cube"), { ssr: false, loading: () => <FlatCube /> });

export default function HeroCube({ className }: { className?: string }) {
  const wrapper = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapper);
  const webgl = useWebGL();
  const reducedMotion = useReducedMotion();
  const rim = "#ffffff";

  return (
    <div
      ref={wrapper}
      className={className}
      role="img"
      aria-label="A dark 3D puzzle cube whose layers twist. Drag to turn it, tap to twist a layer."
    >
      {webgl === false && <FlatCube />}
      {webgl && <Cube reducedMotion={reducedMotion} active={inView} rim={rim} />}
    </div>
  );
}
