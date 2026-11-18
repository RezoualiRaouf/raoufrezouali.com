import { cn } from "@/lib/utils";

// Big italic words drifting sideways; rows alternate direction.
//
// Each row is one track holding two identical copies, and the whole track
// slides by half its width (one copy), so the loop joins without a jump.
// Each copy repeats the words three times, so it is wider than ultrawide
// screens and no gap shows. Hovering pauses the whole track. With reduced
// motion the words simply wrap.
const REPEAT = 3;

export default function SkillsMarquee({ rows }: { rows: string[][] }) {
  return (
    <div className="flex flex-col gap-2 overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      {rows.map((words, row) => {
        const run = Array.from({ length: REPEAT }, () => words).flat();
        return (
          <div
            key={row}
            role="list"
            aria-label={words.join(", ")}
            className={cn(
              "flex w-max motion-safe:animate-marquee hover:[animation-play-state:paused] motion-reduce:w-full",
              row % 2 === 1 && "[animation-direction:reverse]",
            )}
            style={{ "--marquee-duration": `${105 + row * 24}s` } as React.CSSProperties}
          >
            {[0, 1].map((copy) => (
              <div
                key={copy}
                // Only the first set of words is read out; the rest are repeats.
                aria-hidden={copy === 1 ? true : undefined}
                className={cn(
                  "flex shrink-0 items-center motion-reduce:flex-wrap",
                  copy === 1 && "motion-reduce:hidden",
                )}
              >
                {run.map((word, i) => {
                  const spoken = copy === 0 && i < words.length;
                  return (
                    <span
                      key={`${word}-${i}`}
                      role={spoken ? "listitem" : undefined}
                      aria-hidden={copy === 0 && !spoken ? true : undefined}
                      className={cn(
                        "flex items-center whitespace-nowrap px-4 font-serif text-3xl italic text-current transition-colors hover:text-highlight sm:text-5xl",
                        copy === 0 && !spoken && "motion-reduce:hidden",
                      )}
                    >
                      {word}
                      <span aria-hidden="true" className="ml-8 text-2xl text-highlight sm:text-3xl">
                        ✳
                      </span>
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
