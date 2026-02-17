import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { content } = (await request.json()) as { content?: string };
    const text = (content ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 15000);
    if (!text || text.length < 200) {
      return NextResponse.json(
        { error: "content required (at least ~200 characters for a useful TL;DR)" },
        { status: 400 }
      );
    }

    const prompt = `Summarize the following blog post in 2-4 short sentences. Write in a clear, neutral tone. Output only the summary, no labels or prefix like "TL;DR".

Post:
${text}`;

    const tldr = await generateText(prompt);
    return NextResponse.json({ tldr: tldr.trim() });
  } catch (e) {
    console.error("ai-tldr:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to generate TL;DR" },
      { status: 500 }
    );
  }
}
