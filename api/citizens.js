import { handlePublicCitizens } from "../lib/handlers.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }
  return handlePublicCitizens(req, res);
}
