import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { json } from "express";
import authRoutes from "./routes/auth.js";
import documentRoutes from "./routes/documents.js";
import chatRoutes from "./routes/chat.js";
import { ENV } from "./config/env.js";

const app = express();

// ✅ Allowed origins: local + deployed frontend
const allowed = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  ENV.FRONTEND_ORIGIN || ""
].filter(Boolean);

const corsOptions: cors.CorsOptions = {
  origin: (origin, cb) => {
    // allow curl/postman/no-origin requests
    if (!origin) return cb(null, true);

    const isVercel = typeof origin === "string" && origin.endsWith(".vercel.app");
    const isAllowed = allowed.includes(origin) || isVercel;

    if (isAllowed) return cb(null, true);

    // ✅ instead of throwing an error, just reject gracefully
    console.warn(`CORS blocked origin: ${origin}`);
    return cb(null, false);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // ✅ allow cookies / credentials
  optionsSuccessStatus: 204,
};

// ✅ Apply CORS before routes
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(json({ limit: "2mb" }));

// ✅ Rate limiting
const limiter = rateLimit({
  windowMs: 60_000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === "OPTIONS",
});
app.use(limiter);

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/chat", chatRoutes);

// ✅ Health endpoints
app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.get("/api/llm/health", (_req, res) =>
  res.json({
    provider: ENV.LLM_PROVIDER,
    hasGroqKey: Boolean(ENV.GROQ_API_KEY),
  })
);

// ✅ Global error handler
app.use((err: any, req: any, res: any, _next: any) => {
  console.error(err);
  if (!res.headersSent) {
    if (!res.get("Access-Control-Allow-Origin")) {
      res.set("Access-Control-Allow-Origin", req.headers.origin || "*");
    }
    res
      .status(err.status || 500)
      .json({ error: err.message || "Internal Server Error" });
  }
});

export default app;
