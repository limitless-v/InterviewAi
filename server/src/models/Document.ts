import mongoose from "mongoose";

const chunkSchema = new mongoose.Schema({
  text: { type: String, required: true },
  embedding: { type: [Number], default: [] }
});

const documentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },
    type: { type: String, enum: ["resume", "job_description"], required: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    publicId: { type: String, required: true },
    textContent: { type: String, default: "" },
    chunks: { type: [chunkSchema], default: [] }
  },
  { timestamps: true }
);

export const Document = mongoose.model("Document", documentSchema);
