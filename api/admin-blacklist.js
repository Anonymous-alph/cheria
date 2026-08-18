import { handleAdminBlacklistGet, handleAdminBlacklistUpdate } from "../lib/handlers.js";

export default async function handler(req, res) {
  if (req.method === "GET") return handleAdminBlacklistGet(req, res);
  if (req.method === "POST") return handleAdminBlacklistUpdate(req, res);
  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ ok: false, error: "Method not allowed" });
}
