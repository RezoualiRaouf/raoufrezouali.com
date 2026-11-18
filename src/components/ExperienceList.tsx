import { tenure } from "@/lib/experience";
import { Experience } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

/** "Junior Admin (Part-time)" -> ["Junior Admin", "Part-time"]. */
function splitTag(title: string): [string, string | null] {
  const match = title.match(/^(.*?)\s*\(([^)]+)\)$/);
  return match ? [match[1], match[2]] : [title, null];
}

// One block per organisation: its name on the left, and its roles on the
// right on a small timeline, newest first. Each role shows the title, the
// dates in plain words and what the work was.
export default function ExperienceList({ items }: { items: Experience[] }) {
  return (
    <ol className="border-b">
      {items.map((org) => (
        <li
          key={org.name}
          className="grid gap-x-10 gap-y-5 border-t py-8 first:border-t-0 sm:grid-cols-[13rem_1fr]"
        >
          <h3 className="text-lg font-semibold tracking-tight">
            {org.href ? (
              <Link
                href={org.href}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-1 transition-colors hover:text-brand"
              >
                {org.name}
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-4 opacity-50 transition-opacity group-hover:opacity-100"
                />
              </Link>
            ) : (
              org.name
            )}
          </h3>

          <ol className="space-y-8">
            {org.positions.map((position, i) => {
              const isCurrent = !position.end;
              const duration = tenure(position.start, position.end);
              const [title, tag] = splitTag(position.title);
              const isLast = i === org.positions.length - 1;
              return (
                <li key={`${position.title}-${position.start}`} className="relative pl-7">
                  {/* Timeline: a dot per role, joined by a thin line. */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute left-0 top-2 size-[0.6875rem] rounded-full ring-4 ring-background",
                      isCurrent ? "bg-brand" : "bg-foreground/25",
                    )}
                  />
                  {!isLast && (
                    <span aria-hidden="true" className="absolute -bottom-8 left-[5px] top-5 w-px bg-border" />
                  )}

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    <h4 className="text-xl font-semibold tracking-tight">{title}</h4>
                    {tag && (
                      <span className="rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground">
                        {tag}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm tabular-nums text-muted-foreground">
                    {position.start} – {position.end ?? "Present"}
                    {duration && <span> · {duration}</span>}
                    {isCurrent && (
                      <span className="ml-2 inline-flex items-center gap-1.5 font-medium text-brand">
                        <span className="size-1.5 rounded-full bg-brand motion-safe:animate-pulse" />
                        Current
                      </span>
                    )}
                  </p>
                  {position.description &&
                    (position.description.length === 1 ? (
                      <p className="mt-3 max-w-2xl leading-relaxed text-foreground/85">
                        {position.description[0]}
                      </p>
                    ) : (
                      <ul className="mt-3 max-w-2xl list-disc space-y-1.5 pl-5 leading-relaxed text-foreground/85 marker:text-foreground/30">
                        {position.description.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    ))}
                </li>
              );
            })}
          </ol>
        </li>
      ))}
    </ol>
  );
}
