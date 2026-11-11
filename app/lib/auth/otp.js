import crypto from "crypto";

export const PURPOSE = "password_reset";
export const OTP_TTL_MS = 5 * 60 * 1000;          // OTP valid for 5 minutes
export const RESEND_COOLDOWN_MS = 2 * 60 * 1000;  // resend after exactly 2 minutes
export const RESET_TOKEN_TTL_MS = 10 * 60 * 1000; // reset authorization valid for 10 minutes
export const MAX_OTP_ATTEMPTS = 5;

const hmac = (value) => {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not set");
  return crypto.createHmac("sha256", process.env.JWT_SECRET).update(value).digest("hex");
};

export const generateOtp = () => String(crypto.randomInt(0, 1000000)).padStart(6, "0");
export const hashOtp = (userId, otp) => hmac(`otp:${userId}:${otp}`);

export const generateResetToken = () => crypto.randomBytes(32).toString("hex");
export const hashResetToken = (userId, token) => hmac(`reset:${userId}:${token}`);

export function safeEqual(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}
