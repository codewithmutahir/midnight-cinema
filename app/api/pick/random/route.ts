import { NextRequest, NextResponse } from "next/server";

const BASE = "https://api.themoviedb.org/3";

type MediaType = "movie" | "tv";

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export async function GET(request: NextRequest) {
  const key = process.env.TMDB_API_KEY ?? process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "API key not set" }, { status: 500 });
  }
  const type = (request.nextUrl.searchParams.get("type") ?? "movie") as MediaType;
  const count = Math.min(12, Math.max(6, parseInt(request.nextUrl.searchParams.get("count") ?? "8", 10) || 8));
  if (type !== "movie" && type !== "tv") {
    return NextResponse.json({ error: "type must be movie or tv" }, { status: 400 });
  }

  try {
    const isMovie = type === "movie";
    const page = Math.floor(Math.random() * 15) + 1;
    const url = isMovie
      ? `${BASE}/movie/popular?api_key=${key}&page=${page}`
      : `${BASE}/tv/popular?api_key=${key}&page=${page}`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    const data = (await res.json()) as {
      results?: Array<{ id: number; title?: string; name?: string; poster_path: string | null }>;
    };
    const results = data.results ?? [];
    const shuffled = shuffle(results);
    const items = shuffled.slice(0, count).map((r) => ({
      id: r.id,
      title: isMovie ? (r.title ?? "Unknown") : (r.name ?? "Unknown"),
      poster_path: r.poster_path,
      type: type as MediaType,
    }));
    return NextResponse.json({ items });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch random titles" }, { status: 500 });
  }
}
