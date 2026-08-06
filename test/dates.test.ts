import { describe, it, expect } from "vitest";
import { laDateString, selectableDays, resolveSelectedDate, monthDay, MAX_DAYS_AHEAD } from "@/lib/dates";

describe("dates", () => {
  it("offers today plus the next MAX_DAYS_AHEAD days", () => {
    const days = selectableDays();
    expect(days).toHaveLength(MAX_DAYS_AHEAD + 1);
    expect(days[0].label).toBe("Today");
    expect(days[0].date).toBe(laDateString(0));
    expect(new Set(days.map((d) => d.date)).size).toBe(days.length);
  });

  it("resolveSelectedDate accepts in-window dates and rejects everything else", () => {
    const today = laDateString(0);
    const inWindow = laDateString(3);
    expect(resolveSelectedDate(inWindow)).toBe(inWindow);
    expect(resolveSelectedDate(undefined)).toBe(today);
    expect(resolveSelectedDate("2020-01-01")).toBe(today);
    expect(resolveSelectedDate(laDateString(MAX_DAYS_AHEAD + 1))).toBe(today);
    expect(resolveSelectedDate("garbage")).toBe(today);
  });

  it("monthDay parses without timezone shifts", () => {
    expect(monthDay("2026-08-05")).toEqual({ month: 8, day: 5 });
    expect(monthDay("2026-01-31")).toEqual({ month: 1, day: 31 });
  });
});
