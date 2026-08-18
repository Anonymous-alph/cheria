import { getReadySql } from "../db.js";
import {
  clearAuthCookie,
  hashPassword,
  issueAuth,
  publicAccount,
  readToken,
  verifyPassword,
} from "./auth.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OFFICIALS = [
  "Charuhas Kantipudi",
  "Arjun Saxena",
  "Bhavin",
  "Mario Martin",
  "Srijip",
  "Shreekrishna",
  "Shivam",
];

export async function handleHealth(_req, res) {
  try {
    const sql = await getReadySql();
    const rows = await sql`select current_database() as db, now() as now`;
    res.status(200).json({ ok: true, database: rows[0].db, now: rows[0].now });
  } catch (err) {
    res.status(503).json({ ok: false, error: err.message });
  }
}

function authResponse(res, status, account) {
  const token = issueAuth(res, account);
  return res.status(status).json({
    ok: true,
    token,
    citizen: publicAccount(account),
  });
}

export async function handleRegister(req, res) {
  const body = req.body || {};
  const given_name = String(body.given_name || "").trim();
  const family_name = String(body.family_name || "").trim();
  const dob = String(body.dob || "").trim();
  const region = String(body.region || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const address = String(body.address || "").trim();
  const password = String(body.password || "");
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
  if (password.length < 8) {
    return res.status(400).json({ ok: false, error: "Password must be at least 8 characters." });
  }
  if (!terms) {
    return res.status(400).json({ ok: false, error: "You must accept the terms of service." });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
    return res.status(400).json({ ok: false, error: "Date of birth must be YYYY-MM-DD." });
  }

  try {
    const sql = await getReadySql();
    const regionRows = await sql`select slug from regions where slug = ${region}`;
    if (!regionRows.length) {
      return res.status(400).json({ ok: false, error: "Please select a valid home region." });
    }

    const password_hash = await hashPassword(password);
    const inserted = await sql`
      insert into citizens (
        given_name, family_name, dob, region, email, address, terms_accepted,
        password_hash, role, status
      )
      values (
        ${given_name}, ${family_name}, ${dob}, ${region}, ${email}, ${address}, ${terms},
        ${password_hash}, 'citizen', 'registered'
      )
      returning id, given_name, family_name, dob, region, email, address, role, status,
                review_note, reviewed_at, current_citizenship, dual_citizenship_reason,
                leadership_qualities, join_reason, knows_official, official_name,
                recommendation, applied_at, created_at
    `;
    return authResponse(res, 201, inserted[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({
        ok: false,
        error: "A citizen with this email is already registered. Please sign in.",
      });
    }
    console.error("register failed", err);
    return res.status(500).json({ ok: false, error: "Registration could not be saved. Please try again." });
  }
}

export async function handleLogin(req, res) {
  const body = req.body || {};
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  if (!email || !password) {
    return res.status(400).json({ ok: false, error: "Enter your email and password." });
  }
  try {
    const sql = await getReadySql();
    const rows = await sql`
      select id, given_name, family_name, dob, region, email, address, role, status,
             review_note, reviewed_at, current_citizenship, dual_citizenship_reason,
             leadership_qualities, join_reason, knows_official, official_name,
             recommendation, applied_at, created_at, password_hash
      from citizens where email = ${email}
    `;
    const account = rows[0];
    if (!account?.password_hash) {
      return res.status(401).json({ ok: false, error: "No account matches those details." });
    }
    const ok = await verifyPassword(password, account.password_hash);
    if (!ok) {
      return res.status(401).json({ ok: false, error: "No account matches those details." });
    }
    return authResponse(res, 200, account);
  } catch (err) {
    console.error("login failed", err);
    return res.status(500).json({ ok: false, error: "Could not sign in. Please try again." });
  }
}

async function loadSessionAccount(req, res) {
  const session = readToken(req);
  if (!session) {
    res.status(401).json({ ok: false, error: "Please sign in." });
    return null;
  }
  try {
    const sql = await getReadySql();
    const rows = await sql`
      select id, given_name, family_name, dob, region, email, address, role, status,
             review_note, reviewed_at, current_citizenship, dual_citizenship_reason,
             leadership_qualities, join_reason, knows_official, official_name,
             recommendation, applied_at, created_at
      from citizens where id = ${session.id}
    `;
    if (!rows[0]) {
      clearAuthCookie(res);
      res.status(401).json({ ok: false, error: "Please sign in." });
      return null;
    }
    return rows[0];
  } catch (err) {
    console.error("session load failed", err);
    res.status(500).json({ ok: false, error: "Could not load your account." });
    return null;
  }
}

export async function handleMe(req, res) {
  const account = await loadSessionAccount(req, res);
  if (!account) return;
  return res.status(200).json({ ok: true, citizen: publicAccount(account) });
}

export async function handleLogout(_req, res) {
  clearAuthCookie(res);
  return res.status(200).json({ ok: true });
}

function parseApplicationBody(body) {
  const current_citizenship = String(body.current_citizenship || "").trim();
  const dual_citizenship_reason = String(body.dual_citizenship_reason || "").trim();
  const leadership_qualities = String(body.leadership_qualities || "").trim();
  const join_reason = String(body.join_reason || "").trim();
  const knows_official =
    body.knows_official === true ||
    body.knows_official === "true" ||
    body.knows_official === "on" ||
    body.knows_official === "1";
  const official_name = String(body.official_name || "").trim();
  const recommendation = String(body.recommendation || "").trim();

  if (!current_citizenship || current_citizenship.length < 2) {
    return { error: "State your current citizenship." };
  }
  if (dual_citizenship_reason.length < 40) {
    return { error: "Explain why you seek dual citizenship with Cheria (at least 40 characters)." };
  }
  if (leadership_qualities.length < 40) {
    return { error: "Describe your leadership qualities (at least 40 characters)." };
  }
  if (join_reason.length < 40) {
    return { error: "Explain why you wish to join Cheria (at least 40 characters)." };
  }
  if (knows_official) {
    if (!official_name) {
      return { error: "Name the cofather or minister who knows you." };
    }
    if (!OFFICIALS.includes(official_name)) {
      return { error: "Select a valid cofather or minister from the list." };
    }
    if (recommendation.length < 40) {
      return { error: "Enter the recommendation paragraph provided by the official (at least 40 characters)." };
    }
  }

  return {
    current_citizenship,
    dual_citizenship_reason,
    leadership_qualities,
    join_reason,
    knows_official,
    official_name: knows_official ? official_name : "",
    recommendation: knows_official ? recommendation : "",
  };
}

export async function handleApplication(req, res) {
  const account = await loadSessionAccount(req, res);
  if (!account) return;
  if (account.role === "admin") {
    return res.status(400).json({ ok: false, error: "Administrators do not submit citizenship applications." });
  }
  if (account.status === "approved") {
    return res.status(400).json({ ok: false, error: "Your citizenship is already approved." });
  }
  if (account.status === "pending" && account.applied_at) {
    return res.status(409).json({ ok: false, error: "Your application is already with the ministry for review." });
  }
  if (account.status === "rejected") {
    return res.status(403).json({ ok: false, error: "This application was declined. Contact the ministry to reapply." });
  }

  const parsed = parseApplicationBody(req.body || {});
  if (parsed.error) {
    return res.status(400).json({ ok: false, error: parsed.error });
  }

  try {
    const sql = await getReadySql();
    const updated = await sql`
      update citizens
      set status = 'pending',
          current_citizenship = ${parsed.current_citizenship},
          dual_citizenship_reason = ${parsed.dual_citizenship_reason},
          leadership_qualities = ${parsed.leadership_qualities},
          join_reason = ${parsed.join_reason},
          knows_official = ${parsed.knows_official},
          official_name = ${parsed.official_name},
          recommendation = ${parsed.recommendation},
          applied_at = now(),
          review_note = '',
          reviewed_at = null
      where id = ${account.id} and role = 'citizen'
      returning id, given_name, family_name, dob, region, email, address, role, status,
                review_note, reviewed_at, current_citizenship, dual_citizenship_reason,
                leadership_qualities, join_reason, knows_official, official_name,
                recommendation, applied_at, created_at
    `;
    if (!updated[0]) {
      return res.status(404).json({ ok: false, error: "Account not found." });
    }
    return res.status(200).json({ ok: true, citizen: publicAccount(updated[0]) });
  } catch (err) {
    console.error("application failed", err);
    return res.status(500).json({ ok: false, error: "Could not submit your application." });
  }
}

async function requireAdmin(req, res) {
  const account = await loadSessionAccount(req, res);
  if (!account) return null;
  if (account.role !== "admin") {
    res.status(403).json({ ok: false, error: "This desk is reserved for ministry administrators." });
    return null;
  }
  return account;
}

export async function handleAdminApplications(req, res) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  try {
    const sql = await getReadySql();
    const rows = await sql`
      select id, given_name, family_name, dob, region, email, address, role, status,
             review_note, reviewed_at, current_citizenship, dual_citizenship_reason,
             leadership_qualities, join_reason, knows_official, official_name,
             recommendation, applied_at, created_at
      from citizens
      where role <> 'admin' and applied_at is not null
      order by
        case when status = 'pending' then 0 when status = 'approved' then 1 else 2 end,
        applied_at desc
    `;
    return res.status(200).json({
      ok: true,
      applications: rows.map(publicAccount),
    });
  } catch (err) {
    console.error("admin list failed", err);
    return res.status(500).json({ ok: false, error: "Could not load applications." });
  }
}

export async function handleAdminReview(req, res) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  const body = req.body || {};
  const id = String(body.id || "").trim();
  const action = String(body.action || "").trim().toLowerCase();
  const note = String(body.note || "").trim();
  if (!id) {
    return res.status(400).json({ ok: false, error: "Application id is required." });
  }
  if (action !== "approve" && action !== "reject") {
    return res.status(400).json({ ok: false, error: "Action must be approve or reject." });
  }
  const status = action === "approve" ? "approved" : "rejected";
  try {
    const sql = await getReadySql();
    const updated = await sql`
      update citizens
      set status = ${status},
          review_note = ${note},
          reviewed_at = now()
      where id = ${id} and role <> 'admin' and applied_at is not null
      returning id, given_name, family_name, dob, region, email, address, role, status,
                review_note, reviewed_at, current_citizenship, dual_citizenship_reason,
                leadership_qualities, join_reason, knows_official, official_name,
                recommendation, applied_at, created_at
    `;
    if (!updated[0]) {
      return res.status(404).json({ ok: false, error: "Application not found." });
    }
    return res.status(200).json({ ok: true, citizen: publicAccount(updated[0]) });
  } catch (err) {
    console.error("admin review failed", err);
    return res.status(500).json({ ok: false, error: "Could not update the application." });
  }
}
