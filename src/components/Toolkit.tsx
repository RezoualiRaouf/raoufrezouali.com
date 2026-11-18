import { cn } from "@/lib/utils";

type Group = { name: string; items: string[] };

// A colour dot per group, in the order of skills.json.
const DOTS = ["bg-brand", "bg-highlight", "bg-foreground/30", "bg-[#0b2545]"];

/** "Docker (familiar)" -> ["Docker", "familiar"]; other brackets stay in the label. */
function splitNote(item: string): [string, string | null] {
  const match = item.match(/^(.*?)\s*\((familiar|studying)\)$/i);
  return match ? [match[1], match[2].toLowerCase()] : [item, null];
}

// One row per group: the group name on the left, its tools on the right.
export default function Toolkit({ groups }: { groups: Group[] }) {
  return (
    <dl className="border-b">
      {groups.map((group, i) => (
        <div
          key={group.name}
          className="grid gap-x-10 gap-y-3 border-t py-6 first:border-t-0 sm:grid-cols-[15rem_1fr] sm:items-baseline"
        >
          <dt className="flex items-center gap-3 text-lg font-semibold tracking-tight">
            <span aria-hidden="true" className={cn("size-2.5 shrink-0 rounded-full", DOTS[i % DOTS.length])} />
            {group.name}
          </dt>
          <dd>
            <ul className="flex flex-wrap gap-2">
              {group.items.map((item) => {
                const [label, note] = splitNote(item);
                return (
                  <li key={item} className="rounded-full border px-3 py-1 text-sm text-foreground/85">
                    {label}
                    {note && <span className="ml-1.5 text-muted-foreground">· {note}</span>}
                  </li>
                );
              })}
            </ul>
          </dd>
        </div>
      ))}
    </dl>
  );
}
