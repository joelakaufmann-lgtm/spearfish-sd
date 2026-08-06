import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for GitHub Pages. All ocean data is fetched client-side
  // (NOAA + Open-Meteo allow CORS); advisories are baked to
  // public/advisories.json at build time by scripts/fetch-advisories.mjs.
  output: "export",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
  images: { unoptimized: true },
};

export default nextConfig;
