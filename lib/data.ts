import { SPOTS, type Spot, type TideStation } from "./spots";
import { fetchTides, type StationTides } from "./tides";
import { fetchAdvisories, type AdvisoriesResult, type AdvisoryRow } from "./advisories";
import { fetchMarine, type MarineConditions } from "./marine";
import { matchAdvisory } from "./match";
import { scoreSpot, overallHeadline, type VerdictResult, type AdvisoryStatus } from "./verdict";
import { fetchSun, type SunTimes } from "./sun";
import { fishForSpot, seasonNotes, type FishNow } from "./fish";

export interface SpotReport {
  spot: Spot;
  verdict: VerdictResult;
  advisoryStatus: AdvisoryStatus;
  advisoryRow: AdvisoryRow | null;
  conditions: MarineConditions;
  tides: StationTides | null;
  fish: FishNow[];
}

export interface DashboardData {
  headline: ReturnType<typeof overallHeadline>;
  reports: SpotReport[];
  advisories: AdvisoriesResult;
  stationTides: StationTides[];
  sun: SunTimes | null;
  seasonNotes: string[];
  generatedAt: string;
}

function todayLA(): { month: number; day: number } {
  const [, month, day] = new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Los_Angeles" })
    .format(new Date())
    .split("-")
    .map(Number);
  return { month, day };
}

const VERDICT_ORDER = { go: 0, caution: 1, "no-go": 2 } as const;

function sortRank(r: SpotReport): number {
  // Prohibited MPAs sink below ordinary no-gos
  if (r.spot.mpa.kind === "prohibited") return 3;
  return VERDICT_ORDER[r.verdict.verdict];
}

export async function getDashboardData(): Promise<DashboardData> {
  const stations = [...new Set(SPOTS.map((s) => s.tideStation))];

  const [advisories, tidesList, marineList, sun] = await Promise.all([
    fetchAdvisories(),
    Promise.all(stations.map((st) => fetchTides(st))),
    Promise.all(SPOTS.map((s) => fetchMarine(s.lat, s.lon))),
    fetchSun(),
  ]);

  const tidesByStation = new Map<TideStation, StationTides | null>(
    stations.map((st, i) => [st, tidesList[i]])
  );

  const reports: SpotReport[] = SPOTS.map((spot, i) => {
    const conditions = marineList[i];
    const tides = tidesByStation.get(spot.tideStation) ?? null;

    let advisoryStatus: AdvisoryStatus;
    let advisoryRow: AdvisoryRow | null = null;
    if (!advisories.ok) {
      advisoryStatus = "unknown";
    } else {
      advisoryRow = matchAdvisory(spot, advisories.rows);
      advisoryStatus = advisoryRow?.status ?? "open";
    }

    const verdict = scoreSpot({
      mpa: spot.mpa,
      advisory: advisoryStatus,
      waveHeightFt: conditions.waveHeightFt,
      wavePeriodS: conditions.wavePeriodS,
      windMph: conditions.windMph,
      tide: tides?.state ?? null,
    });

    return {
      spot,
      verdict,
      advisoryStatus,
      advisoryRow,
      conditions,
      tides,
      fish: fishForSpot(spot.targets, todayLA().month),
    };
  });

  reports.sort((a, b) => sortRank(a) - sortRank(b));

  const headline = overallHeadline(
    reports.map((r) => ({
      verdict: r.verdict.verdict,
      legal: r.spot.mpa.kind !== "prohibited",
    }))
  );

  const { month, day } = todayLA();
  return {
    headline,
    reports,
    advisories,
    stationTides: tidesList.filter((t): t is StationTides => t != null),
    sun,
    seasonNotes: seasonNotes(month, day),
    generatedAt: new Date().toISOString(),
  };
}
