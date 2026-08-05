import type { Spot } from "./spots";
import type { AdvisoryRow } from "./advisories";

/**
 * Match a spot to advisory rows by case-insensitive substring in either
 * direction (spot term ⊆ site name, or site name ⊆ spot term).
 */
export function matchAdvisory(spot: Spot, rows: AdvisoryRow[]): AdvisoryRow | null {
  let best: AdvisoryRow | null = null;
  for (const row of rows) {
    // Beach names can land in either column ("Imperial Beach" is a Region,
    // "Moonlight Beach" is a Site) — match against both.
    const haystack = `${row.region} ${row.site}`.toLowerCase();
    for (const term of spot.advisoryMatchNames) {
      const t = term.toLowerCase();
      if (haystack.includes(t) || t.includes(haystack)) {
        // A closure outranks an advisory when a spot matches multiple rows
        if (row.status === "closure") return row;
        best ??= row;
      }
    }
  }
  return best;
}
