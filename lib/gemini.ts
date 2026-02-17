import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-2.5-flash";

function getClient() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set");
  return new GoogleGenAI({ apiKey: key });
}

/** Generate text from a prompt. */
export async function generateText(prompt: string): Promise<string> {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
  });
  const text = (response as { text?: string }).text;
  if (typeof text !== "string") throw new Error("No text in Gemini response");
  return text.trim();
}

/** Generate embedding for a single text (for related-posts similarity). */
export async function embedText(text: string): Promise<number[]> {
  const ai = getClient();
  const response = await ai.models.embedContent({
    model: "text-embedding-004",
    contents: [text],
  });
  const list = (response as { embeddings?: { values?: number[] }[] }).embeddings;
  const first = list?.[0];
  if (!first?.values?.length) throw new Error("No embedding in Gemini response");
  return first.values;
}
