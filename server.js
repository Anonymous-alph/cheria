import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  handleAdminApplications,
  handleAdminReview,
  handleApplication,
  handleHealth,
  handleLogin,
  handleLogout,
  handleMe,
  handleRegister,
} from "./lib/handlers.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname));

app.get("/api/health", handleHealth);
app.post("/api/register", handleRegister);
app.post("/api/login", handleLogin);
app.get("/api/me", handleMe);
app.post("/api/logout", handleLogout);
app.post("/api/application", handleApplication);
app.get("/api/admin/applications", handleAdminApplications);
app.get("/api/admin-applications", handleAdminApplications);
app.post("/api/admin/review", handleAdminReview);
app.post("/api/admin-review", handleAdminReview);

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Cheria portal running at http://localhost:${PORT}`);
  });
}

export default app;
