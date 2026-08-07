import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Two deploy targets from one codebase:
  // - Default (local + Vercel): server build; /api/advisories scrapes live with ISR.
  // - STATIC_EXPORT=1 (GitHub Pages workflow): static export; the workflow removes
  //   app/api and the client falls back to the baked public/advisories.json.
  // Ocean data (NOAA + Open-Meteo) is always fetched client-side — CORS-enabled.
  output: process.env.STATIC_EXPORT ? "export" : undefined,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
  images: { unoptimized: true },
};

export default nextConfig;
