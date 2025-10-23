import { Router } from "express";
import multer from "multer";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import { requireAuth, AuthedRequest } from "../middleware/auth.js";
import { Document } from "../models/Document.js";
import { uploadPdfToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { chunkText } from "../utils/chunking.js";
import { embedTexts } from "../utils/embeddings.js";

const router = Router();
const upload = multer({ limits: { fileSize: 2 * 1024 * 1024 } }); // 2MB

router.post("/upload", requireAuth, upload.single("file"), async (req: AuthedRequest, res) => {
  try {
    const userId = req.userId!;
    const type = (req.body.type as string) || "";
    if (!req.file || !["resume", "job_description"].includes(type)) {
      return res.status(400).json({ error: "Invalid file or type" });
    }
    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({ error: "Only PDF files are allowed" });
    }

    const ext = ".pdf";
    const key = `${userId}/${type}-${Date.now()}${ext}`;

    // Upload PDF to Cloudinary (raw resource)
    const { url: fileUrl, publicId } = await uploadPdfToCloudinary(req.file.buffer, key);

    // Extract text
    const pdfData = await pdfParse(req.file.buffer as any);
    const text = (pdfData.text || "").trim();

    // Chunk and embed
    const chunks = chunkText(text, 500);
    const embeddings = await embedTexts(chunks);
    const chunkDocs = chunks.map((t, i) => ({ text: t, embedding: embeddings[i] || [] }));

    const doc = await Document.create({
      userId,
      type,
      fileName: req.file.originalname,
      fileUrl,
      publicId,
      textContent: text,
      chunks: chunkDocs
    });

    return res.json({ success: true, document: doc });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

router.get("/list", requireAuth, async (req: AuthedRequest, res) => {
  const docs = await Document.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(20);
  return res.json({ documents: docs });
});

router.delete("/:id", requireAuth, async (req: AuthedRequest, res) => {
  const doc = await Document.findOne({ _id: req.params.id, userId: req.userId });
  if (!doc) return res.status(404).json({ error: "Not found" });
  await deleteFromCloudinary(doc.publicId);
  await doc.deleteOne();
  return res.json({ success: true });
});

export default router;
