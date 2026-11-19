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

// The hero's RJ45 cable lives in PageCable.tsx: it runs down the whole page.

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

/**
 * One pen stroke under a phrase: a gentle curve that dips, rises and flicks
 * up at the end. Drawn about 1:1 (viewBox 300 x 10), so give it roughly
 * that shape, e.g. full width and 0.6em high under 16px text.
 */
export function CurvedUnderline({ className, delay = 0 }: Props) {
  return (
    <svg
      viewBox="0 0 300 10"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={cn("pointer-events-none overflow-visible text-highlight", className)}
    >
      <path
        {...strokeProps}
        strokeWidth={3}
        className="motion-safe:animate-draw"
        style={drawStyle(delay)}
        d="M2 6 C 60 9, 150 9.5, 228 5.5 C 258 4, 284 3, 298 0.5"
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
