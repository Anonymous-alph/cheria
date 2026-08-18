import jwt from "jsonwebtoken";
import { createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);
const COOKIE = "cheria_jwt";
const MAX_AGE = 60 * 60 * 24 * 7;

export const DEFAULT_ADMIN_EMAIL = "shivam@cheria.gov.ch";
export const DEFAULT_ADMIN_PASSWORD = "ShivamTech#7";
export const DEFAULT_COFATHER_EMAIL = "charuhas@cheria.gov.ch";
export const DEFAULT_COFATHER_PASSWORD = "CharuhasCofather#1";

function secret() {
  return process.env.JWT_SECRET || process.env.SESSION_SECRET || process.env.DATABASE_URL || "cheria-dev-secret";
}

export async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derived = await scryptAsync(password, salt, 32);
  return `${salt}:${Buffer.from(derived).toString("hex")}`;
}

export async function verifyPassword(password, stored) {
  if (!stored || !stored.includes(":")) return false;
  const [salt, hex] = stored.split(":");
  const derived = await scryptAsync(password, salt, 32);
  const actual = Buffer.from(hex, "hex");
  if (actual.length !== derived.length) return false;
  return timingSafeEqual(actual, derived);
}

export function signToken(account) {
  return jwt.sign(
    {
      sub: account.id,
      email: account.email,
      role: account.role || "citizen",
      status: account.status || "pending",
    },
    secret(),
    { algorithm: "HS256", expiresIn: MAX_AGE }
  );
}

export function readToken(req) {
  const header = req.headers?.authorization || req.headers?.Authorization || "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  const cookie = req.headers?.cookie || "";
  const match = cookie
    .split(";")
    .map((p) => p.trim())
    .find((p) => p.startsWith(`${COOKIE}=`));
  const fromCookie = match ? decodeURIComponent(match.slice(COOKIE.length + 1)) : "";
  const token = bearer || fromCookie;
  if (!token) return null;
  try {
    const data = jwt.verify(token, secret(), { algorithms: ["HS256"] });
    if (!data?.sub) return null;
    return {
      id: data.sub,
      email: data.email,
      role: data.role,
      status: data.status,
    };
  } catch {
    return null;
  }
}

export function setAuthCookie(res, token) {
  const secure = process.env.VERCEL ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax${secure}`
  );
}

export function clearAuthCookie(res) {
  const secure = process.env.VERCEL ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT${secure}`
  );
}

export function publicAccount(row) {
  return {
    id: row.id,
    given_name: row.given_name,
    family_name: row.family_name,
    email: row.email,
    region: row.region,
    address: row.address || "",
    dob: row.dob,
    role: row.role || "citizen",
    status: row.status || "registered",
    review_note: row.review_note || "",
    reviewed_at: row.reviewed_at || null,
    current_citizenship: row.current_citizenship || "",
    dual_citizenship_reason: row.dual_citizenship_reason || "",
    leadership_qualities: row.leadership_qualities || "",
    join_reason: row.join_reason || "",
    knows_official: Boolean(row.knows_official),
    official_name: row.official_name || "",
    recommendation: row.recommendation || "",
    applied_at: row.applied_at || null,
    blacklisted: Boolean(row.blacklisted),
    blacklist_note: row.blacklist_note || "",
    blacklisted_at: row.blacklisted_at || null,
    created_at: row.created_at,
  };
}

export function issueAuth(res, account) {
  const token = signToken(account);
  setAuthCookie(res, token);
  return token;
}
