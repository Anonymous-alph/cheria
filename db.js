import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";

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
INSERT INTO ministers (name, title, sort_order)
SELECT * FROM (VALUES
  ('Lord Chancellor Alistair Thorne', 'Head of Government', 1),
  ('Lady Elara Vance', 'Ministry of Heritage', 2),
  ('Sir Julian Croft', 'Ministry of Commerce', 3),
  ('Dr. Seraphina Lin', 'Ministry of Ecology', 4)
) AS seed(name, title, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM ministers);
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

export async function getReadySql() {
  if (!getDatabaseUrl()) {
    throw new Error("DATABASE_URL is not set.");
  }
  sql ??= createSql();
  schemaPromise ??= ensureSchema(sql);
  await schemaPromise;
  return sql;
}
