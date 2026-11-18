"use client";

import { cn } from "@/lib/utils";
import { ArrowUpRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import SoundToggle from "./SoundToggle";

export type NavLink = { name: string; href: string; title?: string };

// Floating dark capsule over the page. Links in the middle (the current page
// gets a white pill), sound and a "Let's talk" button on the right. On phones
// the links fold into a menu under the capsule. It tightens a little once
// the page is scrolled.
export default function NavBar({ links }: { links: NavLink[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the phone menu after navigating.
  useEffect(() => setOpen(false), [pathname]);

  const isCurrent = (href: string) => !href.includes("#") && pathname === href;

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-6 sm:pt-4">
      <div className="pointer-events-auto mx-auto max-w-4xl">
        <div
          className={cn(
            "flex items-center justify-between gap-3 rounded-full bg-foreground/90 pl-5 pr-2 text-white shadow-lg shadow-black/10 ring-1 ring-white/10 backdrop-blur-md transition-[padding] duration-300",
            scrolled ? "py-1.5" : "py-2",
          )}
        >
          <Link href="/" className="flex shrink-0 items-center gap-2 text-[0.95rem] font-semibold tracking-tight">
            <span aria-hidden="true" className="size-2 rounded-full bg-highlight" />
            <span>
              Raouf<span className="hidden sm:inline"> Rezouali</span>
            </span>
          </Link>

          <nav aria-label="Main" className="hidden md:block">
            <ul className="flex items-center gap-1 text-sm">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    title={link.title}
                    aria-current={isCurrent(link.href) ? "page" : undefined}
                    className={cn(
                      "rounded-full px-3.5 py-2 font-medium transition-colors",
                      isCurrent(link.href) ? "bg-white text-foreground" : "text-white/75 hover:bg-white/10 hover:text-white",
                    )}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1">
            <SoundToggle />
            <Link
              href="/contact"
              aria-current={pathname === "/contact" ? "page" : undefined}
              className="hidden items-center gap-1 rounded-full bg-highlight px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-highlight sm:inline-flex"
            >
              Let&apos;s talk
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="nav-menu"
              className="flex size-9 items-center justify-center rounded-full transition-colors hover:bg-white/15 md:hidden"
            >
              {open ? <X aria-hidden="true" className="size-4" /> : <Menu aria-hidden="true" className="size-4" />}
              <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            </button>
          </div>
        </div>

        {/* Phone menu */}
        <nav
          id="nav-menu"
          aria-label="Menu"
          className={cn(
            "mt-2 origin-top rounded-3xl bg-foreground/95 p-2 text-white shadow-lg ring-1 ring-white/10 backdrop-blur-md transition duration-200 md:hidden",
            open ? "scale-100 opacity-100" : "pointer-events-none invisible scale-95 opacity-0",
          )}
        >
          <ul className="flex flex-col">
            {[...links, { name: "Let's talk", href: "/contact" }].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={isCurrent(link.href) ? "page" : undefined}
                  className={cn(
                    "flex items-center justify-between rounded-2xl px-4 py-3 text-base font-medium transition-colors",
                    isCurrent(link.href) ? "bg-white text-foreground" : "hover:bg-white/10",
                  )}
                >
                  {link.name}
                  <ArrowUpRight aria-hidden="true" className="size-4 opacity-50" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
