import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { parseAdvisories } from "@/lib/advisories";

const fixture = readFileSync(path.join(__dirname, "fixtures/coastkeeper.html"), "utf8");

describe("parseAdvisories", () => {
  it("parses the live fixture into advisory rows", () => {
    const rows = parseAdvisories(fixture);
    expect(rows.length).toBeGreaterThanOrEqual(4);
    const text = rows.map((r) => `${r.region} ${r.site}`.toLowerCase());
    expect(text.some((s) => s.includes("moonlight"))).toBe(true);
    expect(text.some((s) => s.includes("imperial beach"))).toBe(true);
    // The Tijuana Slough shoreline closure must parse as a closure
    expect(rows.some((r) => r.region.includes("Tijuana") && r.status === "closure")).toBe(true);
    for (const row of rows) {
      expect(["closure", "advisory"]).toContain(row.status);
      expect(row.site.length).toBeGreaterThan(0);
    }
  });

  it("does not include the header row", () => {
    const rows = parseAdvisories(fixture);
    expect(rows.every((r) => !/advisories\s*&\s*closures/i.test(r.site))).toBe(true);
  });

  it("returns empty for garbled/unrelated HTML instead of throwing", () => {
    expect(parseAdvisories("<html><body><p>nothing here</p></body></html>")).toEqual([]);
    expect(parseAdvisories("")).toEqual([]);
  });
});
