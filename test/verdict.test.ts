import { describe, it, expect } from "vitest";
import { scoreSpot, overallHeadline, type VerdictInput } from "@/lib/verdict";

const base: VerdictInput = {
  mpa: { kind: "legal" },
  advisory: "open",
  waveHeightFt: 1.5,
  wavePeriodS: 14,
  windMph: 5,
  tide: { direction: "rising", nextEvent: { type: "H", time: "2026-08-05 14:36", heightFt: 5.2 } },
};

describe("scoreSpot", () => {
  it("returns go for clean conditions", () => {
    const r = scoreSpot(base);
    expect(r.verdict).toBe("go");
    expect(r.reasons.join(" ")).toMatch(/No active water quality advisory/);
  });

  it("prohibited MPA is a permanent no-go regardless of conditions", () => {
    const r = scoreSpot({ ...base, mpa: { kind: "prohibited", note: "SMR" } });
    expect(r.verdict).toBe("no-go");
    expect(r.reasons).toHaveLength(1);
  });

  it("restricted MPA caps at caution", () => {
    expect(scoreSpot({ ...base, mpa: { kind: "restricted", note: "SMCA" } }).verdict).toBe("caution");
  });

  it("advisory and closure are no-go", () => {
    expect(scoreSpot({ ...base, advisory: "advisory" }).verdict).toBe("no-go");
    expect(scoreSpot({ ...base, advisory: "closure" }).verdict).toBe("no-go");
  });

  it("unknown advisory data caps at caution, never go", () => {
    expect(scoreSpot({ ...base, advisory: "unknown" }).verdict).toBe("caution");
  });

  it("wave height thresholds: 2.9 go, 3.0 caution, 5.1 no-go", () => {
    expect(scoreSpot({ ...base, waveHeightFt: 2.9 }).verdict).toBe("go");
    expect(scoreSpot({ ...base, waveHeightFt: 3.0 }).verdict).toBe("caution");
    expect(scoreSpot({ ...base, waveHeightFt: 5.1 }).verdict).toBe("no-go");
  });

  it("null wave data caps at caution", () => {
    expect(scoreSpot({ ...base, waveHeightFt: null }).verdict).toBe("caution");
  });

  it("short-period wind swell at >=2ft is caution", () => {
    expect(scoreSpot({ ...base, waveHeightFt: 2.5, wavePeriodS: 7 }).verdict).toBe("caution");
    // Tiny surf with short period is still fine
    expect(scoreSpot({ ...base, waveHeightFt: 1.0, wavePeriodS: 7 }).verdict).toBe("go");
  });

  it("wind thresholds: 7 go, 8 caution, 15.1 no-go", () => {
    expect(scoreSpot({ ...base, windMph: 7 }).verdict).toBe("go");
    expect(scoreSpot({ ...base, windMph: 8 }).verdict).toBe("caution");
    expect(scoreSpot({ ...base, windMph: 15.1 }).verdict).toBe("no-go");
  });

  it("tide never gates the verdict alone", () => {
    const r = scoreSpot({ ...base, tide: { direction: "falling", nextEvent: null } });
    expect(r.verdict).toBe("go");
    expect(r.reasons.join(" ")).toMatch(/Outgoing tide/);
  });
});

describe("overallHeadline", () => {
  it("any legal go → yes", () => {
    const h = overallHeadline([
      { verdict: "go", legal: true },
      { verdict: "no-go", legal: true },
    ]);
    expect(h.answer).toBe("Yes.");
    expect(h.tone).toBe("go");
  });

  it("only cautions → maybe", () => {
    expect(overallHeadline([{ verdict: "caution", legal: true }]).answer).toBe("Maybe.");
  });

  it("go at an illegal spot does not count", () => {
    const h = overallHeadline([
      { verdict: "go", legal: false },
      { verdict: "no-go", legal: true },
    ]);
    expect(h.answer).toBe("Not today.");
  });
});
