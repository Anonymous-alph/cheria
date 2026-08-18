import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { handleHealth, handleRegister } from "./lib/handlers.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname));

app.get("/api/health", handleHealth);
app.post("/api/register", handleRegister);

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Cheria portal running at http://localhost:${PORT}`);
  });
}

export default app;
