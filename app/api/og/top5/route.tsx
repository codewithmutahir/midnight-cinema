import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const ids = request.nextUrl.searchParams.get("ids")?.split(",").slice(0, 5) ?? [];
  const baseUrl = request.nextUrl.origin;
  let titles: string[] = [];
  if (ids.length > 0) {
    try {
      const res = await fetch(`${baseUrl}/api/movies?ids=${ids.join(",")}`);
      const data = (await res.json()) as { movies?: Array<{ title: string }> };
      titles = (data.movies ?? []).map((m) => m.title);
    } catch {
      titles = ids.map((_, i) => `Movie ${i + 1}`);
    }
  }
  while (titles.length < 5) titles.push(`Pick ${titles.length + 1}`);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          color: "#fafafa",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 28, marginBottom: 24, color: "#ff2e2e", letterSpacing: "0.1em" }}>
          MIDNIGHT CINEMA
        </div>
        <div style={{ fontSize: 42, fontWeight: 700, marginBottom: 32 }}>My Top 5</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 22 }}>
          {titles.slice(0, 5).map((t, i) => (
            <span key={i}>{(i + 1)}. {t.length > 40 ? t.slice(0, 37) + "…" : t}</span>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
