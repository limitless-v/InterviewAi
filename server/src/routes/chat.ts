import { Router } from "express";
import { requireAuth, AuthedRequest } from "../middleware/auth.js";
import { Document } from "../models/Document.js";
import { ChatSession } from "../models/ChatSession.js";
import { ENV } from "../config/env.js";
import { cosineSimilarity } from "../utils/similarity.js";
import { embedTexts } from "../utils/embeddings.js";

const router = Router();

async function callGroqChat(messages: Array<{ role: string; content: string }>) {
  const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ENV.GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages,
      temperature: 0.7
    })
  });
  if (!resp.ok) {
    const text = await resp.text();
    const err: any = new Error(`Groq error ${resp.status}: ${text}`);
    (err.status = resp.status);
    throw err;
  }
  const data: any = await resp.json();
  return data.choices?.[0]?.message?.content || "";
}

router.post("/start", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { resumeId, jdId } = req.body as { resumeId: string; jdId: string };
    const jdDoc = await Document.findOne({ _id: jdId, userId: req.userId });
    if (!jdDoc) return res.status(404).json({ error: "Job description not found" });

    const prompt = `Based on this job description, generate exactly 3 interview questions that would assess a candidate's qualifications. Return only the questions, numbered 1-3.\n\nJob Description:\n${jdDoc.textContent}`;

    const questions = await callGroqChat([{ role: "user", content: prompt }]);

    const session = await ChatSession.create({
      userId: req.userId,
      resumeId,
      jdId,
      messages: [{ role: "assistant", content: questions }],
      status: "active"
    });

    return res.json({ success: true, session, questions });
  } catch (e: any) {
    const status = e?.status || e?.response?.status;
    if (status === 429) {
      return res.status(429).json({ error: "LLM quota or rate limit exceeded.", code: "LLM_QUOTA" });
    }
    return res.status(500).json({ error: e.message });
  }
});

router.post("/query", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { sessionId, message } = req.body as { sessionId: string; message: string };
    const session = await ChatSession.findOne({ _id: sessionId, userId: req.userId });
    if (!session) return res.status(404).json({ error: "Session not found" });

    const resumeDoc = session.resumeId ? await Document.findById(session.resumeId) : null;
    const jdDoc = session.jdId ? await Document.findById(session.jdId) : null;

    const contextChunks = [
      ...(resumeDoc?.chunks || []),
      ...(jdDoc?.chunks || [])
    ];

    const [queryEmbedding] = await embedTexts([message]);
    const scored = contextChunks
      .map((c: any) => ({ text: c.text, score: cosineSimilarity(queryEmbedding || [], c.embedding || []) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 2);

    const lastQuestion = session.messages.filter((m: any) => m.role === "assistant").slice(-1)[0]?.content || "";

    const evalPrompt = `You are an interview evaluator. The candidate was asked: "${lastQuestion}"\n\nTheir response: "${message}"\n\nRelevant resume/JD context:\n${scored.map((s, i) => `Chunk ${i + 1}: ${s.text}`).join("\n\n")}\n\nProvide:\n1. A score from 1-10\n2. Brief feedback (max 100 words)\n3. Cite relevant chunks by number\n\nReturn JSON: {"score": number, "feedback": "text", "citations": ["Chunk N", ...]}`;

    const evalText = await callGroqChat([{ role: "user", content: evalPrompt }]);

    let evaluation: any;
    try {
      evaluation = JSON.parse(evalText || "{}");
    } catch {
      evaluation = { score: 5, feedback: evalText || "", citations: [] };
    }

    const updatedMessages = [
      ...session.messages,
      { role: "user", content: message },
      { role: "assistant", content: evaluation.feedback, score: evaluation.score }
    ];

    session.messages = updatedMessages as any;
    await session.save();

    return res.json({ success: true, evaluation });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

export default router;
