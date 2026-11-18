import careerData from "@/data/career.json";
import homeContent from "@/data/home.json";
import socialsData from "@/data/socials.json";

export const SITE_URL = "https://raoufrezouali.com";
export const SITE_NAME = "Raouf Rezouali";

const { position, company } = homeContent.introduction.currentRole;

export const SITE_TAGLINE = `${position} at ${company}`;
export const SITE_DESCRIPTION = `${SITE_TAGLINE}. Linux, networking, and server administration.`;

// schema.org Person markup so search engines can show name, role and profiles.
export function personJsonLd() {
  const employer = careerData.career.find((job) => job.name === company);

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE_NAME,
    url: SITE_URL,
    jobTitle: position,
    worksFor: {
      "@type": "Organization",
      name: company,
      ...(employer?.href ? { url: employer.href } : {}),
    },
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "University of Bouira",
    },
    address: { "@type": "PostalAddress", addressCountry: "DZ" },
    sameAs: socialsData.socials
      .filter((social) => social.href.startsWith("https://"))
      .map((social) => social.href),
  };
}
