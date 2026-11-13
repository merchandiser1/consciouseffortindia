import { connectDB } from "@/app/lib/connection/db";
import {
  ok, fail, serverError, tooMany, readJson, getClientIp, rateLimit,
} from "@/app/lib/auth/authHelpers";
import {
  ADMIN_EMAIL, isAdminEmail, generateOtp, hashOtp, OTP_TTL_MS, RESEND_COOLDOWN_MS,
} from "@/app/lib/admin/adminAuth";
import { sendAdminOtpEmail } from "@/app/lib/admin/adminMail";
import AdminOtp from "@/app/models/AdminOtp";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req) {
  try {
    const ip = getClientIp(req);
    const rl = rateLimit(`admin-otp-ip:${ip}`, 10, 15 * 60 * 1000);
    if (!rl.allowed) return tooMany(rl.retryAfter);

    const body = await readJson(req);
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
      return fail("Enter a valid email address.", 400);
    }

    // Koi aur email: mail NAHI jayegi
    if (!isAdminEmail(email)) {
      return fail("Only admin can login.", 403);
    }

    await connectDB();

    const existing = await AdminOtp.findOne({ email: ADMIN_EMAIL }).lean();

    if (existing?.lockedUntil && existing.lockedUntil > new Date()) {
      return fail("Admin login is temporarily locked. Try again later.", 429);
    }

    if (existing) {
      const wait = existing.lastSentAt.getTime() + RESEND_COOLDOWN_MS - Date.now();
      if (wait > 0) {
        return fail("Please wait before requesting another code.", 429, {
          retryAfter: Math.ceil(wait / 1000),
        });
      }
    }

    const otp = generateOtp();
    const now = Date.now();
    await AdminOtp.findOneAndUpdate(
      { email: ADMIN_EMAIL },
      {
        email: ADMIN_EMAIL,
        otpHash: hashOtp(ADMIN_EMAIL, otp),
        attempts: 0,
        lastSentAt: new Date(now),
        expiresAt: new Date(now + OTP_TTL_MS),
      },
      { upsert: true, new: true }
    );

    try {
      await sendAdminOtpEmail(ADMIN_EMAIL, otp);
    } catch (err) {
      console.error("admin otp mail failed:", err);
      await AdminOtp.updateOne(
        { email: ADMIN_EMAIL },
        { $set: { otpHash: "", expiresAt: new Date(0) } }
      );
      return serverError();
    }

    return ok("Verification code sent to your email.", { sent: true });
  } catch (err) {
    console.error("admin request-otp failed:", err);
    return serverError();
  }
}