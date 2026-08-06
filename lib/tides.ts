import type { TideStation } from "./spots";
import type { TideState } from "./verdict";

export interface TideEvent {
  time: string; // "YYYY-MM-DD HH:mm" local (lst_ldt)
  type: "H" | "L";
  heightFt: number;
}

export interface TidePoint {
  minutes: number; // minutes since local midnight
  heightFt: number;
}

export interface StationTides {
  station: TideStation;
  events: TideEvent[];
  state: TideState;
  /** Today's 6-minute prediction curve, 00:00–24:00 local */
  curve: TidePoint[];
  /** Today's high/low events only, for chart markers */
  todayEvents: TideEvent[];
}

interface NoaaPrediction {
  t: string;
  v: string;
  type?: "H" | "L";
}

/** Current time as "YYYY-MM-DD HH:mm" in America/Los_Angeles, comparable to NOAA lst_ldt strings. */
function nowLocalString(): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(new Date())
    .replace("T", " ");
}

function toEpochMinutes(local: string): number {
  // "YYYY-MM-DD HH:mm" → comparable minute count (days are close enough for deltas)
  const [date, time] = local.split(" ");
  const [yy, mm, dd] = date.split("-").map(Number);
  const [h, m] = time.split(":").map(Number);
  return ((yy * 372 + mm * 31 + dd) * 24 + h) * 60 + m;
}

export const SLACK_WINDOW_MIN = 120;

export function deriveTideState(events: TideEvent[], nowLocal: string): TideState {
  const next = events.find((e) => e.time > nowLocal) ?? null;
  const nowMin = toEpochMinutes(nowLocal);
  const nearSlack = events.some(
    (e) => Math.abs(toEpochMinutes(e.time) - nowMin) <= SLACK_WINDOW_MIN
  );
  if (!next) return { direction: null, nextEvent: null, nearSlack };
  return {
    // Water is heading toward the next event: next high → rising, next low → falling
    direction: next.type === "H" ? "rising" : "falling",
    nextEvent: { type: next.type, time: next.time, heightFt: next.heightFt },
    nearSlack,
  };
}

const NOAA_BASE =
  "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter" +
  "?product=predictions&datum=MLLW&units=english&time_zone=lst_ldt&format=json";

async function fetchNoaa(query: string): Promise<NoaaPrediction[] | null> {
  try {
    const res = await fetch(`${NOAA_BASE}${query}`);
    if (!res.ok) return null;
    const data = (await res.json()) as { predictions?: NoaaPrediction[] };
    return data.predictions?.length ? data.predictions : null;
  } catch {
    return null;
  }
}

function minutesOfDay(noaaTime: string): number {
  const [h, m] = noaaTime.split(" ")[1].split(":").map(Number);
  return h * 60 + m;
}

export async function fetchTides(station: TideStation, date: string): Promise<StationTides | null> {
  const noaaDate = date.replaceAll("-", ""); // YYYYMMDD
  const [hilo, fine] = await Promise.all([
    fetchNoaa(`&interval=hilo&station=${station}&begin_date=${noaaDate}&range=48`),
    // no interval → 6-minute curve for the selected day
    fetchNoaa(`&station=${station}&begin_date=${noaaDate}&range=24`),
  ]);
  if (!hilo) return null;

  const events: TideEvent[] = hilo.map((p) => ({
    time: p.t,
    type: p.type as "H" | "L",
    heightFt: parseFloat(p.v),
  }));

  const now = nowLocalString();
  const isToday = now.startsWith(date);
  // For a future day, read the tide sequence from that day's midnight; slack
  // reasoning only makes sense relative to the actual current time.
  const state = isToday
    ? deriveTideState(events, now)
    : { ...deriveTideState(events, `${date} 00:00`), nearSlack: false };

  const curve: TidePoint[] = (fine ?? [])
    .filter((p) => p.t.startsWith(date))
    .map((p) => ({ minutes: minutesOfDay(p.t), heightFt: parseFloat(p.v) }));

  return {
    station,
    events,
    state,
    curve,
    todayEvents: events.filter((e) => e.time.startsWith(date)),
  };
}
