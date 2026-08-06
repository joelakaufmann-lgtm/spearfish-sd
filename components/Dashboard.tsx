"use client";

import { useEffect, useState } from "react";
import { getDashboardData, type DashboardData } from "@/lib/data";
import { OverallHeadline } from "@/components/OverallHeadline";
import { SpotCard } from "@/components/SpotCard";
import { TideChart } from "@/components/TideChart";
import { DaySelector } from "@/components/DaySelector";
import { COUNTY_FALLBACK_URL } from "@/lib/advisories";
import { TIDE_STATIONS } from "@/lib/spots";
import { laDateString, longLabel } from "@/lib/dates";

function fmtSunTime(iso: string): string {
  const [h, m] = iso.split("T")[1].split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

export function Dashboard() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // Resolve "today" on the client so the static shell never bakes a date
    setSelectedDate(laDateString(0));
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    let cancelled = false;
    setError(null);
    getDashboardData(selectedDate)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "failed to load");
      });
    return () => {
      cancelled = true;
    };
  }, [selectedDate, attempt]);

  if (error) {
    return (
      <div className="py-24 text-center">
        <p className="text-lg font-semibold">Couldn&rsquo;t load ocean data.</p>
        <p className="mt-2 text-sm text-gray-500">{error}</p>
        <button
          className="mt-4 rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white"
          onClick={() => setAttempt((a) => a + 1)}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-24 text-center">
        <p className="text-sm uppercase tracking-widest text-gray-500 dark:text-gray-400">
          Should I spearfish in San Diego?
        </p>
        <p className="mt-4 animate-pulse text-lg text-gray-500 dark:text-gray-400">
          Checking tides, swell, and advisories&hellip;
        </p>
      </div>
    );
  }

  return (
    <>
      <OverallHeadline
        {...data.headline}
        generatedAt={data.generatedAt}
        dayLabel={data.isToday ? null : longLabel(data.selectedDate)}
      />

      <div className="mb-6 flex justify-center">
        <DaySelector selected={data.selectedDate} onSelect={setSelectedDate} />
      </div>

      {!data.isToday && (
        <p className="mb-6 text-center text-xs text-gray-500 dark:text-gray-400">
          Forecast conditions shown for ~9 AM. Water-quality advisories are today&rsquo;s status —
          recheck them on the day.
        </p>
      )}

      {!data.advisories.ok && (
        <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
          <strong>Beach advisory data is currently unavailable</strong> ({data.advisories.error}).
          Verdicts are capped at &ldquo;caution&rdquo; — check the{" "}
          <a href={COUNTY_FALLBACK_URL} className="underline" target="_blank" rel="noopener">
            County of San Diego beach status page
          </a>{" "}
          before getting in the water.
        </div>
      )}

      <section className="mb-8">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-xl font-bold">
            {data.isToday ? "Today's Tides" : `Tides — ${longLabel(data.selectedDate)}`}
          </h2>
          {data.sun && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ☀ Sunrise <span className="font-semibold">{fmtSunTime(data.sun.sunrise)}</span>
              <span className="mx-2">·</span>☾ Sunset{" "}
              <span className="font-semibold">{fmtSunTime(data.sun.sunset)}</span>
            </p>
          )}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {data.stationTides.map((st) => (
            <TideChart
              key={st.station}
              title={TIDE_STATIONS[st.station]}
              curve={st.curve}
              events={st.todayEvents}
              sun={data.sun}
              showNow={data.isToday}
            />
          ))}
        </div>
      </section>

      <h2 className="mb-2 text-xl font-bold">Spots</h2>
      {data.seasonNotes.length > 0 && (
        <div className="mb-4 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-xs text-sky-900 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-200">
          <span className="font-semibold">This time of year: </span>
          {data.seasonNotes.join(" ")}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {data.reports.map((r) => (
          <SpotCard key={r.spot.slug} report={r} />
        ))}
      </div>
    </>
  );
}
