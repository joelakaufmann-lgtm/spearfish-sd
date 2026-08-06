import { describe, it, expect } from "vitest";
import { fishForSpot, seasonNotes, SPECIES } from "@/lib/fish";
import { SPOTS } from "@/lib/spots";

describe("fishForSpot", () => {
  const swamis = SPOTS.find((s) => s.slug === "swamis")!;
  const pointLoma = SPOTS.find((s) => s.slug === "point-loma")!;

  it("Swami's lists only pelagic species", () => {
    const fish = fishForSpot(swamis.targets, 8);
    const names = fish.map((f) => f.species.key);
    expect(names).toContain("white-seabass");
    expect(names).toContain("yellowtail");
    expect(names).not.toContain("kelp-bass");
    expect(names).not.toContain("ca-halibut");
  });

  it("yellowtail is likely in August but not in January", () => {
    const aug = fishForSpot(pointLoma.targets, 8).find((f) => f.species.key === "yellowtail");
    const jan = fishForSpot(pointLoma.targets, 1).find((f) => f.species.key === "yellowtail");
    expect(aug?.likelyNow).toBe(true);
    expect(jan?.likelyNow).toBe(false);
  });

  it("likely-now species sort first", () => {
    const jan = fishForSpot(pointLoma.targets, 1);
    const firstOffSeason = jan.findIndex((f) => !f.likelyNow);
    expect(jan.slice(0, firstOffSeason).every((f) => f.likelyNow)).toBe(true);
  });

  it("prohibited spots (no targets) return empty", () => {
    expect(fishForSpot(undefined, 8)).toEqual([]);
  });

  it("every spot target key exists in SPECIES", () => {
    for (const spot of SPOTS) {
      for (const key of spot.targets ?? []) {
        expect(SPECIES[key], `${spot.slug} → ${key}`).toBeDefined();
      }
    }
  });
});

describe("seasonNotes", () => {
  it("white seabass reduced limit inside Mar 15–Jun 15", () => {
    expect(seasonNotes(4, 1).join(" ")).toMatch(/limit of 1/);
    expect(seasonNotes(8, 5).join(" ")).toMatch(/3-fish limit/);
    expect(seasonNotes(3, 14).join(" ")).toMatch(/3-fish limit/);
    expect(seasonNotes(6, 15).join(" ")).toMatch(/limit of 1/);
  });

  it("lobster window wraps the year boundary", () => {
    expect(seasonNotes(11, 1).join(" ")).toMatch(/Lobster season OPEN/);
    expect(seasonNotes(2, 1).join(" ")).toMatch(/Lobster season OPEN/);
    expect(seasonNotes(8, 5).join(" ")).toMatch(/Lobster season closed/);
    expect(seasonNotes(3, 18).join(" ")).toMatch(/Lobster season closed/);
  });

  it("pacific halibut open Apr–Dec", () => {
    expect(seasonNotes(8, 5).join(" ")).toMatch(/halibut season open/);
    expect(seasonNotes(2, 1).join(" ")).toMatch(/halibut season closed/);
  });
});
