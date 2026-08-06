import { getDashboardData } from "@/lib/data";
import { OverallHeadline } from "@/components/OverallHeadline";
import { SpotCard } from "@/components/SpotCard";
import { TideChart } from "@/components/TideChart";
import { COUNTY_FALLBACK_URL } from "@/lib/advisories";
import { TIDE_STATIONS } from "@/lib/spots";

function fmtSunTime(iso: string): string {
  const [h, m] = iso.split("T")[1].split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

export const revalidate = 900;

export default async function Home() {
  const data = await getDashboardData();

  return (
    <main className="mx-auto max-w-5xl px-4 pb-12">
      <OverallHeadline {...data.headline} generatedAt={data.generatedAt} />

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
          <h2 className="text-xl font-bold">Today&rsquo;s Tides</h2>
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

      <footer className="mt-10 space-y-3 border-t border-gray-200 pt-6 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
        <p>
          <strong>Disclaimers:</strong> The go/no-go verdict is a heuristic based on surf, wind, and
          water quality data — it is not a substitute for assessing conditions on site. Marine
          Protected Area information is provided for convenience only and may be outdated or
          imprecise at boundaries; you are responsible for verifying current{" "}
          <a
            href="https://wildlife.ca.gov/Conservation/Marine/MPAs"
            className="underline"
            target="_blank"
            rel="noopener"
          >
            CDFW regulations
          </a>{" "}
          and having a valid California fishing license before taking any game.
        </p>
        <p>
          Data sources:{" "}
          <a href="https://tidesandcurrents.noaa.gov/" className="underline" target="_blank" rel="noopener">
            NOAA Tides &amp; Currents
          </a>
          {" · "}
          <a href="https://open-meteo.com/" className="underline" target="_blank" rel="noopener">
            Open-Meteo
          </a>
          {" · "}
          <a href="https://www.sdcoastkeeper.org/beach-advisories/" className="underline" target="_blank" rel="noopener">
            San Diego Coastkeeper
          </a>
          {" · "}
          <a
            href="https://www.sandiegocounty.gov/content/sdc/deh/lwqd/beachandbay.html"
            className="underline"
            target="_blank"
            rel="noopener"
          >
            County of San Diego DEHQ
          </a>
        </p>
      </footer>
    </main>
  );
}
