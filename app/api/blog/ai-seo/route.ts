import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { title?: string; content?: string; excerpt?: string };
    const title = body.title ?? "";
    const content = body.content ?? "";
    const excerpt = body.excerpt ?? "";
    const text = [title, excerpt, content.replace(/<[^>]+>/g, " ").slice(0, 3000)].filter(Boolean).join("\n\n");
    if (!text.trim()) {
      return NextResponse.json({ error: "title or content required" }, { status: 400 });
    }

    const prompt = `You are an SEO expert. Based on the following blog post text, suggest meta title, meta description, and 3-5 focus keywords.

Return a JSON object only, no other text, with these exact keys:
- "meta_title": string (under 60 chars, compelling for search)
- "meta_description": string (under 160 chars, summarizes the post)
- "keywords": string[] (3-5 focus keywords or phrases)

Blog text:
${text.slice(0, 4000)}`;

    const raw = await generateText(prompt);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : raw;
    const parsed = JSON.parse(jsonStr) as {
      meta_title?: string;
      meta_description?: string;
      keywords?: string[];
    };

    return NextResponse.json({
      meta_title: parsed.meta_title ?? "",
      meta_description: parsed.meta_description ?? "",
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
    });
  } catch (e) {
    console.error("ai-seo:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to generate SEO" },
      { status: 500 }
    );
  }
}
