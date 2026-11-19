import ExperienceList from "@/components/ExperienceList";
import HeroOrbit from "@/components/HeroOrbit";
import Magnetic from "@/components/Magnetic";
import Posts from "@/components/Posts";
import PostsSkeleton from "@/components/PostsSkeleton";
import ProjectList from "@/components/ProjectList";
import Reveal from "@/components/Reveal";
import RevealText from "@/components/RevealText";
import PageCable from "@/components/PageCable";
import { CurvedUnderline, Underline } from "@/components/Scribbles";
import SkillsMarquee from "@/components/SkillsMarquee";
import SwipeCards from "@/components/SwipeCards";
import Toolkit from "@/components/Toolkit";
import { getPosts } from "@/lib/posts";
import {
  careerSchema,
  educationSchema,
  projectSchema,
  skillsSchema,
  socialSchema,
} from "@/lib/schemas";
import { SITE_NAME, personJsonLd } from "@/lib/site";
import { ArrowUpRight, Github, Linkedin, Mail, MapPin } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import careerData from "@/data/career.json";
import educationData from "@/data/education.json";
import homeContent from "@/data/home.json";
import projectsData from "@/data/projects.json";
import skillsData from "@/data/skills.json";
import socialsData from "@/data/socials.json";

// Icons for the hero's social links (the "icon" names in socials.json).
const SOCIAL_ICONS = { linkedin: Linkedin, github: Github, mail: Mail };

// Re-render daily so tenure figures stay current.
export const revalidate = 86400;

const LIMIT = 2;
const EMAIL = "contact@raoufrezouali.com";
const [EMAIL_USER, EMAIL_DOMAIN] = EMAIL.split("@");
// How much the skills tape (rotated -2deg) rises across the screen width:
// 100vw x tan(2deg). The hero's bottom edge uses the same slope.
const TAPE_RISE = "3.492vw";
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
  const socials = socialSchema.parse(socialsData).socials;
  const companyHref = career.find((org) => org.name === company)?.href;
  const lines = homeContent.headline.lines;

  return (
    <article className="relative flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd()) }}
      />

      {/* One RJ45 cable from the headline down to the contact block. Its plug
          end follows the scroll. */}
      <PageCable />

      {/* Hero: same layout as the lab previews. Headline on the left, the Orbit
          on the right, and the RJ45 cable leaving the headline. Its bottom
          edge slants up to the right at the skills tape's angle, so the tape
          below always overlaps it by the same amount (no white wedge at the
          tape's low end on wide screens). */}
      <section
        className="full-bleed relative -mt-20 overflow-hidden bg-brand text-white"
        style={{ clipPath: `polygon(0 0, 100% 0, 100% calc(100% - ${TAPE_RISE}), 0 100%)` }}
      >
        <div
          aria-hidden="true"
          className="hero-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black_55%,transparent)]"
        />

        <div className="relative mx-auto grid min-h-[100svh] max-w-5xl items-center gap-4 px-6 pb-20 pt-20 sm:px-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div className="relative z-10 order-2 md:order-1">
            {/* Whose portfolio this is, first: the name in the headline's italic serif. */}
            <p className="text-lg font-medium text-white/85 motion-safe:animate-fade-up sm:text-xl">
              Hi, I&apos;m{" "}
              <span className="font-serif text-[1.75em] font-normal italic leading-none tracking-normal text-white">
                {SITE_NAME}
              </span>
            </p>

            <h1 data-cable="start" className="display relative mt-4 text-[clamp(3.75rem,10.5vw,8.25rem)]">
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
            </h1>

            <p className="mt-6 max-w-sm leading-relaxed text-white/90 motion-safe:animate-fade-up motion-safe:[animation-delay:600ms]">
              {/* The job title gets a hand-drawn orange stroke under it. */}
              <span className="relative inline-block font-semibold text-white">
                {position}
                <CurvedUnderline delay={1300} className="absolute -bottom-[0.3em] left-0 h-[0.6em] w-full" />
              </span>{" "}
              at{" "}
              {companyHref ? (
                <Link
                  href={companyHref}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-white underline-offset-4 hover:underline"
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
              {socials.map((social) => {
                const SocialIcon = SOCIAL_ICONS[social.icon as keyof typeof SOCIAL_ICONS] ?? ArrowUpRight;
                const external = social.href.startsWith("http");
                return (
                  <Magnetic key={social.name} strength={0.2}>
                    <a
                      href={social.href}
                      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="inline-flex items-center gap-1.5 px-3 py-2 font-medium text-white/85 transition-colors hover:text-white"
                    >
                      <SocialIcon aria-hidden="true" className="size-4" />
                      {social.name}
                    </a>
                  </Magnetic>
                );
              })}
              <a
                href="/resume.pdf"
                data-cursor="PDF"
                className="px-3 py-2 font-medium text-white/85 transition-colors hover:text-white"
              >
                Resume ↓
              </a>
              <span className="inline-flex items-center gap-1.5 px-3 py-2 font-medium text-white/70">
                <MapPin aria-hidden="true" className="size-4" />
                Algeria
              </span>
            </div>
          </div>

          {/* On phones the orbit is capped so the headline and buttons fit on the
              first screen. Beside the text it is pushed 3rem right to leave a
              lane for the RJ45 cable, and sits above the cable (z-6 over z-5)
              so a ring that leans into the lane passes in front of it. */}
          <HeroOrbit className="relative order-1 mx-auto aspect-square w-[min(100%,22svh)] md:order-2 md:z-[6] md:ml-12 md:w-[calc(100%-3rem)]" />
        </div>
      </section>

      {/* Tilted tape of skills crossing the bottom of the hero */}
      <section
        aria-label="Skills"
        data-cable="tape"
        className="relative z-10 ml-[calc(50%-55vw)] w-[110vw] -rotate-2 bg-[hsl(228_20%_7%)] py-4 text-white shadow-xl"
        // Overlaps the hero's slanted edge by 1.75rem along its whole length:
        // the edge is half the rise higher at the centre than at the left.
        style={{ marginTop: `calc(-1.75rem - ${TAPE_RISE} / 2)` }}
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
        data-cable="end"
        className="relative mb-16 scroll-mt-24 overflow-hidden rounded-[2rem] bg-brand text-white sm:rounded-[2.5rem]"
      >
        <div aria-hidden="true" className="hero-grid pointer-events-none absolute inset-0" />
        <div className="relative px-7 py-16 sm:px-14 sm:py-20">
          <p className="eyebrow text-white/80">Have a role or a project in mind?</p>
          <h2 className="display mt-6 text-[clamp(3.25rem,9vw,7rem)]">
            <RevealText as="span" text="Let's work" className="block" />
            <span className="relative inline-block font-serif font-normal italic tracking-normal">
              <RevealText as="span" text="together." delay={140} />
              {/* Sized in em so it clears the "g" descender at every font size. */}
              <Underline delay={600} className="absolute -bottom-[0.3em] left-0 h-[0.22em] w-full" />
            </span>
          </h2>
          <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-6">
            {/* On narrow phones the address is wider than the card, so it may
                break after the "@" (the pill then becomes a rounded box). */}
            <Magnetic strength={0.2} className="max-w-full">
              <a
                href={`mailto:${EMAIL}`}
                className={`inline-flex max-w-full items-center gap-2 rounded-[1.75rem] bg-highlight px-5 py-3.5 text-base font-semibold ${ON_ACCENT} transition-colors hover:bg-white hover:text-highlight sm:gap-3 sm:rounded-full sm:px-7 sm:py-4 sm:text-lg`}
              >
                <span className="min-w-0">
                  {EMAIL_USER}@<wbr />
                  {EMAIL_DOMAIN}
                </span>
                <ArrowUpRight aria-hidden="true" className="size-5 shrink-0" />
              </a>
            </Magnetic>
          </div>
        </div>
      </section>
    </article>
  );
}
