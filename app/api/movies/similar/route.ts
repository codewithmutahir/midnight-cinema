import { NextRequest, NextResponse } from "next/server";
import { fetchSimilarMovies } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  const movieIdParam = request.nextUrl.searchParams.get("movieId");
  const movieId = movieIdParam ? parseInt(movieIdParam, 10) : NaN;
  if (Number.isNaN(movieId)) {
    return NextResponse.json({ error: "movieId required" }, { status: 400 });
  }
  try {
    const res = await fetchSimilarMovies(movieId);
    return NextResponse.json({ movies: res.results.slice(0, 12) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch similar movies" }, { status: 500 });
  }
}
