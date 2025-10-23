import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Resolve to server/.env regardless of current working directory
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const ENV = {
  PORT: process.env.PORT ? Number(process.env.PORT) : 8080,
  MONGODB_URI: process.env.MONGODB_URI || "",
  JWT_SECRET: process.env.JWT_SECRET || "",
  LLM_PROVIDER: process.env.LLM_PROVIDER || "groq",
  GROQ_API_KEY: process.env.GROQ_API_KEY || "",
  // S3 (no longer required)
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "",
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",
  AWS_REGION: process.env.AWS_REGION || "",
  S3_BUCKET: process.env.S3_BUCKET || "",
  S3_PUBLIC_BASE_URL: process.env.S3_PUBLIC_BASE_URL || "",
  // Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
  CLOUDINARY_FOLDER: process.env.CLOUDINARY_FOLDER || "",
  // Frontend origin for CORS allowlist (e.g., https://your-app.vercel.app)
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN || ""
};

export function assertEnv() {
  const missing: string[] = [];
  if (!ENV.MONGODB_URI) missing.push("MONGODB_URI");
  if (!ENV.JWT_SECRET) missing.push("JWT_SECRET");
  if (ENV.LLM_PROVIDER !== "groq") missing.push("LLM_PROVIDER must be 'groq'");
  if (!ENV.GROQ_API_KEY) missing.push("GROQ_API_KEY");
  if (!ENV.CLOUDINARY_CLOUD_NAME) missing.push("CLOUDINARY_CLOUD_NAME");
  if (!ENV.CLOUDINARY_API_KEY) missing.push("CLOUDINARY_API_KEY");
  if (!ENV.CLOUDINARY_API_SECRET) missing.push("CLOUDINARY_API_SECRET");
  if (missing.length) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  }
}
