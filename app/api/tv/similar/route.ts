import { NextRequest, NextResponse } from "next/server";
import { fetchSimilarTV } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  const tvIdParam = request.nextUrl.searchParams.get("tvId");
  const tvId = tvIdParam ? parseInt(tvIdParam, 10) : NaN;
  if (Number.isNaN(tvId)) {
    return NextResponse.json({ error: "tvId required" }, { status: 400 });
  }
  try {
    const res = await fetchSimilarTV(tvId);
    return NextResponse.json({ shows: res.results.slice(0, 12) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch similar TV shows" }, { status: 500 });
  }
}
