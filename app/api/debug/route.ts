import { NextResponse, type NextRequest } from "next/server";
import { getDashboardData } from "@/lib/data";

export async function GET(req: NextRequest) {
  const data = await getDashboardData(req.nextUrl.searchParams.get("date") ?? undefined);
  return NextResponse.json(data);
}
