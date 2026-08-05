import { describe, it, expect } from "vitest";
import { matchAdvisory } from "@/lib/match";
import { SPOTS } from "@/lib/spots";
import type { AdvisoryRow } from "@/lib/advisories";

const rows: AdvisoryRow[] = [
  {
    region: "Encinitas",
    site: "Moonlight Beach (Cottonwood Creek Outlet)",
    status: "advisory",
    description: "Advisory: Bacteria levels exceed health standards.",
  },
  {
    region: "South Bay",
    site: "Imperial Beach (Tijuana River Mouth)",
    status: "closure",
    description: "Closure: Sewage contamination.",
  },
  {
    region: "La Jolla",
    site: "Children's Pool",
    status: "advisory",
    description: "Advisory: Bacteria levels exceed health standards.",
  },
];

function spot(slug: string) {
  const s = SPOTS.find((s) => s.slug === slug);
  if (!s) throw new Error(`no spot ${slug}`);
  return s;
}

describe("matchAdvisory", () => {
  it("matches Imperial Beach to its parenthesized site name", () => {
    const m = matchAdvisory(spot("imperial-beach"), rows);
    expect(m?.status).toBe("closure");
  });

  it("matches Swami's spot to Moonlight Beach advisory", () => {
    const m = matchAdvisory(spot("swamis"), rows);
    expect(m?.site).toMatch(/Moonlight/);
  });

  it("matches La Jolla Cove to Children's Pool", () => {
    const m = matchAdvisory(spot("la-jolla-cove"), rows);
    expect(m?.site).toBe("Children's Pool");
  });

  it("prefers a closure over an advisory when a spot matches multiple rows", () => {
    const both: AdvisoryRow[] = [
      { region: "Imperial Beach", site: "Carnation Avenue", status: "advisory", description: "Advisory" },
      { region: "Imperial Beach", site: "Shoreline south of Carnation", status: "closure", description: "Closed" },
    ];
    expect(matchAdvisory(spot("imperial-beach"), both)?.status).toBe("closure");
  });

  it("does not cross-match unrelated spots", () => {
    expect(matchAdvisory(spot("point-loma"), rows)).toBeNull();
    expect(matchAdvisory(spot("oceanside"), rows)).toBeNull();
  });
});
