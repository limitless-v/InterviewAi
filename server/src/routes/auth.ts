import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { ENV } from "../config/env.js";

const router = Router();

router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) return res.status(400).json({ error: "Missing fields" });
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already in use" });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash });
    const token = jwt.sign({ id: user._id.toString() }, ENV.JWT_SECRET, { expiresIn: "7d" });
    return res.json({ token, user: { id: user._id, email: user.email } });
  } catch (e:any) {
    return res.status(500).json({ error: e.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) return res.status(400).json({ error: "Missing fields" });
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ error: "Invalid credentials" });
    const token = jwt.sign({ id: user._id.toString() }, ENV.JWT_SECRET, { expiresIn: "7d" });
    return res.json({ token, user: { id: user._id, email: user.email } });
  } catch (e:any) {
    return res.status(500).json({ error: e.message });
  }
});

export default router;
