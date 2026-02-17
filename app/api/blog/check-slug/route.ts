import { NextRequest, NextResponse } from "next/server";
import { isSlugTaken } from "@/lib/blog";

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  const excludeId = request.nextUrl.searchParams.get("excludeId") ?? undefined;
  if (!slug || typeof slug !== "string") {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }
  try {
    const taken = await isSlugTaken(slug, excludeId);
    return NextResponse.json({ taken });
  } catch {
    return NextResponse.json({ error: "Check failed" }, { status: 500 });
  }
}
