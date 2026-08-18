import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env and add your Neon connection string.");
  }
  return neon(url);
}

export async function ensureSchema(sql) {
  const schemaPath = path.join(__dirname, "schema.sql");
  const raw = fs.readFileSync(schemaPath, "utf8")
    .replace(/^[ \t]*--.*$/gm, "");
  const statements = raw
    .split(/;\s*(?:\r?\n|$)/)
    .map((s) => s.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await sql.query(statement);
  }
}
