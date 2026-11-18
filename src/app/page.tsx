import ExperienceList from "@/components/ExperienceList";
import HeroOrbit from "@/components/HeroOrbit";
import Magnetic from "@/components/Magnetic";
import Posts from "@/components/Posts";
import PostsSkeleton from "@/components/PostsSkeleton";
import ProjectList from "@/components/ProjectList";
import Reveal from "@/components/Reveal";
import RevealText from "@/components/RevealText";
import { HeadlineCable, Underline } from "@/components/Scribbles";
import SkillsMarquee from "@/components/SkillsMarquee";
import SwipeCards from "@/components/SwipeCards";
import Toolkit from "@/components/Toolkit";
import { getPosts } from "@/lib/posts";
import {
  careerSchema,
  educationSchema,
  projectSchema,
  skillsSchema,
} from "@/lib/schemas";
import { personJsonLd } from "@/lib/site";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import careerData from "@/data/career.json";
import educationData from "@/data/education.json";
import homeContent from "@/data/home.json";
import projectsData from "@/data/projects.json";
import skillsData from "@/data/skills.json";

// Re-render daily so tenure figures stay current.
export const revalidate = 86400;

const LIMIT = 2;
const EMAIL = "contact@raoufrezouali.com";
const ON_ACCENT = "text-white";

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 py-16 sm:py-24">
      <div className="mb-10 border-b pb-5 sm:mb-12">
        <RevealText as="h2" text={title} className="display text-5xl sm:text-6xl" />
      </div>
      {children}
    </section>
  );
}

async function RecentPosts() {
  const posts = (await getPosts())
    .filter((post) => !post.draft)
    .slice(0, LIMIT);

  // Hide the whole section until there is at least one published post.
  if (posts.length === 0) return null;

  return (
    <Section id="writing" title="Writing">
      <Posts posts={posts} />
    </Section>
  );
}

export default function Home() {
  const { position, company } = homeContent.introduction.currentRole;
  const career = careerSchema.parse(careerData).career;
  const education = educationSchema.parse(educationData).education;
  const projects = projectSchema.parse(projectsData).projects;
  const { groups, marquee } = skillsSchema.parse(skillsData);
  const companyHref = career.find((org) => org.name === company)?.href;
  const lines = homeContent.headline.lines;

  return (
    <article className="flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd()) }}
      />

      {/* Hero: same layout as the lab previews. Headline on the left, the Orbit
          on the right, and an RJ45 cable wrapped around the headline. */}
      <section className="full-bleed relative -mt-20 overflow-hidden bg-brand text-white">
        <div
          aria-hidden="true"
          className="hero-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black_55%,transparent)]"
        />

        <div className="relative mx-auto grid min-h-[100svh] max-w-6xl items-center gap-4 px-6 pb-20 pt-28 sm:px-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div className="relative z-10 order-2 md:order-1">
            <p className="eyebrow text-white/80 motion-safe:animate-fade-up">Raouf Rezouali — Algeria</p>

            <h1 className="display relative mt-4 text-[clamp(3.75rem,10.5vw,8.25rem)]">
              {lines.map((line, i) =>
                i === lines.length - 1 ? (
                  <span
                    key={line}
                    className="relative inline-block pr-[0.06em] font-serif font-normal italic tracking-normal"
                  >
                    <RevealText as="span" trigger="load" text={line} delay={120 + i * 140} />
                  </span>
                ) : (
                  <RevealText
                    key={line}
                    as="span"
                    trigger="load"
                    text={line}
                    delay={120 + i * 140}
                    className="block"
                  />
                ),
              )}
              <HeadlineCable delay={900} className="absolute left-0 top-0 h-[2.9em] w-[4.4em]" />
            </h1>

            <p className="mt-6 max-w-sm leading-relaxed text-white/90 motion-safe:animate-fade-up motion-safe:[animation-delay:600ms]">
              {position} at{" "}
              {companyHref ? (
                <Link
                  href={companyHref}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold underline decoration-highlight decoration-[3px] underline-offset-4"
                >
                  {company}
                </Link>
              ) : (
                company
              )}
              , {homeContent.introduction.lead}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-2 text-sm motion-safe:animate-fade-up motion-safe:[animation-delay:800ms]">
              <Magnetic strength={0.2}>
                <Link
                  href="#work"
                  className={`inline-flex items-center gap-1.5 rounded-full bg-highlight px-4 py-2 font-medium ${ON_ACCENT} transition-colors hover:bg-white hover:text-highlight`}
                >
                  See my work
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </Link>
              </Magnetic>
              <Magnetic strength={0.2}>
                <Link
                  href="/contact"
                  className="inline-flex items-center rounded-full border border-white/50 px-4 py-2 font-medium transition-colors hover:bg-white hover:text-brand"
                >
                  Get in touch
                </Link>
              </Magnetic>
              <a
                href="/resume.pdf"
                data-cursor="PDF"
                className="rounded-full px-4 py-2 font-medium text-white/80 transition-colors hover:text-white"
              >
                Resume ↓
              </a>
            </div>
          </div>

          <HeroOrbit className="relative order-1 aspect-square w-full md:order-2" />
        </div>
      </section>

      {/* Tilted tape of skills crossing the bottom of the hero */}
      <section
        aria-label="Skills"
        className="relative z-10 -mt-7 ml-[calc(50%-55vw)] w-[110vw] -rotate-2 bg-[hsl(228_20%_7%)] py-4 text-white shadow-xl"
      >
        <SkillsMarquee rows={marquee.slice(0, 1)} />
      </section>

      <Section id="about" title="About">
        <div className="grid gap-14 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
          <div>
            <RevealText
              as="p"
              text={`I'm Raouf, a ${position} at ${company}, and an M.Sc. student in Information Systems at the University of Bouira.`}
              accent={["Raouf,"]}
              stagger={25}
              className="max-w-2xl text-2xl font-medium leading-snug tracking-tight sm:text-3xl"
            />
            <Reveal>
              <dl className="mt-12 grid max-w-2xl gap-x-10 gap-y-6 border-t pt-8 sm:grid-cols-2">
                {[
                  ["Based in", "Algeria"],
                  ["Currently", `${position}, ${company}`],
                  ["Studying", "M.Sc. Information Systems and Software Engineering"],
                ].map(([term, value]) => (
                  <div key={term}>
                    <dt className="eyebrow">{term}</dt>
                    <dd className="mt-1.5 text-foreground/90">{value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
          <Reveal className="flex flex-col items-center gap-4 md:pt-2">
            <SwipeCards />
            <p className="text-sm text-muted-foreground">Swipe the photos →</p>
          </Reveal>
        </div>
      </Section>

      <Section id="experience" title="Experience">
        <Reveal>
          <ExperienceList items={career} />
        </Reveal>
        <Reveal className="mt-16">
          <h3 className="eyebrow border-b pb-4">Education</h3>
          <ExperienceList items={education} />
        </Reveal>
      </Section>

      <Section id="skills" title="Toolkit">
        <Reveal>
          <Toolkit groups={groups} />
        </Reveal>
      </Section>

      <Section id="work" title="Selected work">
        <Reveal>
          <ProjectList projects={projects.slice(0, LIMIT)} />
        </Reveal>
        {projects.length > LIMIT && (
          <Link href="/projects" className="ulink mt-8 inline-flex items-center gap-1 font-medium">
            All projects
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        )}
      </Section>

      <Suspense fallback={<PostsSkeleton rows={LIMIT} />}>
        <RecentPosts />
      </Suspense>

      {/* Contact: the brand colour comes back as a closing block */}
      <section
        id="contact"
        className="relative mb-16 scroll-mt-24 overflow-hidden rounded-[2rem] bg-brand text-white sm:rounded-[2.5rem]"
      >
        <div aria-hidden="true" className="hero-grid pointer-events-none absolute inset-0" />
        <div className="relative px-7 py-16 sm:px-14 sm:py-20">
          <p className="eyebrow text-white/80">Have a role or a project in mind?</p>
          <h2 className="display mt-6 text-[clamp(3.25rem,9vw,7rem)]">
            <RevealText as="span" text="Let's work" className="block" />
            <span className="relative inline-block font-serif font-normal italic tracking-normal">
              <RevealText as="span" text="together." delay={140} />
              <Underline delay={600} className="absolute -bottom-2 left-0 h-6 w-full" />
            </span>
          </h2>
          <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-6">
            <Magnetic strength={0.2}>
              <a
                href={`mailto:${EMAIL}`}
                className={`inline-flex items-center gap-3 rounded-full bg-highlight px-7 py-4 text-base font-semibold ${ON_ACCENT} transition-colors hover:bg-white hover:text-highlight sm:text-lg`}
              >
                {EMAIL}
                <ArrowUpRight aria-hidden="true" className="size-5" />
              </a>
            </Magnetic>
            <Link
              href="/contact"
              className="text-lg font-medium text-white underline decoration-highlight decoration-2 underline-offset-4 transition-colors hover:text-highlight"
            >
              Or use the contact form
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
