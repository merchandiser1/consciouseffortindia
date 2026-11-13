import { connectDB } from "@/app/lib/connection/db";
import {
  ok, fail, serverError, tooMany, readJson, getClientIp, rateLimit,
} from "@/app/lib/auth/authHelpers";
import {
  ADMIN_EMAIL, isAdminEmail, hashOtp, safeEqual, signAdminToken, setAdminCookie,
  MAX_OTP_ATTEMPTS,
} from "@/app/lib/admin/adminAuth";
import AdminOtp from "@/app/models/AdminOtp";

const INVALID = "Invalid or expired code.";

export async function POST(req) {
  try {
    const ip = getClientIp(req);
    const rl = rateLimit(`admin-verify-ip:${ip}`, 20, 15 * 60 * 1000);
    if (!rl.allowed) return tooMany(rl.retryAfter);

    const body = await readJson(req);
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const otp = typeof body?.otp === "string" ? body.otp.trim() : "";

    if (!/^\d{6}$/.test(otp)) return fail("The code must be exactly 6 digits.", 400);
    if (!isAdminEmail(email)) return fail(INVALID, 401);

    await connectDB();

    // attempts atomically badhao (brute force rokne ke liye)
    const rec = await AdminOtp.findOneAndUpdate(
      { email: ADMIN_EMAIL, expiresAt: { $gt: new Date() } },
      { $inc: { attempts: 1 } },
      { new: true }
    );
    if (!rec) return fail(INVALID, 401);

    if (rec.attempts > MAX_OTP_ATTEMPTS) {
      await AdminOtp.deleteOne({ email: ADMIN_EMAIL });
      return fail("Too many wrong attempts. Please request a new code.", 429);
    }

    if (!safeEqual(rec.otpHash, hashOtp(ADMIN_EMAIL, otp))) {
      return fail(INVALID, 401);
    }

    // sahi code: ek hi baar use ho sakta hai
    await AdminOtp.deleteOne({ email: ADMIN_EMAIL });

    const token = await signAdminToken();
    return setAdminCookie(ok("Signed in."), token);
  } catch (err) {
    console.error("admin verify-otp failed:", err);
    return serverError();
  }
}