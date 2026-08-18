import "dotenv/config";
import { createSql, ensureSchema } from "../db.js";

const sql = createSql();
await ensureSchema(sql);

const info = await sql`select current_database() as db, current_user as user`;
const tables = await sql`
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'public'
  ORDER BY table_name
`;
const counts = {};
for (const { table_name } of tables) {
  const [{ n }] = await sql.query(`select count(*)::int as n from ${table_name}`);
  counts[table_name] = n;
}

console.log("connection: ok");
console.log("database:", info[0].db);
console.log("user:", info[0].user);
console.log("tables:", counts);
