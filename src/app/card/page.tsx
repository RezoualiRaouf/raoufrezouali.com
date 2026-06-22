
import { redirect } from "next/navigation";
import Link from "next/link";
import { Globe, Linkedin, Mail, MapPin } from "lucide-react";
import type { Metadata } from "next";

const WHATSAPP_NUMBER = "213556953564";

export const metadata: Metadata = {
  title: "Raouf Rezouali — Say Hi",
  // Prevent search engines from indexing this QR-only page
  robots: { index: false, follow: false },
};

interface Props {
  searchParams: Promise<{ src?: string }>;
}

export default async function CardPage({ searchParams }: Props) {
  // Only allow access when coming from the QR code
  const { src } = await searchParams;
  if (src !== "qr") {
    redirect("/");
  }

  return (
    <article className="mt-8 flex min-h-[65vh] flex-col items-center justify-start gap-10 pb-16">

      {/* ── Identity ─────────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-4 text-center">
        
        <div className="space-y-1">
          <h1 className="font-serif text-3xl tracking-wide">Raouf Rezouali</h1>
          <p className="text-sm font-medium text-muted-foreground">
            Network Infrastructure Engineer
          </p>

        </div>
      </div>

      {/* ── Link buttons ─────────────────────────────────────────── */}
      <div className="flex w-full max-w-xs flex-col gap-3 sm:max-w-sm">

        {/* WhatsApp */}
        <CardLink
          href={`https://wa.me/${WHATSAPP_NUMBER}`}
          label="WhatsApp"
          description="Send me a message"
          icon={<WhatsAppIcon />}
          colorClass="border-[#25D366] bg-[#25D366] text-white hover:bg-[#1ebe58]"
          external
        />

        {/* LinkedIn */}
        <CardLink
          href="https://linkedin.com/in/raoufrezouali"
          label="LinkedIn"
          description="Connect professionally"
          icon={<Linkedin className="size-5" />}
          colorClass="border-[#0A66C2] bg-[#0A66C2] text-white hover:bg-[#0858a4]"
          external
        />

        {/* Email */}
        <CardLink
          href="mailto:contact@raoufrezouali.com"
          label="Email"
          description="contact@raoufrezouali.com"
          icon={<Mail className="size-5" />}
          colorClass="border-border bg-background text-foreground hover:bg-muted"
          external
        />

        {/* Portfolio */}
        <CardLink
          href="/"
          label="Portfolio"
          description="raoufrezouali.com"
          icon={<Globe className="size-5" />}
          colorClass="border-primary bg-primary text-primary-foreground hover:bg-primary/90"
        />

      </div>

    </article>
  );
}

// ── Reusable link card ────────────────────────────────────────────
function CardLink({
  href,
  label,
  description,
  icon,
  colorClass,
  external = false,
}: {
  href: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  colorClass: string;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={`flex h-16 w-full items-center gap-4 rounded-xl border px-5 shadow-sm transition-all duration-150 hover:scale-[1.02] hover:shadow-md active:scale-[0.98] ${colorClass}`}
    >
      <span className="shrink-0">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold leading-tight">{label}</div>
        <div className="truncate text-xs opacity-75">{description}</div>
      </div>
    </Link>
  );
}

// ── WhatsApp SVG (not available in lucide-react) ──────────────────
function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5 fill-current"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}