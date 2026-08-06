// Build-time scrape of the Coastkeeper advisory table → public/advisories.json.
// Never fails the build: on any error it writes { ok: false } and the app
// renders its degraded state (verdicts capped at caution).
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { scrapeAdvisories } from "../lib/advisories.ts";

const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public");
mkdirSync(outDir, { recursive: true });

const result = await scrapeAdvisories().catch((err) => ({
  ok: false,
  error: err instanceof Error ? err.message : "scrape failed",
}));

writeFileSync(path.join(outDir, "advisories.json"), JSON.stringify(result, null, 2));
console.log(
  result.ok
    ? `advisories.json: ${result.rows.length} advisory rows`
    : `advisories.json: DEGRADED (${result.error})`
);
