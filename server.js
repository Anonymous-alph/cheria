import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createSql, ensureSchema } from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sql = createSql();
await ensureSchema(sql);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname));

app.get("/api/health", async (_req, res) => {
  try {
    const rows = await sql`select current_database() as db, now() as now`;
    res.json({ ok: true, database: rows[0].db, now: rows[0].now });
  } catch (err) {
    res.status(503).json({ ok: false, error: err.message });
  }
});

app.post("/api/register", async (req, res) => {
  const body = req.body || {};
  const given_name = String(body.given_name || "").trim();
  const family_name = String(body.family_name || "").trim();
  const dob = String(body.dob || "").trim();
  const region = String(body.region || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const address = String(body.address || "").trim();
  const terms =
    body.terms === true ||
    body.terms === "true" ||
    body.terms === "on" ||
    body.terms === "1";

  if (!given_name || !family_name || !dob || !region || !email) {
    return res.status(400).json({
      ok: false,
      error: "Please complete given name, family name, date of birth, region, and email.",
    });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ ok: false, error: "Please enter a valid email address." });
  }
  if (!terms) {
    return res.status(400).json({ ok: false, error: "You must accept the terms of service." });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
    return res.status(400).json({ ok: false, error: "Date of birth must be YYYY-MM-DD." });
  }

  try {
    const regionRows = await sql`select slug from regions where slug = ${region}`;
    if (!regionRows.length) {
      return res.status(400).json({ ok: false, error: "Please select a valid home region." });
    }

    const inserted = await sql`
      insert into citizens (given_name, family_name, dob, region, email, address, terms_accepted)
      values (${given_name}, ${family_name}, ${dob}, ${region}, ${email}, ${address}, ${terms})
      returning id, given_name, family_name, email, created_at
    `;
    return res.status(201).json({ ok: true, citizen: inserted[0] });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({
        ok: false,
        error: "A citizen with this email is already registered.",
      });
    }
    console.error("register failed", err);
    return res.status(500).json({ ok: false, error: "Registration could not be saved. Please try again." });
  }
});

app.listen(PORT, () => {
  console.log(`Cheria portal running at http://localhost:${PORT}`);
});
