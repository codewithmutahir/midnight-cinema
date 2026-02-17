import { NextRequest, NextResponse } from "next/server";
import { embedText } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { title?: string; excerpt?: string; text?: string };
    const text =
      body.text ?? [body.title, body.excerpt].filter(Boolean).join(" ") ?? "";
    if (!text.trim()) {
      return NextResponse.json({ error: "text or title+excerpt required" }, { status: 400 });
    }

    const combined = (body.title && body.excerpt ? `${body.title} ${body.excerpt}` : text).slice(0, 8000);
    const embedding = await embedText(combined);
    return NextResponse.json({ embedding });
  } catch (e) {
    console.error("ai-embedding:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to generate embedding" },
      { status: 500 }
    );
  }
}
