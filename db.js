import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";
import {
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_ADMIN_PASSWORD,
  DEFAULT_COFATHER_EMAIL,
  DEFAULT_COFATHER_PASSWORD,
  hashPassword,
  verifyPassword,
} from "./lib/auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const FALLBACK_SCHEMA = `
CREATE TABLE IF NOT EXISTS regions (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS services (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS ministers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS citizens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  given_name TEXT NOT NULL,
  family_name TEXT NOT NULL,
  dob DATE NOT NULL,
  region TEXT NOT NULL REFERENCES regions (slug),
  email TEXT NOT NULL UNIQUE,
  address TEXT NOT NULL DEFAULT '',
  terms_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'citizen';
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'registered';
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS review_note TEXT NOT NULL DEFAULT '';
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS current_citizenship TEXT NOT NULL DEFAULT '';
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS dual_citizenship_reason TEXT NOT NULL DEFAULT '';
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS leadership_qualities TEXT NOT NULL DEFAULT '';
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS join_reason TEXT NOT NULL DEFAULT '';
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS knows_official BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS official_name TEXT NOT NULL DEFAULT '';
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS recommendation TEXT NOT NULL DEFAULT '';
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS applied_at TIMESTAMPTZ;
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS blacklisted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS blacklist_note TEXT NOT NULL DEFAULT '';
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS blacklisted_at TIMESTAMPTZ;
UPDATE citizens
SET applied_at = COALESCE(applied_at, created_at)
WHERE role IS DISTINCT FROM 'admin'
  AND status IN ('pending', 'approved', 'rejected')
  AND applied_at IS NULL;
INSERT INTO regions (slug, name) VALUES
  ('central_blossom', 'Central Blossom District'),
  ('eastern_woods', 'Eastern Redwood Expanse'),
  ('western_petals', 'Western Petal Shores'),
  ('northern_peaks', 'Northern Serene Peaks')
ON CONFLICT (slug) DO NOTHING;
INSERT INTO services (slug, name, description) VALUES
  ('documentation', 'Official Documentation', 'Birth certificates, national identity cards, and passport applications.'),
  ('treasury', 'Treasury & Taxes', 'Declarations, payments, and seasonal levies.'),
  ('health', 'Health Ministry', 'Clinic appointments and wellness notices.'),
  ('heritage', 'Cultural Heritage', 'History and floral festivals of Cheria.')
ON CONFLICT (slug) DO NOTHING;
DELETE FROM ministers;
INSERT INTO ministers (name, title, sort_order) VALUES
  ('Charuhas Kantipudi', 'Cofather', 1),
  ('Arjun Saxena', 'Cofather', 2),
  ('Bhavin', 'Cofather', 3),
  ('Mario Martin', 'External Affairs Minister', 4),
  ('Srijip', 'Education Minister', 5),
  ('Shreekrishna', 'Content Creator Minister', 6),
  ('Shivam', 'Tech Minister', 7);
`;

let sql;
let schemaPromise;

export function getDatabaseUrl() {
  return process.env.DATABASE_URL || "";
}

export function createSql() {
  const url = getDatabaseUrl();
  if (!url) {
    throw new Error("DATABASE_URL is not set.");
  }
  return neon(url);
}

function loadSchemaSql() {
  try {
    const schemaPath = path.join(__dirname, "schema.sql");
    return fs.readFileSync(schemaPath, "utf8");
  } catch {
    return FALLBACK_SCHEMA;
  }
}

export async function ensureSchema(sqlClient) {
  const raw = loadSchemaSql().replace(/^[ \t]*--.*$/gm, "");
  const statements = raw
    .split(/;\s*(?:\r?\n|$)/)
    .map((s) => s.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await sqlClient.query(statement);
  }
}

async function upsertAdmin(sqlClient, account) {
  const email = account.email.trim().toLowerCase();
  const existing = await sqlClient`
    select id, password_hash from citizens where email = ${email}
  `;
  const passwordOk =
    existing[0]?.password_hash && (await verifyPassword(account.password, existing[0].password_hash));
  const password_hash = passwordOk ? existing[0].password_hash : await hashPassword(account.password);

  if (!existing[0]) {
    await sqlClient`
      insert into citizens (
        given_name, family_name, dob, region, email, address, terms_accepted,
        password_hash, role, status, review_note, reviewed_at
      ) values (
        ${account.given_name}, ${account.family_name}, ${account.dob}, 'central_blossom', ${email},
        ${account.address}, true,
        ${password_hash}, 'admin', 'approved', ${account.note}, now()
      )
    `;
    return;
  }

  await sqlClient`
    update citizens
    set role = 'admin',
        status = 'approved',
        given_name = ${account.given_name},
        family_name = ${account.family_name},
        password_hash = ${password_hash}
    where email = ${email}
  `;
}

export async function ensureAdmin(sqlClient) {
  await upsertAdmin(sqlClient, {
    email: process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD,
    given_name: "Shivam",
    family_name: "Cheria",
    dob: "1994-07-07",
    address: "Ministry of Technology, Capital of Cheria",
    note: "Seeded Tech Minister admin",
  });
  await upsertAdmin(sqlClient, {
    email: process.env.COFATHER_EMAIL || DEFAULT_COFATHER_EMAIL,
    password: process.env.COFATHER_PASSWORD || DEFAULT_COFATHER_PASSWORD,
    given_name: "Charuhas",
    family_name: "Kantipudi",
    dob: "1992-01-01",
    address: "Office of the Cofathers, Capital of Cheria",
    note: "Seeded Cofather admin",
  });
}

export async function getReadySql() {
  if (!getDatabaseUrl()) {
    throw new Error("DATABASE_URL is not set.");
  }
  sql ??= createSql();
  schemaPromise ??= ensureSchema(sql).then(() => ensureAdmin(sql));
  await schemaPromise;
  return sql;
}
