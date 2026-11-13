// Uses "jose" so this file also works in middleware (Edge runtime).
import { SignJWT, jwtVerify } from "jose";

export const COOKIE_NAME = "ce_token";

// Where your login page lives (URL). Change here if the route changes.
export const LOGIN_PATH = "/consciousmain/login";
// Where users land after a successful login (and where logged-in users get sent from the login page).
export const DASHBOARD_PATH = "/consciousmain/dashboard/applications";

const DEFAULT_EXPIRY = "7d";
const UNITS = { s: 1, m: 60, h: 3600, d: 86400 };

function secretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be set and at least 32 characters long");
  }
  return new TextEncoder().encode(secret);
}

// "7d" | "12h" | "30m" | "60s"  ->  seconds
export function getExpirySeconds() {
  const raw = (process.env.JWT_EXPIRES_IN || DEFAULT_EXPIRY).trim();
  const m = /^(\d+)\s*([smhd])$/.exec(raw) || /^(\d+)\s*([smhd])$/.exec(DEFAULT_EXPIRY);
  return Number(m[1]) * UNITS[m[2]];
}

// tv = user.tokenVersion (bumped on password reset => old tokens die)
export async function signToken({ userId, tokenVersion }) {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({ tv: tokenVersion })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(userId))
    .setIssuedAt(now)
    .setExpirationTime(now + getExpirySeconds())
    .sign(secretKey());
}

// Returns payload or null (invalid/expired token never throws).
export async function verifyToken(token) {
  const key = secretKey(); // outside try: a missing/short JWT_SECRET must be visible, not silently "logged out"
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    return payload;
  } catch (e) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("verifyToken failed:", e.code || e.name);
    }
    return null;
  }
}