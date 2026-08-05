import type { StationTides } from "@/lib/tides";
import { TIDE_STATIONS } from "@/lib/spots";

function fmtTime(local: string): string {
  // NOAA lst_ldt format: "YYYY-MM-DD HH:mm" — already America/Los_Angeles
  const [date, time] = local.split(" ");
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "America/Los_Angeles" });
  const dayPrefix = date === today ? "" : "tmrw ";
  return `${dayPrefix}${h12}:${String(m).padStart(2, "0")}${ampm}`;
}

export function TideStrip({ tides }: { tides: StationTides | null }) {
  if (!tides) {
    return <p className="text-xs text-gray-500">Tide data unavailable</p>;
  }
  const next = tides.state.nextEvent;
  const upcoming = next ? tides.events.filter((e) => e.time >= next.time).slice(0, 3) : [];
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
          {e.type === "H" ? "High" : "Low"} {fmtTime(e.time)} ({e.heightFt.toFixed(1)} ft)
        </span>
      ))}
    </div>
  );
}
