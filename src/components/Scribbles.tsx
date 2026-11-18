import { cn } from "@/lib/utils";

// Hand-drawn strokes in the palette's highlight colour. Each path "draws
// itself" once (pathLength=1 lets the dash animation work for any length).

type Props = { className?: string; delay?: number };

const strokeProps = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  pathLength: 1,
  strokeDasharray: 1,
};

function drawStyle(delay = 0) {
  return { animationDelay: `${delay}ms` };
}

/**
 * An RJ45 cable that wraps around the hero headline: it leaves the end of
 * "keep", sweeps round the right side of "systems" and plugs back into the
 * end of "running.". It is placed over the h1 at its top-left corner and
 * drawn in em units (1 unit = 0.01em), so it follows the headline at any
 * font size. The points were measured from the headline's own words.
 */
export function HeadlineCable({ className, delay = 0 }: Props) {
  return (
    <svg
      viewBox="0 0 440 290"
      aria-hidden="true"
      className={cn("pointer-events-none overflow-visible text-highlight", className)}
    >
      <path
        {...strokeProps}
        strokeWidth={6.5}
        className="motion-safe:animate-draw"
        style={drawStyle(delay)}
        d="M 273 55 C 360 55, 410 75, 410 147 C 410 220, 395 238, 379 238"
      />
      {/* A plain plug (side view), mirrored so it points back at "running.". */}
      <g transform="translate(379 238) scale(-1 1)">
        <g className="motion-safe:animate-plug-in" style={drawStyle(delay + 900)}>
          <path d="M0 -5 L10 -8 L10 8 L0 5 Z" fill="currentColor" />
          <rect x={10} y={-10} width={26} height={20} rx={2.5} fill="#fff" />
          <path d="M33 -10 L18 -15.5 L16 -14 L28 -10 Z" fill="#fff" />
        </g>
      </g>
    </svg>
  );
}

export function Underline({ className, delay = 0 }: Props) {
  return (
    <svg viewBox="0 0 300 40" preserveAspectRatio="none" aria-hidden="true" className={cn("text-highlight", className)}>
      <path
        {...strokeProps}
        strokeWidth={7}
        className="motion-safe:animate-draw"
        style={drawStyle(delay)}
        d="M6 26 C 70 10, 180 6, 294 16 C 220 20, 120 26, 40 34"
      />
    </svg>
  );
}

export function Sparkle({ className, delay = 0 }: Props) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={cn("text-highlight", className)}>
      {["M50 8 L 52 92", "M10 52 L 90 46", "M20 18 L 82 84", "M82 16 L 20 86"].map((d, i) => (
        <path
          key={d}
          {...strokeProps}
          strokeWidth={9}
          className="motion-safe:animate-draw"
          style={drawStyle(delay + i * 120)}
          d={d}
        />
      ))}
    </svg>
  );
}
