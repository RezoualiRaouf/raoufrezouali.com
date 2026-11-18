import { cn } from "@/lib/utils";
import { ArrowDown } from "lucide-react";

// Round sticker with text running around the edge; the ring slowly spins.
export default function RotatingBadge({
  href,
  text,
  className,
}: {
  href: string;
  text: string;
  className?: string;
}) {
  const label = `${text} • ${text} • `;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={text}
      className={cn(
        "group relative grid size-32 place-items-center rounded-full bg-highlight text-white shadow-2xl transition-transform duration-300 hover:scale-105 sm:size-36",
        className,
      )}
    >
      <svg viewBox="0 0 120 120" aria-hidden="true" className="absolute inset-0 size-full motion-safe:animate-spin-slow">
        <defs>
          <path id="badge-ring" d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0" />
        </defs>
        <text className="fill-current text-[10.5px] font-semibold uppercase">
          <textPath href="#badge-ring" textLength="280" lengthAdjust="spacing">
            {label}
          </textPath>
        </text>
      </svg>
      <ArrowDown
        aria-hidden="true"
        className="size-8 transition-transform duration-300 group-hover:translate-y-1"
        strokeWidth={2.5}
      />
    </a>
  );
}
