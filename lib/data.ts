import { SPOTS, type Spot, type TideStation } from "./spots";
import { fetchTides, type StationTides } from "./tides";
import { fetchAdvisories, type AdvisoriesResult, type AdvisoryRow } from "./advisories";
import { fetchMarine, type MarineConditions } from "./marine";
import { matchAdvisory } from "./match";
import { scoreSpot, overallHeadline, type VerdictResult, type AdvisoryStatus } from "./verdict";

export interface SpotReport {
  spot: Spot;
  verdict: VerdictResult;
  advisoryStatus: AdvisoryStatus;
  advisoryRow: AdvisoryRow | null;
  conditions: MarineConditions;
  tides: StationTides | null;
}

export interface DashboardData {
  headline: ReturnType<typeof overallHeadline>;
  reports: SpotReport[];
  advisories: AdvisoriesResult;
  generatedAt: string;
}

const VERDICT_ORDER = { go: 0, caution: 1, "no-go": 2 } as const;

function sortRank(r: SpotReport): number {
  // Prohibited MPAs sink below ordinary no-gos
  if (r.spot.mpa.kind === "prohibited") return 3;
  return VERDICT_ORDER[r.verdict.verdict];
}

export async function getDashboardData(): Promise<DashboardData> {
  const stations = [...new Set(SPOTS.map((s) => s.tideStation))];

  const [advisories, tidesList, marineList] = await Promise.all([
    fetchAdvisories(),
    Promise.all(stations.map((st) => fetchTides(st))),
    Promise.all(SPOTS.map((s) => fetchMarine(s.lat, s.lon))),
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

    return { spot, verdict, advisoryStatus, advisoryRow, conditions, tides };
  });

  reports.sort((a, b) => sortRank(a) - sortRank(b));

  const headline = overallHeadline(
    reports.map((r) => ({
      verdict: r.verdict.verdict,
      legal: r.spot.mpa.kind !== "prohibited",
    }))
  );

  return { headline, reports, advisories, generatedAt: new Date().toISOString() };
}
