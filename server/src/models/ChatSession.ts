import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true },
  score: { type: Number },
  timestamp: { type: Date, default: Date.now }
});

const chatSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },
    resumeId: { type: mongoose.Schema.Types.ObjectId, ref: "Document" },
    jdId: { type: mongoose.Schema.Types.ObjectId, ref: "Document" },
    messages: { type: [messageSchema], default: [] },
    status: { type: String, enum: ["active", "completed"], default: "active" }
  },
  { timestamps: true }
);

export const ChatSession = mongoose.model("ChatSession", chatSchema);
