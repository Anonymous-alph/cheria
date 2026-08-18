import { handleAdminPage } from "../lib/handlers.js";

export default async function handler(req, res) {
  return handleAdminPage(req, res);
}
