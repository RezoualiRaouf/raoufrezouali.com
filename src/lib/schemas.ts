import dynamicIconImports from "lucide-react/dynamicIconImports";
import { z } from "zod";

const iconLink = z.object({
  name: z.string(),
  href: z.url(),
  icon: z.custom<keyof typeof dynamicIconImports>(),
});
export type IconLink = z.infer<typeof iconLink>;

const project = z.object({
  name: z.string(),
  description: z.string(),
  href: z.url().optional(),
  image: z.string().optional(),
  // A short silent looping preview; `image` doubles as its poster frame.
  video: z.object({ mp4: z.string(), webm: z.string().optional() }).optional(),
  tags: z.array(z.string()),
  links: z.array(iconLink),
});
export const projectSchema = z.object({ projects: z.array(project) });
export type Project = z.infer<typeof project>;

const experiencePosition = z.object({
  title: z.string(),
  start: z.string(),
  end: z.string().optional(),
  description: z.array(z.string()).optional(),
  links: z.array(iconLink).optional(),
});
export type ExperiencePosition = z.infer<typeof experiencePosition>;

const experience = z.object({
  name: z.string(),
  href: z.string(),
  logo: z.string(),
  positions: z.array(experiencePosition).min(1),
});
export type Experience = z.infer<typeof experience>;

export const careerSchema = z.object({ career: z.array(experience) });
export const educationSchema = z.object({ education: z.array(experience) });
export const socialSchema = z.object({ socials: z.array(iconLink) });

export const skillsSchema = z.object({
  groups: z.array(z.object({ name: z.string(), items: z.array(z.string()) })),
  marquee: z.array(z.array(z.string())),
});
