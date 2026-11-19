import { ArrowLeft } from "lucide-react";
import Link from "next/link";

// Same heading style as the other pages: big sans words, the last one in the
// italic accent serif.
export default function NotFound() {
  return (
    <article className="flex flex-col gap-8 py-16 sm:py-24">
      <p className="eyebrow">Error 404</p>
      <h1 className="display text-[clamp(3rem,8vw,6rem)]">
        Page not <span className="accent-word">found.</span>
      </h1>
      <p className="max-w-md text-lg text-muted-foreground">
        This page doesn&apos;t exist or was moved. Let&apos;s get you back.
      </p>
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full bg-highlight px-5 py-2.5 font-medium text-white transition-colors hover:bg-foreground"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to home
        </Link>
      </div>
    </article>
  );
}