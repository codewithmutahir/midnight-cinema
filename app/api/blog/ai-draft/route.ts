import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { topic } = (await request.json()) as { topic?: string };
    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return NextResponse.json({ error: "topic is required" }, { status: 400 });
    }

    const prompt = `You are a blog post writer. Given the topic below, generate a draft blog post.

Return a JSON object only, no other text, with these exact keys:
- "title": string (catchy blog title)
- "excerpt": string (2-3 sentences for the post excerpt)
- "content": string (HTML content: use <p>, <h2>, <h3>, <ul>, <ol>, <li>, <strong>, <em>. Write 3-5 short paragraphs or bullet points. No <script> or style.)

Topic: ${topic.trim()}`;

    const raw = await generateText(prompt);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : raw;
    const parsed = JSON.parse(jsonStr) as { title?: string; excerpt?: string; content?: string };

    return NextResponse.json({
      title: parsed.title ?? "",
      excerpt: parsed.excerpt ?? "",
      content: parsed.content ?? "",
    });
  } catch (e) {
    console.error("ai-draft:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to generate draft" },
      { status: 500 }
    );
  }
}
