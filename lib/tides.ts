import type { TideStation } from "./spots";
import type { TideState } from "./verdict";

export interface TideEvent {
  time: string; // "YYYY-MM-DD HH:mm" local (lst_ldt)
  type: "H" | "L";
  heightFt: number;
}

export interface StationTides {
  station: TideStation;
  events: TideEvent[];
  state: TideState;
}

interface NoaaPrediction {
  t: string;
  v: string;
  type: "H" | "L";
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

export function deriveTideState(events: TideEvent[], nowLocal: string): TideState {
  const next = events.find((e) => e.time > nowLocal) ?? null;
  if (!next) return { direction: null, nextEvent: null };
  return {
    // Water is heading toward the next event: next high → rising, next low → falling
    direction: next.type === "H" ? "rising" : "falling",
    nextEvent: { type: next.type, time: next.time, heightFt: next.heightFt },
  };
}

export async function fetchTides(station: TideStation): Promise<StationTides | null> {
  const url =
    "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter" +
    "?product=predictions&interval=hilo&datum=MLLW&units=english" +
    `&time_zone=lst_ldt&format=json&station=${station}&date=today&range=48`;
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = (await res.json()) as { predictions?: NoaaPrediction[] };
    if (!data.predictions?.length) return null;
    const events: TideEvent[] = data.predictions.map((p) => ({
      time: p.t,
      type: p.type,
      heightFt: parseFloat(p.v),
    }));
    return { station, events, state: deriveTideState(events, nowLocalString()) };
  } catch {
    return null;
  }
}
