import * as cheerio from "cheerio";

export const COASTKEEPER_URL = "https://www.sdcoastkeeper.org/beach-advisories/";
export const COUNTY_FALLBACK_URL = "https://cosdapps.sandiegocounty.gov/sdbeachinfo/";

export interface AdvisoryRow {
  region: string;
  site: string;
  status: "closure" | "advisory";
  description: string;
}

export type AdvisoriesResult =
  | { ok: true; rows: AdvisoryRow[]; fetchedAt: string }
  | { ok: false; error: string };

function classify(text: string): "closure" | "advisory" | null {
  if (/closure|closed/i.test(text)) return "closure";
  if (/advisory/i.test(text)) return "advisory";
  return null;
}

/**
 * Parse the Coastkeeper "Current Advisories & Closures" UAEL table.
 * Cells are `.uael-table__text-inner` spans laid out as (region, site, status)
 * triples after a 3-cell header row.
 */
export function parseAdvisories(html: string): AdvisoryRow[] {
  const $ = cheerio.load(html);
  const cells = $(".uael-table__text-inner")
    .map((_, el) => $(el).text().trim())
    .get();

  const rows: AdvisoryRow[] = [];
  for (let i = 0; i + 2 < cells.length; i += 3) {
    const [region, site, status] = [cells[i], cells[i + 1], cells[i + 2]];
    const kind = classify(status);
    // Skip the header row and anything that doesn't look like a status cell
    if (!kind || /advisories\s*&\s*closures/i.test(status)) continue;
    if (!site) continue;
    rows.push({ region, site, status: kind, description: status });
  }
  return rows;
}

/** Live scrape of the Coastkeeper page — build-time only (browsers are CORS-blocked). */
export async function scrapeAdvisories(): Promise<AdvisoriesResult> {
  try {
    const res = await fetch(COASTKEEPER_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; spearfish-sd/1.0; +https://github.com/joelakaufmann-lgtm/spearfish-sd)",
      },
    });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    const html = await res.text();
    const rows = parseAdvisories(html);
    // A page with zero recognizable cells means the markup changed — treat as failure.
    if (!html.includes("uael-table__text-inner")) {
      return { ok: false, error: "Advisory table not found — page layout may have changed" };
    }
    return { ok: true, rows, fetchedAt: new Date().toISOString() };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "fetch failed" };
  }
}

/**
 * Client-side advisory load. Prefers the live API route (exists on server
 * deploys like Vercel, ≤15 min stale); falls back to the build-time snapshot
 * baked into public/advisories.json (static hosts like GitHub Pages, ≤6 h).
 */
export async function fetchAdvisories(): Promise<AdvisoriesResult> {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  try {
    const live = await fetch(`${base}/api/advisories`);
    if (live.ok) return (await live.json()) as AdvisoriesResult;
  } catch {
    // static host or API down — fall through to the snapshot
  }
  try {
    const res = await fetch(`${base}/advisories.json`);
    if (!res.ok) return { ok: false, error: `advisories snapshot missing (HTTP ${res.status})` };
    return (await res.json()) as AdvisoriesResult;
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "fetch failed" };
  }
}
