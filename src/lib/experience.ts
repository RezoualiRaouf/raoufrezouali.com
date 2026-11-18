// Helpers for the "Mon YYYY" date strings used in career.json and education.json.

const MONTHS = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

/** Parses "May 2026" or "June 2025" into the first day of that month (UTC). */
export function parseMonth(value?: string): Date | null {
  if (!value) return null;
  const match = value.trim().match(/^([A-Za-z]{3})[A-Za-z]*\.?\s+(\d{4})$/);
  if (!match) return null;
  const month = MONTHS.indexOf(match[1].toLowerCase());
  if (month < 0) return null;
  return new Date(Date.UTC(Number(match[2]), month, 1));
}

/** Whole months from start to end, counting both end months. */
export function monthsBetween(start: Date, end: Date): number {
  return (
    (end.getUTCFullYear() - start.getUTCFullYear()) * 12 +
    (end.getUTCMonth() - start.getUTCMonth()) +
    1
  );
}

export function formatMonths(total: number): string {
  if (total <= 0) return "<1 mo";
  const years = Math.floor(total / 12);
  const months = total % 12;
  if (years === 0) return `${months} mo`;
  return months === 0 ? `${years} yr` : `${years} yr ${months} mo`;
}

/**
 * Tenure between two "Mon YYYY" strings. A missing end means "until now".
 * Returns null when a date is not parseable (for example "TBD").
 */
export function tenure(
  start: string,
  end?: string,
  now: Date = new Date(),
): string | null {
  const from = parseMonth(start);
  const to = end
    ? parseMonth(end)
    : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  if (!from || !to) return null;
  return formatMonths(monthsBetween(from, to));
}

/** Lowercase host-style slug: "University of Bouira" -> "university-of-bouira". */
export function hostSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** "https://www.univ-bouira.dz" -> "univ-bouira.dz" */
export function domainOf(href: string): string {
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return href;
  }
}
