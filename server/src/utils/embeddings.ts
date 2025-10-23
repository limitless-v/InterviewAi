import OpenAI from "openai";
import { ENV } from "../config/env.js";

const client = new OpenAI({ apiKey: ENV.OPENAI_API_KEY });

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (!texts.length) return [];
  const res = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: texts
  });
  return res.data.map((d) => d.embedding as number[]);
}
