"use client";

import dynamic from "next/dynamic";
import type { DesignSlug } from "./designs";

// three.js scenes load only in the browser.
const OrbitVersions = dynamic(() => import("./OrbitVersions"), { ssr: false });

const COMPONENTS = {
  "orbit-stipple": () => <OrbitVersions version="stipple" />,
  "orbit-kept": () => <OrbitVersions version="kept" />,
  "orbit-flare": () => <OrbitVersions version="flare" />,
  "orbit-rings": () => <OrbitVersions version="rings" />,
  orbit: dynamic(() => import("./OrbitParticles"), { ssr: false }),
  flow: dynamic(() => import("./FlowParticles"), { ssr: false }),
  pulse: dynamic(() => import("./PulseParticles"), { ssr: false }),
  "glass-knot": dynamic(() => import("./GlassKnot"), { ssr: false }),
  "fluted-glass": dynamic(() => import("./FlutedGlass"), { ssr: false }),
  "glass-lens": dynamic(() => import("./GlassLens"), { ssr: false }),
} satisfies Record<DesignSlug, unknown>;

export default function LabDesign({ slug }: { slug: DesignSlug }) {
  const Design = COMPONENTS[slug];
  return <Design />;
}
