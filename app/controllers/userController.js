import { connectDB } from "@/app/lib/connection/db";
import { sendOtpEmail } from "@/app/lib/mail/mailer";
import { hashPassword, comparePassword } from "@/app/lib/auth/password";
import { signToken } from "@/app/lib/auth/jwt";
import {
  PURPOSE, OTP_TTL_MS, RESEND_COOLDOWN_MS, RESET_TOKEN_TTL_MS, MAX_OTP_ATTEMPTS,
  generateOtp, hashOtp, generateResetToken, hashResetToken, safeEqual,
} from "@/app/lib/auth/otp";
import {
  validateSignup, validateLogin, validateEmail, validateOtp, validateReset,
} from "@/app/lib/auth/authValidation";
import {
  ok, fail, serverError, tooMany, readJson, getClientIp, rateLimit,
  setAuthCookie, clearAuthCookie, getAuthUser,
} from "@/app/lib/auth/authHelpers";
import User from "@/app/models/User";
import PasswordReset from "@/app/models/PasswordReset";

const MIN = 60 * 1000;

const USERNAME_TAKEN = "This username is already taken. Please choose another one.";
const EMAIL_TAKEN = "An account with this email already exists. Try logging in instead.";

/* =====================  SIGNUP / LOGIN / LOGOUT / ME  ===================== */

export async function signup(req) {
  try {
    const { errors, values } = validateSignup(await readJson(req));
    if (Object.keys(errors).length) return fail("Please fix the errors below.", 400, { errors });

    const rl = rateLimit(`signup:${getClientIp(req)}`, 10, 60 * MIN);
    if (!rl.allowed) return tooMany(rl.retryAfter);

    await connectDB();
    await User.init(); // make sure unique indexes exist

    const clash = await User.findOne({
      $or: [{ usernameLower: values.usernameLower }, { email: values.email }],
    }).select("usernameLower email").lean();

    if (clash) {
      const e = {};
      if (clash.usernameLower === values.usernameLower) e.username = USERNAME_TAKEN;
      if (clash.email === values.email) e.email = EMAIL_TAKEN;
      return fail("Please fix the errors below.", 409, { errors: e });
    }

    await User.create({
      username: values.username,
      usernameLower: values.usernameLower,
      email: values.email,
      password: await hashPassword(values.password),
    });

    return ok("Account created successfully", {}, 201);
  } catch (err) {
    if (err?.code === 11000) {
      // race condition: two signups at the same time
      const field = Object.keys(err.keyPattern || {})[0] === "email" ? "email" : "username";
      return fail("Please fix the errors below.", 409, {
        errors: { [field]: field === "email" ? EMAIL_TAKEN : USERNAME_TAKEN },
      });
    }
    console.error("[signup]", err);
    return serverError();
  }
}

export async function login(req) {
  try {
    const { ok: valid, identifier, isEmail, password } = validateLogin(await readJson(req));
    if (!valid) return fail("Please enter your email or username and your password.", 400);

    const ip = getClientIp(req);
    const a = rateLimit(`login:ip:${ip}`, 20, 15 * MIN);
    const b = rateLimit(`login:id:${identifier}`, 8, 15 * MIN);
    if (!a.allowed || !b.allowed) return tooMany(Math.max(a.retryAfter, b.retryAfter));

    await connectDB();
    const user = await User.findOne(isEmail ? { email: identifier } : { usernameLower: identifier })
      .select("+password");

    // Wrong email / username
    if (!user) {
      const msg = isEmail
        ? "No account found with this email address."
        : "No account found with this username.";
      return fail(msg, 401, { errors: { identifier: msg } });
    }

    // Right account, wrong password
    if (!(await comparePassword(password, user.password))) {
      const msg = "Incorrect password. Please try again.";
      return fail(msg, 401, { errors: { password: msg } });
    }

    if (!user.isVerified) return fail("Please verify your account before logging in.", 403);

    const token = await signToken({ userId: user._id, tokenVersion: user.tokenVersion });
    return setAuthCookie(
      ok("Logged in successfully", { user: { id: String(user._id), username: user.username, email: user.email } }),
      token
    );
  } catch (err) {
    console.error("[login]", err);
    return serverError();
  }
}

export async function logout() {
  return clearAuthCookie(ok("Logged out successfully"));
}

export async function me() {
  try {
    const user = await getAuthUser();

    // Logged out is a normal state, not an error: 200 so no 401 shows in the terminal / console
    if (!user) return ok("Not authenticated", { authenticated: false });

    return ok("Authenticated", { authenticated: true, user });
  } catch (err) {
    console.error("[me]", err);
    return serverError();
  }
}

/* =====================  FORGOT PASSWORD (OTP + RESET)  ===================== */

// Same text whether or not the email is registered.
const GENERIC = "If an account exists for this email, a verification code has been sent.";

/* Creates + emails an OTP. Silent no-op if user is missing or cooldown is active,
   so the public response never reveals whether an email is registered. */
async function issueOtp(email) {
  await connectDB();
  const user = await User.findOne({ email }).select("_id");
  if (!user) return;

  const now = Date.now();
  const existing = await PasswordReset.findOne({ userId: user._id, purpose: PURPOSE }).select("resendAvailableAt");
  if (existing && existing.resendAvailableAt.getTime() > now) return;

  const otp = generateOtp();
  // upsert => any previous OTP is overwritten (old OTP becomes invalid)
  await PasswordReset.findOneAndUpdate(
    { userId: user._id, purpose: PURPOSE },
    {
      $set: {
        email,
        otpHash: hashOtp(user._id, otp),
        expiresAt: new Date(now + OTP_TTL_MS),
        resendAvailableAt: new Date(now + RESEND_COOLDOWN_MS),
        attempts: 0,
        verifiedAt: null,
        resetTokenHash: null,
        resetTokenExpiresAt: null,
      },
    },
    { upsert: true }
  );

  try {
    await sendOtpEmail(email, otp);
  } catch (err) {
    console.error("[mailer] failed to send OTP:", err.message);
    await PasswordReset.deleteOne({ userId: user._id, purpose: PURPOSE });
  }
}

async function handleIssue(req, bucket) {
  try {
    const body = await readJson(req);
    const { error, value: email } = validateEmail(body?.email);
    if (error) return fail(error, 400, { errors: { email: error } });

    const a = rateLimit(`${bucket}:ip:${getClientIp(req)}`, 10, 15 * MIN);
    const b = rateLimit(`${bucket}:email:${email}`, 5, 15 * MIN);
    if (!a.allowed || !b.allowed) return tooMany(Math.max(a.retryAfter, b.retryAfter));

    await issueOtp(email);
    return ok(GENERIC, { resendIn: RESEND_COOLDOWN_MS / 1000 });
  } catch (err) {
    console.error(`[${bucket}]`, err);
    return serverError();
  }
}

export const forgotPassword = (req) => handleIssue(req, "forgot");
export const resendOtp = (req) => handleIssue(req, "resend");

export async function verifyOtp(req) {
  try {
    const body = await readJson(req);
    const em = validateEmail(body?.email);
    const code = validateOtp(body?.otp);
    if (em.error || code.error) {
      const msg = code.error || em.error;
      return fail(msg, 400, { errors: { otp: msg } });
    }

    const a = rateLimit(`verify:ip:${getClientIp(req)}`, 20, 15 * MIN);
    const b = rateLimit(`verify:email:${em.value}`, 10, 15 * MIN);
    if (!a.allowed || !b.allowed) return tooMany(Math.max(a.retryAfter, b.retryAfter));

    await connectDB();
    const INVALID = fail("Invalid or expired code. Please request a new one.", 400, {
      errors: { otp: "Invalid or expired code. Please request a new one." },
    });

    const user = await User.findOne({ email: em.value }).select("_id");
    if (!user) return INVALID;

    const now = new Date();
    // Atomically count this attempt (only while unused, unexpired and under the limit)
    const record = await PasswordReset.findOneAndUpdate(
      {
        userId: user._id, purpose: PURPOSE, verifiedAt: null,
        otpHash: { $ne: null }, expiresAt: { $gt: now }, attempts: { $lt: MAX_OTP_ATTEMPTS },
      },
      { $inc: { attempts: 1 } },
      { new: true }
    );

    if (!record) {
      const locked = await PasswordReset.exists({ userId: user._id, purpose: PURPOSE, attempts: { $gte: MAX_OTP_ATTEMPTS } });
      return locked
        ? fail("Too many incorrect attempts. Please request a new code.", 429)
        : INVALID;
    }

    if (!safeEqual(record.otpHash, hashOtp(user._id, code.value))) {
      const left = MAX_OTP_ATTEMPTS - record.attempts;
      if (left <= 0) return fail("Too many incorrect attempts. Please request a new code.", 429);
      const msg = `Incorrect code. You have ${left} attempt${left === 1 ? "" : "s"} left.`;
      return fail(msg, 400, { errors: { otp: msg } });
    }

    // Correct: burn the OTP (single-use) and issue a short-lived reset authorization
    const resetToken = generateResetToken();
    const resetExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    const done = await PasswordReset.findOneAndUpdate(
      { _id: record._id, verifiedAt: null },
      {
        $set: {
          otpHash: null,
          verifiedAt: new Date(),
          resetTokenHash: hashResetToken(user._id, resetToken),
          resetTokenExpiresAt: resetExpires,
          expiresAt: resetExpires, // keep TTL index in sync
        },
      }
    );
    if (!done) return INVALID; // lost a race with a parallel request

    return ok("Code verified", { resetToken });
  } catch (err) {
    console.error("[verify-otp]", err);
    return serverError();
  }
}

export async function resetPassword(req) {
  try {
    const { errors, values } = validateReset(await readJson(req));
    if (Object.keys(errors).length) {
      // Only password / confirm have inputs on screen; anything else goes to the banner.
      const fieldErrors = {};
      if (errors.password) fieldErrors.password = errors.password;
      if (errors.confirm) fieldErrors.confirm = errors.confirm;
      return fail(
        Object.values(errors)[0],
        400,
        Object.keys(fieldErrors).length ? { errors: fieldErrors } : {}
      );
    }

    const a = rateLimit(`reset:ip:${getClientIp(req)}`, 20, 15 * MIN);
    const b = rateLimit(`reset:email:${values.email}`, 10, 15 * MIN);
    if (!a.allowed || !b.allowed) return tooMany(Math.max(a.retryAfter, b.retryAfter));

    await connectDB();
    const EXPIRED = fail("Your reset session has expired. Please start again.", 400);

    const user = await User.findOne({ email: values.email }).select("_id");
    if (!user) return EXPIRED;

    const passwordHash = await hashPassword(values.password);

    // Atomically consume the authorization => strictly one-time use
    const record = await PasswordReset.findOneAndDelete({
      userId: user._id,
      purpose: PURPOSE,
      resetTokenHash: hashResetToken(user._id, values.resetToken),
      resetTokenExpiresAt: { $gt: new Date() },
      verifiedAt: { $ne: null },
    });
    if (!record) return EXPIRED;

    await User.updateOne(
      { _id: user._id },
      { $set: { password: passwordHash }, $inc: { tokenVersion: 1 } } // kills all existing sessions
    );
    await PasswordReset.deleteMany({ userId: user._id }); // drop any other reset records

    return clearAuthCookie(ok("Password changed successfully"));
  } catch (err) {
    console.error("[reset-password]", err);
    return serverError();
  }
}