// Lightweight local embedding fallback: 256-dim character hash embedding
function localEmbed(text: string): number[] {
  const dim = 256;
  const vec = new Array(dim).fill(0);
  for (const ch of (text || "").toLowerCase()) {
    const code = ch.codePointAt(0) ?? 0;
    vec[code & 0xff] += 1;
  }
  // L2 normalize
  let norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  for (let i = 0; i < dim; i++) vec[i] = vec[i] / norm;
  return vec;
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (!texts.length) return [];
  // Always use local embeddings (Groq-only build)
  return texts.map((t) => localEmbed(t));
}
