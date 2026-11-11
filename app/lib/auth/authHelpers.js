import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import mongoose from "mongoose";
import { connectDB } from "@/app/lib/connection/db";
import { COOKIE_NAME, LOGIN_PATH, verifyToken, getExpirySeconds } from "./jwt";
import User from "@/app/models/User";

/* ---------- consistent JSON responses ---------- */
export const ok = (message, data = {}, status = 200) =>
  NextResponse.json({ success: true, message, ...data }, { status });

export const fail = (message, status = 400, extra = {}) =>
  NextResponse.json({ success: false, message, ...extra }, { status });

export const serverError = () => fail("Something went wrong. Please try again.", 500);

export function tooMany(retryAfter = 60) {
  const res = fail("Too many attempts. Please try again later.", 429, { retryAfter });
  res.headers.set("Retry-After", String(retryAfter));
  return res;
}

export async function readJson(req) {
  try {
    const data = await req.json();
    return data && typeof data === "object" ? data : null;
  } catch {
    return null;
  }
}

export function getClientIp(req) {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0].trim() : req.headers.get("x-real-ip")) || "unknown";
}

/* ---------- rate limiting (in-memory) ----------
   Fine for a single server. On serverless / multiple instances,
   swap the Map for Redis/Upstash. */
const buckets = globalThis.__ceBuckets || (globalThis.__ceBuckets = new Map());

export function rateLimit(key, limit, windowMs) {
  const now = Date.now();
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
  }
  const entry = buckets.get(key);
  if (!entry || entry.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }
  entry.count += 1;
  return {
    allowed: entry.count <= limit,
    retryAfter: Math.ceil((entry.resetAt - now) / 1000),
  };
}

/* ---------- auth cookie ---------- */
export function setAuthCookie(res, token) {
  res.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: getExpirySeconds(),
  });
  return res;
}

export function clearAuthCookie(res) {
  res.cookies.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}

/* ---------- current user (server-side, full check incl. DB) ---------- */
export async function getAuthUser() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload?.sub || !mongoose.isValidObjectId(payload.sub)) return null;

  await connectDB();
  const user = await User.findById(payload.sub)
    .select("username email isVerified tokenVersion createdAt")
    .lean();

  if (!user || !user.isVerified || user.tokenVersion !== payload.tv) return null;
  return { id: String(user._id), username: user.username, email: user.email, createdAt: user.createdAt };
}

// For server components / layouts of private pages
export async function requireAuth() {
  const user = await getAuthUser();
  if (!user) redirect(`${LOGIN_PATH}?expired=1`);
  return user;
}
