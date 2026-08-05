import type { SpotReport } from "@/lib/data";
import { VerdictBadge } from "./VerdictBadge";
import { MpaBadge } from "./MpaBadge";
import { TideStrip } from "./TideStrip";

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-baseline gap-1 rounded-md bg-gray-100 px-2 py-1 text-xs dark:bg-gray-800">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className="font-semibold text-gray-900 dark:text-gray-100">{value}</span>
    </span>
  );
}

export function SpotCard({ report }: { report: SpotReport }) {
  const { spot, verdict, conditions, tides, advisoryRow, advisoryStatus } = report;
  const prohibited = spot.mpa.kind === "prohibited";

  return (
    <article
      className={`rounded-xl border bg-white p-4 shadow-sm dark:bg-gray-900 ${
        prohibited
          ? "border-gray-200 opacity-70 dark:border-gray-700"
          : "border-gray-200 dark:border-gray-700"
      }`}
    >
      <header className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-bold">{spot.name}</h3>
        <VerdictBadge verdict={verdict.verdict} prohibited={prohibited} />
      </header>

      <div className="mt-3 flex flex-wrap gap-2">
        {conditions.waveHeightFt != null && (
          <Chip
            label="Waves"
            value={`${conditions.waveHeightFt.toFixed(1)} ft${
              conditions.wavePeriodS != null ? ` @ ${Math.round(conditions.wavePeriodS)}s` : ""
            }`}
          />
        )}
        {conditions.windMph != null && <Chip label="Wind" value={`${Math.round(conditions.windMph)} mph`} />}
        {conditions.seaSurfaceTempF != null && (
          <Chip label="Water" value={`${Math.round(conditions.seaSurfaceTempF)}°F`} />
        )}
      </div>

      <div className="mt-3">
        <TideStrip tides={tides} />
      </div>

      {advisoryRow && (
        <div
          className={`mt-3 rounded-md border px-3 py-2 text-xs ${
            advisoryStatus === "closure"
              ? "border-red-300 bg-red-50 text-red-900 dark:border-red-700 dark:bg-red-950 dark:text-red-200"
              : "border-orange-300 bg-orange-50 text-orange-900 dark:border-orange-700 dark:bg-orange-950 dark:text-orange-200"
          }`}
        >
          <span className="font-semibold">
            {advisoryStatus === "closure" ? "Closure" : "Advisory"} — {advisoryRow.site}:
          </span>{" "}
          {advisoryRow.description}
        </div>
      )}

      <MpaBadge mpa={spot.mpa} />

      <ul className="mt-3 list-disc space-y-0.5 pl-5 text-xs text-gray-600 dark:text-gray-400">
        {verdict.reasons.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>

      <p className="mt-3 border-t border-gray-100 pt-2 text-xs italic text-gray-500 dark:border-gray-800 dark:text-gray-500">
        {spot.entryNotes}
      </p>
    </article>
  );
}
