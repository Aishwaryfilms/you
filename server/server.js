const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

dotenv.config({ path: ".env.server" });
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || process.env.ADMIN_API_PORT || 8787);
const ADMIN_PASS_HASH = process.env.ADMIN_PASS_HASH || "";
const ADMIN_PASS = process.env.ADMIN_PASS || "";
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || "change-this-admin-jwt-secret";
const FRONTEND_DIST_DIR = path.resolve(__dirname, "..", "dist");
const FRONTEND_INDEX_FILE = path.join(FRONTEND_DIST_DIR, "index.html");

function verifyScryptPassword(password, encodedHash) {
  const parts = encodedHash.split(":");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;

  const [, salt, digestB64] = parts;
  if (!salt || !digestB64) return false;

  try {
    const expected = Buffer.from(digestB64, "base64");
    const actual = crypto.scryptSync(password, salt, expected.length);
    return crypto.timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

function verifyAdminPassword(password) {
  if (ADMIN_PASS_HASH) return verifyScryptPassword(password, ADMIN_PASS_HASH);
  if (ADMIN_PASS) return password === ADMIN_PASS;
  return false;
}

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

// Supabase admin client (server-side).
const { createClient } = require("@supabase/supabase-js");
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_KEY || "";
let supabaseAdmin = null;
if (SUPABASE_URL && SUPABASE_SERVICE_ROLE) {
  supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
    auth: { persistSession: false },
  });
} else {
  console.warn("[admin-api] SUPABASE_URL or SUPABASE_SERVICE_ROLE not configured. Admin Supabase routes will be disabled.");
}
app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/admin/login", (req, res) => {
  if (!ADMIN_PASS_HASH && !ADMIN_PASS) {
    res.status(500).json({ message: "Server admin password is not configured." });
    return;
  }

  const password = typeof req.body?.password === "string" ? req.body.password : "";

  if (!password.trim()) {
    res.status(400).json({ message: "Password is required." });
    return;
  }

  if (!verifyAdminPassword(password)) {
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

// Supabase admin routes (require service role key)
app.get("/api/admin/users", requireAdmin, async (_req, res) => {
  if (!supabaseAdmin) return res.status(500).json({ message: "Supabase admin client not configured" });

  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) return res.status(500).json({ error: error.message });
    res.json({ users: data });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.get("/api/admin/posts", requireAdmin, async (_req, res) => {
  if (!supabaseAdmin) return res.status(500).json({ message: "Supabase admin client not configured" });
  try {
    const { data, error } = await supabaseAdmin.from("posts").select("*");
    if (error) return res.status(500).json({ error: error.message });
    res.json({ posts: data });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.post("/api/admin/posts", requireAdmin, async (req, res) => {
  if (!supabaseAdmin) return res.status(500).json({ message: "Supabase admin client not configured" });
  const payload = req.body || {};
  try {
    const { data, error } = await supabaseAdmin.from("posts").insert([payload]);
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json({ post: data?.[0] });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.put("/api/admin/posts/:id", requireAdmin, async (req, res) => {
  if (!supabaseAdmin) return res.status(500).json({ message: "Supabase admin client not configured" });
  const id = req.params.id;
  const payload = req.body || {};
  try {
    const { data, error } = await supabaseAdmin.from("posts").update(payload).eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ post: data?.[0] });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.delete("/api/admin/posts/:id", requireAdmin, async (req, res) => {
  if (!supabaseAdmin) return res.status(500).json({ message: "Supabase admin client not configured" });
  const id = req.params.id;
  try {
    const { error } = await supabaseAdmin.from("posts").delete().eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

if (fs.existsSync(FRONTEND_INDEX_FILE)) {
  app.use(express.static(FRONTEND_DIST_DIR));

  // Serve SPA entry for any non-API route so domain visits always load the app.
  app.get(/^\/(?!api(?:\/|$)).*/, (_req, res) => {
    res.sendFile(FRONTEND_INDEX_FILE);
  });
}

app.listen(PORT, () => {
  console.log(`[admin-api] running on http://localhost:${PORT}`);
  if (!ADMIN_PASS_HASH && !ADMIN_PASS) {
    console.warn("[admin-api] ADMIN_PASS_HASH is missing. Set it in .env.server before using admin login.");
  }
  if (ADMIN_PASS && !ADMIN_PASS_HASH) {
    console.warn("[admin-api] Using legacy ADMIN_PASS. Prefer ADMIN_PASS_HASH for secure password storage.");
  }
  if (ADMIN_JWT_SECRET === "change-this-admin-jwt-secret") {
    console.warn("[admin-api] ADMIN_JWT_SECRET uses default value. Set a long random secret in .env.server.");
  }
  if (!fs.existsSync(FRONTEND_INDEX_FILE)) {
    console.warn("[admin-api] dist/index.html not found. Run npm run build to serve website pages from this server.");
  }
});
