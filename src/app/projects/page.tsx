import ProjectList from "@/components/ProjectList";
import RevealText from "@/components/RevealText";
import projectsData from "@/data/projects.json";
import { projectSchema } from "@/lib/schemas";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Projects by Raouf Rezouali, from a multithreaded HTTP server in C to web apps.",
};

export default function ProjectPage() {
  const projects = projectSchema.parse(projectsData).projects;

  return (
    <article className="flex flex-col gap-14 py-16 sm:py-24">
      <RevealText
        as="h1"
        trigger="load"
        text="All projects."
        accent={["projects."]}
        className="display text-[clamp(3rem,8vw,6rem)]"
      />
      <ProjectList projects={projects} />
    </article>
  );
}
