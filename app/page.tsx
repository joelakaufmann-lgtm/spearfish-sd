import { getDashboardData } from "@/lib/data";
import { OverallHeadline } from "@/components/OverallHeadline";
import { SpotCard } from "@/components/SpotCard";
import { COUNTY_FALLBACK_URL } from "@/lib/advisories";

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
