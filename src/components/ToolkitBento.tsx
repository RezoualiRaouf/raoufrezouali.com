import { cn } from "@/lib/utils";
import { Code2, Database, ShieldCheck, Terminal, type LucideIcon } from "lucide-react";

type Group = { name: string; items: string[] };

// One tile per skill group, in the site colours. The layout is a bento grid:
// a wide tile, a tall tile and two small ones on large screens; a stack on phones.
const TILES: { icon: LucideIcon; tile: string; badge: string; pill: string; span: string }[] = [
  {
    icon: Terminal,
    tile: "bg-brand text-white",
    badge: "bg-white/15",
    pill: "bg-white/15 ring-1 ring-white/25",
    span: "lg:col-span-4",
  },
  {
    icon: ShieldCheck,
    tile: "bg-highlight text-white",
    badge: "bg-white/20",
    pill: "bg-white/15 ring-1 ring-white/30",
    span: "lg:col-span-2 lg:row-span-2",
  },
  {
    icon: Database,
    tile: "border bg-card text-foreground",
    badge: "bg-brand/10 text-brand",
    pill: "bg-muted ring-1 ring-border",
    span: "lg:col-span-2",
  },
  {
    icon: Code2,
    tile: "bg-[#0b2545] text-white",
    badge: "bg-white/10",
    pill: "bg-white/10 ring-1 ring-white/20",
    span: "lg:col-span-2",
  },
];

/** "Docker (familiar)" -> ["Docker", "familiar"]; other brackets stay in the label. */
function splitNote(item: string): [string, string | null] {
  const match = item.match(/^(.*?)\s*\((familiar|studying)\)$/i);
  return match ? [match[1], match[2].toLowerCase()] : [item, null];
}

export default function ToolkitBento({ groups }: { groups: Group[] }) {
  return (
    <div className="grid auto-rows-[minmax(15rem,auto)] gap-4 sm:grid-cols-2 lg:grid-cols-6">
      {groups.map((group, i) => {
        const look = TILES[i % TILES.length];
        const Icon = look.icon;
        return (
          <article
            key={group.name}
            className={cn(
              "group relative flex flex-col justify-between overflow-hidden rounded-3xl p-7 shadow-sm transition duration-500 ease-out hover:-translate-y-1 hover:shadow-xl",
              look.tile,
              look.span,
            )}
          >
            {/* Big faded icon in the corner; it turns a little on hover. */}
            <Icon
              aria-hidden="true"
              strokeWidth={1.2}
              className="pointer-events-none absolute -bottom-8 -right-8 size-44 opacity-10 transition-transform duration-700 ease-out group-hover:-rotate-6 group-hover:scale-110"
            />

            <div className="flex items-start justify-between">
              <span className="font-serif text-5xl italic leading-none opacity-80">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className={cn(
                  "grid size-12 place-items-center rounded-full transition-transform duration-500 group-hover:rotate-12",
                  look.badge,
                )}
              >
                <Icon aria-hidden="true" className="size-5" />
              </span>
            </div>

            <div className="relative mt-10">
              <h3 className="text-2xl font-semibold tracking-tight">{group.name}</h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {group.items.map((item) => {
                  const [label, note] = splitNote(item);
                  return (
                    <li key={item} className={cn("rounded-full px-3 py-1.5 text-sm", look.pill)}>
                      {label}
                      {note && <span className="ml-1.5 text-xs opacity-75">· {note}</span>}
                    </li>
                  );
                })}
              </ul>
            </div>
          </article>
        );
      })}
    </div>
  );
}
