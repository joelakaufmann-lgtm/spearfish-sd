import { NextResponse } from "next/server";
import { scrapeAdvisories } from "@/lib/advisories";

// ISR: serve cached, re-scrape Coastkeeper in the background once older than 15 min.
export const revalidate = 900;

export async function GET() {
  const result = await scrapeAdvisories();
  return NextResponse.json(result);
}
