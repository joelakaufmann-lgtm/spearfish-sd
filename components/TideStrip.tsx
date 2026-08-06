import type { StationTides } from "@/lib/tides";
import { TIDE_STATIONS } from "@/lib/spots";

function fmtTime(local: string, referenceDate: string): string {
  // NOAA lst_ldt format: "YYYY-MM-DD HH:mm" — already America/Los_Angeles
  const [date, time] = local.split(" ");
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const dayPrefix = date === referenceDate ? "" : "+1d ";
  return `${dayPrefix}${h12}:${String(m).padStart(2, "0")}${ampm}`;
}

export function TideStrip({ tides }: { tides: StationTides | null }) {
  if (!tides) {
    return <p className="text-xs text-gray-500">Tide data unavailable</p>;
  }
  const next = tides.state.nextEvent;
  const upcoming = next ? tides.events.filter((e) => e.time >= next.time).slice(0, 3) : [];
  // Events start on the selected day, so its date is the "no prefix" reference
  const referenceDate = tides.events[0]?.time.split(" ")[0] ?? "";
  return (
    <div className="text-sm">
      <span className="text-gray-500 dark:text-gray-400">
        Tide ({TIDE_STATIONS[tides.station]}):{" "}
      </span>
      {tides.state.direction && (
        <span className="font-medium">{tides.state.direction === "rising" ? "↑ rising" : "↓ falling"}</span>
      )}
      {upcoming.map((e) => (
        <span key={e.time} className="ml-2 whitespace-nowrap text-gray-700 dark:text-gray-300">
          {e.type === "H" ? "High" : "Low"} {fmtTime(e.time, referenceDate)} ({e.heightFt.toFixed(1)} ft)
        </span>
      ))}
    </div>
  );
}
