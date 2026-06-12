import homeData from "@/data/home.json";
import careerDataRaw from "@/data/career.json";
import educationDataRaw from "@/data/education.json";
import projectsData from "@/data/projects.json";
import socialsData from "@/data/socials.json";
import { careerSchema, educationSchema } from "@/lib/schemas";

const careerData = careerSchema.parse(careerDataRaw);
const educationData = educationSchema.parse(educationDataRaw);

export function buildSystemPrompt(): string {
  const { introduction, escalationLink } = homeData;

  const career = careerData.career
    .map((job) => {
      return job.positions
        .map((pos) => {
          const period = pos.end
            ? `${pos.start} – ${pos.end}`
            : `${pos.start} – Present`;
          const desc = pos.description?.join(" ") ?? "";
          return `  - ${pos.title} @ ${job.name} (${period}): ${desc}`;
        })
        .join("\n");
    })
    .join("\n");

  const education = educationData.education
    .map((edu) => {
      return edu.positions
        .map((pos) => {
          const period = pos.end
            ? `${pos.start} – ${pos.end}`
            : `${pos.start} – Present`;
          const desc = pos.description?.join(" ") ?? "";
          return `  - ${pos.title} @ ${edu.name} (${period}): ${desc}`;
        })
        .join("\n");
    })
    .join("\n");

  const projects = projectsData.projects
    .map((p) => {
      const links = p.links
        .map((l) => `${l.name}: ${l.href}`)
        .join(", ");
      return `  - ${p.name}: ${p.description} [${p.tags.join(", ")}]${links ? ` — ${links}` : ""}`;
    })
    .join("\n");

  const socials = socialsData.socials
    .map((s) => `  - ${s.name}: ${s.href}`)
    .join("\n");

  return `
You are an AI assistant on Raouf Rezouali's personal portfolio website.
Help visitors learn about Raouf and decide if he's a good fit for opportunities.

## About
${introduction.description}

## Current Role
${introduction.currentRole.position} at ${introduction.currentRole.company}

## Career
${career}

## Education
${education}

## Projects
${projects}

## Contact & Socials
${socials}
  Email: ${escalationLink.href}

## Rules
- Be casual and friendly, not corporate.
- Keep answers concise. No robotic bullet dumps unless it genuinely helps.
- Answer questions about Raouf's skills, projects, experience, education, and work availability.
- Answer general technical questions about networking, Linux, and programming — this shows Raouf's domain knowledge.
- Do NOT share or speculate about personal info not listed above (age, exact location, family, relationships).
- Do NOT invent information. If you don't know something, say so honestly.
- If someone is evaluating Raouf for a job or project, give an honest assessment based on the role they describe.
`.trim();
}