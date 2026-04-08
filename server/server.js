const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config({ path: ".env.server" });
dotenv.config();

const app = express();
const PORT = Number(process.env.ADMIN_API_PORT || 8787);
const ADMIN_PASS = process.env.ADMIN_PASS || "";
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || "change-this-admin-jwt-secret";

const allowedOrigins = (process.env.ADMIN_ALLOWED_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173")
  .split(",")
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error("Origin not allowed by admin API CORS"));
  },
}));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/admin/login", (req, res) => {
  if (!ADMIN_PASS) {
    res.status(500).json({ message: "Server admin password is not configured." });
    return;
  }

  const password = typeof req.body?.password === "string" ? req.body.password : "";

  if (!password.trim()) {
    res.status(400).json({ message: "Password is required." });
    return;
  }

  if (password !== ADMIN_PASS) {
    res.status(401).json({ message: "Incorrect password. Try again." });
    return;
  }

  const token = jwt.sign({ role: "admin" }, ADMIN_JWT_SECRET, { expiresIn: "8h" });
  res.json({ token });
});

function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    res.status(401).json({ message: "Missing admin token." });
    return;
  }

  try {
    jwt.verify(token, ADMIN_JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired admin token." });
  }
}

app.get("/api/admin/verify", requireAdmin, (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`[admin-api] running on http://localhost:${PORT}`);
  if (!ADMIN_PASS) {
    console.warn("[admin-api] ADMIN_PASS is missing. Set it in .env.server before using admin login.");
  }
  if (ADMIN_JWT_SECRET === "change-this-admin-jwt-secret") {
    console.warn("[admin-api] ADMIN_JWT_SECRET uses default value. Set a long random secret in .env.server.");
  }
});
