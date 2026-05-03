/**
 * D1/SQLite often stores epoch milliseconds, but legacy rows may hold unix **seconds**
 * (then interpreted as ms → 1970-era dates). Normalize to ms for `Date` / formatting.
 */
export function normalizeCreatedAtMs(stored: unknown): number | null {
  if (stored == null) return null;
  if (typeof stored === "string") {
    const parsed = Date.parse(stored);
    return Number.isFinite(parsed) ? parsed : null;
  }
  let n: number;
  if (typeof stored === "bigint") n = Number(stored);
  else if (typeof stored === "number") n = stored;
  else return null;
  if (!Number.isFinite(n) || n <= 0) return null;
  /* Seconds ⊂ (~1e9–1e10); milliseconds since 2001 ⊂ ≥ ~1e12 */
  if (n < 1e12) return Math.round(n * 1000);
  return Math.round(n);
}

/** Boutique dashboard — e.g. "May 2, 4:58 PM" */
export function formatLeadDashboardDate(
  stored: unknown,
  locale = "en-US",
  timeZone?: string
): string {
  const ms = normalizeCreatedAtMs(stored);
  if (ms == null) return "—";
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone,
  }).format(new Date(ms));
}
