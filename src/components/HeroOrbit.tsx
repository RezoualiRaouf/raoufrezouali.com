"use client";

import dynamic from "next/dynamic";

// The hero visual. Swap the import to another Orbit version from the lab
// (src/components/lab) once one is picked.
const Orbit = dynamic(() => import("./lab/OrbitParticles"), { ssr: false });

export default function HeroOrbit({ className }: { className?: string }) {
  return (
    <div
      className={className}
      role="img"
      aria-label="Rings of particles orbiting a glowing core. It leans toward your cursor."
    >
      <Orbit />
    </div>
  );
}
