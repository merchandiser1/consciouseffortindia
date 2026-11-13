import crypto from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";

export const ADMIN_COOKIE = "ce_admin";
export const ADMIN_LOGIN_PATH = "/admin/login";
export const ADMIN_HOME_PATH = "/admin/dashboard/overview";

export const OTP_TTL_MS = 5 * 60 * 1000; // OTP 5 min valid
export const RESEND_COOLDOWN_MS = 60 * 1000; // resend 60 sec baad
export const MAX_OTP_ATTEMPTS = 5;
const SESSION_SECONDS = 8 * 60 * 60; // 8 hours
const AUDIENCE = "ce-admin";


// Ye ek hi email allowed hai
export const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "merchandiser@saahra.com")
  .trim()
  .toLowerCase();

function secret() {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 32) throw new Error("JWT_SECRET must be set and at least 32 characters long");
  return s;
}

export function safeEqual(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

export const isAdminEmail = (email) => safeEqual(email, ADMIN_EMAIL);

/* ---------- OTP ---------- */
export const generateOtp = () => String(crypto.randomInt(0, 1000000)).padStart(6, "0");

export const hashOtp = (email, otp) =>
  crypto.createHmac("sha256", secret()).update(`admin-otp:${email}:${otp}`).digest("hex");

/* ---------- session token ---------- */
export async function signAdminToken() {
  return new SignJWT({ role: "admin", email: ADMIN_EMAIL })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("admin")
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_SECONDS}s`)
    .sign(new TextEncoder().encode(secret()));
}

export function setAdminCookie(res, token) {
  res.cookies.set({
    name: ADMIN_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
  return res;
}

export function clearAdminCookie(res) {
  res.cookies.set({
    name: ADMIN_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return res;
}

/* ---------- current admin (server side) ---------- */
export async function getAdmin() {
  await connection();
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret()), {
      algorithms: ["HS256"],
      audience: AUDIENCE,
    });
    if (payload.role !== "admin" || !isAdminEmail(String(payload.email || ""))) return null;
    return { email: ADMIN_EMAIL };
  } catch {
    return null;
  }
}

// Admin pages me use kar
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect(ADMIN_LOGIN_PATH);
  return admin;
}