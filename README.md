# Should I Spearfish in San Diego? 🌊🐟

A daily go / caution / no-go call for San Diego spearfishing spots, combining:

- **Tides** — [NOAA Tides & Currents](https://tidesandcurrents.noaa.gov/) predictions (San Diego Bay `9410170` & Scripps Pier `9410230`), drawn as an interactive daily curve with high/low markers, slack-tide windows (±2h of each high/low), sunrise/sunset, and a live "now" marker
- **Ocean & weather** — [Open-Meteo](https://open-meteo.com/) swell height/period, wind, air and water temperature
- **Water quality** — beach advisories and closures relayed by [San Diego Coastkeeper](https://www.sdcoastkeeper.org/beach-advisories/) from County of San Diego DEHQ (baked to `public/advisories.json` at build time, refreshed by a scheduled GitHub Action)
- **Spots, seasons & limits** — 12 curated spots with Marine Protected Area legality, local speargun ordinances, expected species by month, and 2026 bag/size limits (see `outputs/san-diego-spearfishing-spots-and-regulations-2026.md`)

**Live site:** https://joelakaufmann-lgtm.github.io/spearfish-sd/

## How the verdict works

Per spot, in order: prohibited MPA → permanent no-go · advisory/closure → no-go ·
waves (<3 ft ok, 3–5 caution, >5 no-go) · swell period (short-period wind swell → caution) ·
wind (<8 mph ok, 8–15 caution, >15 no-go) · tide state (informational). If advisory data
is unavailable, verdicts cap at caution — never a silent "go".

## Development

```bash
npm install
npm run dev        # fetches a fresh advisories snapshot, then starts Next.js
npm test           # vitest: verdict thresholds, advisory parser (fixture), matching, seasons
npm run build      # static export to out/ (set NEXT_PUBLIC_BASE_PATH for project pages)
```

Built with Next.js (static export) + TypeScript + Tailwind. Deployed to GitHub Pages by
`.github/workflows/deploy.yml`, which also rebuilds every 6 hours to refresh advisories.

## Disclaimers

The verdict is a heuristic — assess conditions on site. MPA boundaries and fishing
regulations change: verify the [live CDFW regulations](https://wildlife.ca.gov/Fishing/Ocean/Regulations/Fishing-Map/Southern)
and [interactive MPA map](https://wildlife.ca.gov/OceanSportfishMap) before every dive,
and carry a valid California fishing license. Never enter water under a sewage closure.
