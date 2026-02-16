import { NextRequest, NextResponse } from "next/server";

const BASE = "https://api.themoviedb.org/3";

export async function GET(request: NextRequest) {
  const key = process.env.TMDB_API_KEY ?? process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "API key not set" }, { status: 500 });
  }
  const ids = request.nextUrl.searchParams.get("ids");
  if (!ids) {
    return NextResponse.json({ error: "ids required" }, { status: 400 });
  }
  const idList = ids.split(",").map((s) => parseInt(s.trim(), 10)).filter(Boolean);
  if (idList.length === 0 || idList.length > 10) {
    return NextResponse.json({ error: "Provide 1–10 movie ids" }, { status: 400 });
  }
  const results = await Promise.all(
    idList.map((id) =>
      fetch(`${BASE}/movie/${id}?api_key=${key}`).then((r) => (r.ok ? r.json() : null))
    )
  );
  const movies = results.filter(Boolean);
  return NextResponse.json({ movies });
}
