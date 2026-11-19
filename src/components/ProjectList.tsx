"use client";

import { useFinePointer, useInView, useReducedMotion } from "@/lib/hooks";
import type { Project } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// Px the floating image keeps from the edges of the screen.
const EDGE = 12;

// Big project rows: name, description, stack and links on the left, and a
// space on the right for the preview (a looping video, or an image). With a
// mouse, hovering a row makes its preview float into that space, follow the
// cursor up and down and play from the start. On touch screens the preview
// simply sits in that space (under the text on phones).
export default function ProjectList({ projects }: { projects: Project[] }) {
  const fine = useFinePointer();
  const reducedMotion = useReducedMotion();
  const list = useRef<HTMLUListElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const [active, setActive] = useState<number | null>(null);
  const showing = useRef(false);
  showing.current = active !== null;

  // Ease the floating image toward its target every frame. While it is
  // hidden it jumps straight to the target, so it fades in where you are
  // instead of flying in from the corner.
  useEffect(() => {
    if (!fine) return;
    const position = { x: 0, y: 0 };
    let frame = 0;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      const ease = reducedMotion || !showing.current ? 1 : 0.14;
      position.x += (target.current.x - position.x) * ease;
      position.y += (target.current.y - position.y) * ease;
      if (preview.current) {
        preview.current.style.transform = `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -50%)`;
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [fine, reducedMotion]);

  const follow = (e: React.PointerEvent) => {
    const slot = list.current?.querySelector<HTMLElement>("[data-image-slot]")?.getBoundingClientRect();
    const card = preview.current?.firstElementChild as HTMLElement | null;
    if (!slot || !card) return;
    const halfW = card.offsetWidth / 2;
    const halfH = card.offsetHeight / 2;
    // Stay inside the space on the right; within it, lean toward the cursor.
    const x = Math.min(Math.max(e.clientX, slot.left + halfW), slot.right - halfW);
    const y = Math.min(Math.max(e.clientY, halfH + EDGE), window.innerHeight - halfH - EDGE);
    target.current = { x, y };
  };

  return (
    <>
      <ul ref={list} className="border-b" onPointerMove={follow} onPointerLeave={() => setActive(null)}>
        {projects.map((project, i) => {
          const primary = project.links.find((l) => l.icon === "globe") ?? project.links[0];
          return (
            <li
              key={project.name}
              onPointerEnter={() => setActive(i)}
              className="group grid gap-6 border-t py-8 first:border-t-0 md:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] md:items-center md:gap-12"
            >
              <div className="max-w-xl">
                <h3 className="text-3xl font-semibold tracking-[-0.03em] transition-transform duration-500 ease-out group-hover:translate-x-2 sm:text-4xl">
                  {primary ? (
                    <Link
                      href={primary.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor="Open"
                      className="transition-colors group-hover:text-brand"
                    >
                      {project.name}
                    </Link>
                  ) : (
                    project.name
                  )}
                </h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">{project.description}</p>
                <p className="mt-3 text-sm text-muted-foreground">{project.tags.join(" · ")}</p>
                <div className="mt-5 flex gap-5 text-sm">
                  {project.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ulink flex items-center gap-1 font-medium"
                    >
                      {link.name}
                      <ArrowUpRight aria-hidden="true" className="size-3.5" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* The space for the preview. With a mouse it stays empty and the
                  floating preview moves into it; otherwise the preview shows
                  here (a video plays while it is on screen). */}
              {(project.image || project.video) && <InlinePreview project={project} enabled={!fine} />}
            </li>
          );
        })}
      </ul>

      {fine &&
        // Rendered on <body>: the list sits inside an animated (transformed)
        // wrapper, which would otherwise pin this "fixed" layer to the wrapper
        // instead of the screen and slide it under later sections.
        createPortal(
          // Outer layer moves; inner layer fades, scales and straightens.
          <div ref={preview} aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-30">
            <div
              className={cn(
                "w-80 overflow-hidden rounded-2xl border bg-card shadow-2xl transition duration-300 ease-out",
                active !== null && (projects[active]?.image || projects[active]?.video)
                  ? "rotate-0 scale-100 opacity-100"
                  : "-rotate-3 scale-75 opacity-0",
              )}
            >
              {projects.map((project, i) => (
                <div key={project.name} className={i === active ? "block" : "hidden"}>
                  <ProjectMedia project={project} playing={i === active} alt="" sizes="320px" />
                </div>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

/** The in-row preview (touch screens): plays its video only while on screen. */
function InlinePreview({ project, enabled }: { project: Project; enabled: boolean }) {
  const slot = useRef<HTMLDivElement>(null);
  const inView = useInView(slot, "0px");
  return (
    <div
      ref={slot}
      data-image-slot
      className="overflow-hidden rounded-2xl border bg-card shadow-sm [@media(hover:hover)_and_(pointer:fine)]:invisible"
    >
      <ProjectMedia
        project={project}
        playing={enabled && inView}
        alt={`${project.name} preview`}
        sizes="(max-width: 768px) 100vw, 320px"
      />
    </div>
  );
}

/**
 * A project's preview: its looping video (muted, restarted each time it
 * starts playing, paused otherwise), or the still image when the project has
 * no video or the visitor prefers reduced motion.
 */
function ProjectMedia({
  project,
  playing,
  alt,
  sizes,
}: {
  project: Project;
  playing: boolean;
  alt: string;
  sizes: string;
}) {
  const reducedMotion = useReducedMotion();
  const video = useRef<HTMLVideoElement>(null);
  const motion = Boolean(project.video) && !reducedMotion;

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    if (playing) {
      el.muted = true;
      el.currentTime = 0;
      el.play().catch(() => {}); // if the browser refuses, the poster stays
    } else {
      el.pause();
    }
  }, [playing, motion]);

  if (motion && project.video) {
    return (
      <video
        ref={video}
        muted
        loop
        playsInline
        preload="metadata"
        poster={project.image}
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : true}
        className="aspect-[16/10] w-full object-cover"
      >
        {project.video.webm && <source src={project.video.webm} type="video/webm" />}
        <source src={project.video.mp4} type="video/mp4" />
      </video>
    );
  }
  if (!project.image) return null;
  return (
    <Image
      src={project.image}
      alt={alt}
      width={640}
      height={400}
      sizes={sizes}
      className={cn("aspect-[16/10] w-full", project.video ? "object-cover" : "object-contain p-6")}
    />
  );
}
