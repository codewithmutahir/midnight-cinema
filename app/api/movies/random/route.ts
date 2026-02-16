import { NextRequest, NextResponse } from "next/server";

const BASE = "https://api.themoviedb.org/3";

export async function GET(request: NextRequest) {
  const key = process.env.TMDB_API_KEY ?? process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "TMDB API key not configured" },
      { status: 500 }
    );
  }
  const genreParam = request.nextUrl.searchParams.get("genre");
  const genreId = genreParam ? parseInt(genreParam, 10) : null;

  try {
    let url: string;
    if (genreId && !Number.isNaN(genreId)) {
      const page = Math.min(20, Math.floor(Math.random() * 15) + 1);
      url = `${BASE}/discover/movie?api_key=${key}&with_genres=${genreId}&sort_by=popularity.desc&page=${page}`;
    } else {
      const page = Math.floor(Math.random() * 20) + 1;
      url = `${BASE}/movie/popular?api_key=${key}&page=${page}`;
    }
    const res = await fetch(url, { next: { revalidate: 300 } });
    const data = (await res.json()) as { results?: Array<{ id: number }> };
    const results = data.results ?? [];
    const shuffled = [...results].sort(() => 0.5 - Math.random());
    const movieIds = shuffled.slice(0, 5).map((m) => m.id);
    return NextResponse.json({ movieIds });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch random movies" },
      { status: 500 }
    );
  }
}
