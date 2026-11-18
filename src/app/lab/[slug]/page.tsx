import LabDesign from "@/components/lab/LabDesign";
import { DESIGNS } from "@/components/lab/designs";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return DESIGNS.map((design) => ({ slug: design.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const design = DESIGNS.find((d) => d.slug === slug);
  return {
    title: design ? `Hero option: ${design.title}` : "Hero option",
    robots: { index: false, follow: false },
  };
}

// Preview of one hero visual option, shown the way it would sit in the hero.
export default async function LabDesignPage({ params }: Props) {
  const { slug } = await params;
  const index = DESIGNS.findIndex((d) => d.slug === slug);
  if (index < 0) notFound();
  const design = DESIGNS[index];
  const prev = DESIGNS[(index - 1 + DESIGNS.length) % DESIGNS.length];
  const next = DESIGNS[(index + 1) % DESIGNS.length];

  return (
    <article className="flex flex-col pb-16">
      <section
        className={`full-bleed relative -mt-20 overflow-hidden rounded-b-[2rem] text-white sm:rounded-b-[3rem] ${
          design.tone === "night" ? "bg-[#05070d]" : "bg-brand"
        }`}
      >
        <div
          aria-hidden="true"
          className="hero-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black_55%,transparent)]"
        />
        <div className="relative mx-auto grid min-h-[100svh] max-w-6xl items-center gap-4 px-6 pb-12 pt-28 sm:px-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          <div className="order-2 md:order-1">
            <p className="eyebrow text-white/80">
              Option {index + 1} of {DESIGNS.length} · {design.kind}
            </p>
            <h1 className="display mt-4 text-[clamp(3.25rem,8vw,6.5rem)]">
              I keep
              <br />
              systems
              <br />
              <span className="font-serif font-normal italic tracking-normal">running.</span>
            </h1>
            <p className="mt-6 max-w-sm leading-relaxed text-white/85">
              <strong className="font-semibold text-white">{design.title}.</strong> {design.blurb}
            </p>
            <nav className="mt-8 flex flex-wrap gap-2 text-sm">
              <Link
                href={`/lab/${prev.slug}`}
                className="rounded-full border border-white/50 px-4 py-2 font-medium transition-colors hover:bg-white hover:text-brand"
              >
                ← {prev.title}
              </Link>
              <Link
                href={`/lab/${next.slug}`}
                className="rounded-full bg-highlight px-4 py-2 font-medium text-white transition-colors hover:bg-white hover:text-highlight"
              >
                {next.title} →
              </Link>
              <Link href="/lab" className="rounded-full px-4 py-2 font-medium text-white/80 hover:text-white">
                All options
              </Link>
            </nav>
          </div>
          <div className="relative order-1 aspect-square w-full md:order-2">
            <LabDesign slug={design.slug} />
          </div>
        </div>
      </section>
    </article>
  );
}
