import { socialSchema } from "@/lib/schemas";
import { ArrowUp } from "lucide-react";
import Link from "next/link";

import socialsData from "@/data/socials.json";

// Short commit hash on Vercel deployments, "local" everywhere else.
const REVISION = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local";

export default function Footer() {
  const socials = socialSchema.parse(socialsData).socials;

  return (
    <footer className="w-full border-t">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-10">
        <p>
          &copy; {new Date().getFullYear()} Raouf Rezouali
          <span className="ml-3 text-xs opacity-70">rev {REVISION}</span>
        </p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {socials.map((social) => (
            <li key={social.name}>
              <Link
                href={social.href}
                target={social.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="ulink"
              >
                {social.name}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/privacy" className="ulink">
              Privacy
            </Link>
          </li>
        </ul>
        <a href="#" className="ulink flex items-center gap-1">
          Back to top
          <ArrowUp aria-hidden="true" className="size-3.5" />
        </a>
      </div>
    </footer>
  );
}
