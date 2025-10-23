import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { json } from "express";
import authRoutes from "./routes/auth.js";
import documentRoutes from "./routes/documents.js";
import chatRoutes from "./routes/chat.js";
import { ENV } from "./config/env.js";

const app = express();

// CORS allowlist: localhost and optionally a deployed frontend origin
const allowed = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  ENV.FRONTEND_ORIGIN || ""
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // allow curl/postman
    if (allowed.includes(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  },
}));
app.options("*", cors());
app.use(json({ limit: "2mb" }));

const limiter = rateLimit({
  windowMs: 60_000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS',
});
app.use(limiter);

app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/chat", chatRoutes);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Introspection endpoint to verify LLM provider configuration
app.get("/api/llm/health", (_req, res) => {
  return res.json({
    provider: ENV.LLM_PROVIDER,
    hasGroqKey: Boolean(ENV.GROQ_API_KEY)
  });
});

// Global error handler to ensure consistent JSON and CORS headers
app.use((err: any, req: any, res: any, _next: any) => {
  console.error(err);
  // CORS header is already set by cors() above; but ensure fallback
  if (!res.get('Access-Control-Allow-Origin')) {
    res.set('Access-Control-Allow-Origin', req.headers.origin || '*');
  }
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

export default app;
