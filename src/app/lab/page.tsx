import { DESIGNS } from "@/components/lab/designs";
import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Hero options",
  robots: { index: false, follow: false },
};

// Index of the hero visual options. Each opens on its own page.
export default function LabIndex() {
  return (
    <article className="flex flex-col gap-10 py-16 sm:py-24">
      <div>
        <p className="eyebrow">Design lab</p>
        <h1 className="display mt-4 text-[clamp(3rem,8vw,6rem)]">
          Hero <span className="accent-word">options.</span>
        </h1>
      </div>
      <ol className="grid gap-4 sm:grid-cols-2">
        {DESIGNS.map((design, i) => (
          <li key={design.slug}>
            <Link
              href={`/lab/${design.slug}`}
              className="group flex h-full flex-col justify-between gap-6 rounded-3xl border bg-card p-7 transition hover:-translate-y-1 hover:border-brand hover:shadow-xl"
            >
              <div className="flex items-start justify-between">
                <span className="font-serif text-4xl italic text-brand">{String(i + 1).padStart(2, "0")}</span>
                <span className="eyebrow">{design.kind}</span>
              </div>
              <div>
                <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
                  {design.title}
                  <ArrowUpRight aria-hidden="true" className="size-5 transition-transform group-hover:translate-x-1" />
                </h2>
                <p className="mt-2 text-muted-foreground">{design.blurb}</p>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </article>
  );
}
