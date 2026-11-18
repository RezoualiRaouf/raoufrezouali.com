// Hero visual options. Each one has its own preview page at /lab/<slug>;
// the lab is hidden from search engines. "tone" is the hero background used
// for the preview: the site's sky blue, or a near-black night sky.
export type Tone = "blue" | "night";

export const DESIGNS = [
  {
    slug: "orbit-stipple",
    kind: "Orbit version",
    tone: "blue",
    title: "Stippled orb",
    blurb: "A large orb drawn in grainy dots, denser where the light hits, with two thin rings and a soft flare. Leans toward your cursor.",
  },
  {
    slug: "orbit-kept",
    kind: "Orbit version",
    tone: "night",
    title: "Kept",
    blurb: "A dotted hand holding a glowing orb with a light flare and its own ring, a literal take on \"I keep systems running\". The orb floats above the palm.",
  },
  {
    slug: "orbit-flare",
    kind: "Orbit version",
    tone: "night",
    title: "Flare",
    blurb: "A bright stippled star with long light rays, and thousands of particles spiralling into it like matter falling into a sun.",
  },
  {
    slug: "orbit-rings",
    kind: "Orbit version",
    tone: "blue",
    title: "Orbit+",
    blurb: "The original Orbit rings, now around a stippled glowing core with a light flare instead of the flat white disc.",
  },
  {
    slug: "orbit",
    kind: "Particles",
    tone: "blue",
    title: "Orbit",
    blurb: "Rings of particles spinning at different speeds around a pulsing core, a system that never stops. Leans toward your cursor.",
  },
  {
    slug: "flow",
    kind: "Particles",
    tone: "blue",
    title: "Flow",
    blurb: "Lanes of particles streaming left to right through a wavy current, like lines of data that keep moving. Your cursor parts the stream.",
  },
  {
    slug: "pulse",
    kind: "Particles",
    tone: "blue",
    title: "Pulse",
    blurb: "A heartbeat line made of particles scrolling like an uptime monitor: still running. Peaks glow amber; moving up strengthens the beat.",
  },
  {
    slug: "glass-knot",
    kind: "Refracted glass",
    tone: "blue",
    title: "Glass knot",
    blurb: "A clear glass knot, an endless loop, turning in front of drifting colour that it bends and splits into rainbow edges.",
  },
  {
    slug: "fluted-glass",
    kind: "Refracted glass",
    tone: "blue",
    title: "Fluted glass",
    blurb: "A ribbed glass panel; the colour behind it drifts and every rib bends it into stripes. A dark blob follows your cursor behind the glass.",
  },
  {
    slug: "glass-lens",
    kind: "Refracted glass",
    tone: "blue",
    title: "Glass lens",
    blurb: "A big glass sphere and two small ones drift over a grid of dots, magnifying and warping it like a lens. The big one follows your cursor.",
  },
] as const satisfies readonly { slug: string; kind: string; tone: Tone; title: string; blurb: string }[];

export type DesignSlug = (typeof DESIGNS)[number]["slug"];
