"use client"; // Required in the App Router (you can remove it in the Pages Router)

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Pages Router: "next/router"
import { Playfair_Display } from "next/font/google";
import "./login.css";

// Playfair Display (headings / brand). Gill Sans is set in login.css.
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const BRAND_TEXT = "#CONSCIOUSEFFORT";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernameRe = /^[a-zA-Z0-9_.]{3,20}$/;

const RESEND_SECONDS = 120;
const SIGNUP_SUCCESS = "Your account has been created successfully. Please log in to continue.";
const RESET_SUCCESS = "Your password has been changed successfully. Please log in with your new password.";
const EMPTY_RECOVERY = { email: "", otp: "", password: "", confirm: "", resetToken: "" };

const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

/* ---------- validators (same rules as the backend: authValidation.js) ---------- */
const usernameError = (u) => {
  if (!u) return "Enter a username.";
  if (u.length < 3) return "Username must be at least 3 characters.";
  if (u.length > 20) return "Username must be 20 characters or fewer.";
  if (!usernameRe.test(u)) return "Username can only contain letters, numbers, underscores (_) and dots (.).";
  return "";
};

const emailError = (e) => {
  if (!e) return "Enter your email address.";
  if (!emailRe.test(e)) return "Enter a valid email address, for example name@example.com.";
  return "";
};

const passwordError = (p) => {
  if (!p) return "Enter a password.";
  if (p.length < 8) return "Password must be at least 8 characters.";
  if (p.length > 64) return "Password must be at most 64 characters.";
  if (!/[a-z]/.test(p)) return "Add at least one lowercase letter.";
  if (!/[A-Z]/.test(p)) return "Add at least one uppercase letter.";
  if (!/[0-9]/.test(p)) return "Add at least one number.";
  if (!/[^A-Za-z0-9]/.test(p)) return "Add at least one special character.";
  if (/\s/.test(p)) return "Password must not contain spaces.";
  return "";
};

const confirmError = (password, confirm) => {
  if (!confirm) return "Please confirm your password.";
  if (confirm !== password) return "Passwords do not match. Please re-enter them.";
  return "";
};

// POST JSON helper. Throws Error(message) with optional .fieldErrors from the server.
async function api(url, payload) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    const err = new Error(data.message || "Something went wrong. Try again.");
    err.fieldErrors = data.errors || {};
    throw err;
  }
  return data;
}

function EyeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-6.4 0-10-7-10-7a18.5 18.5 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A10.9 10.9 0 0 1 12 4c6.4 0 10 7 10 7a18.6 18.6 0 0 1-2.16 3.19" />
      <path d="M14.12 14.12A3 3 0 1 1 9.88 9.88" />
      <path d="M2 2l20 20" />
    </svg>
  );
}

function PasswordInput({ id, value, onChange, placeholder, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <div className="pass-wrap">
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        className="toggle"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        aria-pressed={show}
      >
        {show ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}

function Field({ id, label, error, hint, children, extra }) {
  return (
    <div className={`field ${error ? "invalid" : ""}`}>
      <div className="label-row">
        <label htmlFor={id}>{label}</label>
        {extra}
      </div>
      {children}
      {error ? (
        <small className="err" role="alert">{error}</small>
      ) : hint ? (
        <small className="hint">{hint}</small>
      ) : null}
    </div>
  );
}

export default function Login() {
  const router = useRouter();

  // view: login | signup | forgot-email | verify-otp | reset-password | reset-success
  const [view, setView] = useState("login");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");

  const [login, setLogin] = useState({ identifier: "", password: "" });
  const [signup, setSignup] = useState({ username: "", email: "", password: "", confirm: "" });

  // Forgot-password data lives only in React state (never localStorage/sessionStorage)
  const [recovery, setRecovery] = useState(EMPTY_RECOVERY);
  const [resendAt, setResendAt] = useState(0); // timestamp (ms) when resend unlocks
  const [now, setNow] = useState(0);

  const isTabView = view === "login" || view === "signup";
  const isLogin = view === "login";
  const remaining = Math.max(0, Math.ceil((resendAt - now) / 1000));

  // Countdown: deadline-based (accurate even if the tab is throttled), cleaned up on unmount / state change
  useEffect(() => {
    if (!resendAt) return;
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= resendAt) clearInterval(id);
    }, 500);
    return () => clearInterval(id);
  }, [resendAt]);

  const startCooldown = () => {
    const t = Date.now();
    setNow(t);
    setResendAt(t + RESEND_SECONDS * 1000);
  };

  const goTo = (v) => {
    setView(v);
    setErrors({});
    setServerError("");
    setSuccess("");
  };

  const backToLogin = () => {
    setRecovery(EMPTY_RECOVERY); // clears email, OTP, passwords, reset token
    setResendAt(0);
    goTo("login");
  };

  // Runs an API action. Field-specific server errors appear under the matching
  // input; only general errors (rate limit, network, expired session) use the banner.
  const run = async (fn) => {
    setLoading(true);
    setServerError("");
    try {
      await fn();
    } catch (err) {
      const fe = err.fieldErrors || {};
      if (Object.keys(fe).length) setErrors((er) => ({ ...er, ...fe }));
      else setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- LOGIN ---------------- */
  const handleLogin = (e) => {
    e.preventDefault();
    const er = {};
    if (!login.identifier.trim()) er.identifier = "Enter your email or username.";
    if (!login.password) er.password = "Enter your password.";
    setErrors(er);
    setSuccess("");
    if (Object.keys(er).length) return;
    run(async () => {
      await api("/api/auth/login", { identifier: login.identifier.trim(), password: login.password });
      router.push("/consciousmain/dashboard"); // your redirect route after login
      router.refresh();
    });
  };

  /* ---------------- SIGNUP ---------------- */
  const handleSignup = (e) => {
    e.preventDefault();
    const er = {};
    const ue = usernameError(signup.username.trim());
    if (ue) er.username = ue;
    const ee = emailError(signup.email.trim());
    if (ee) er.email = ee;
    const pe = passwordError(signup.password);
    if (pe) er.password = pe;
    const ce = confirmError(signup.password, signup.confirm);
    if (ce) er.confirm = ce;
    setErrors(er);
    if (Object.keys(er).length) return;
    run(async () => {
      const username = signup.username.trim();
      await api("/api/auth/signup", {
        username,
        email: signup.email.trim(),
        password: signup.password,
        confirm: signup.confirm,
      });
      setSignup({ username: "", email: "", password: "", confirm: "" });
      setLogin({ identifier: username, password: "" });
      goTo("login");
      setSuccess(SIGNUP_SUCCESS); // no redirect: user logs in manually
    });
  };

  /* ---------------- FORGOT PASSWORD ---------------- */
  const openForgot = () => {
    const id = login.identifier.trim();
    setRecovery({ ...EMPTY_RECOVERY, email: emailRe.test(id) ? id : "" });
    goTo("forgot-email");
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    const email = recovery.email.trim();
    const ee = emailError(email);
    if (ee) return setErrors({ email: ee });
    setErrors({});
    run(async () => {
      await api("/api/auth/forgot-password", { email });
      setRecovery((r) => ({ ...r, email, otp: "" }));
      startCooldown();
      goTo("verify-otp");
    });
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (!recovery.otp) return setErrors({ otp: "Enter the 6-digit code we emailed you." });
    if (!/^\d{6}$/.test(recovery.otp)) return setErrors({ otp: "The code must be exactly 6 digits." });
    setErrors({});
    run(async () => {
      const data = await api("/api/auth/verify-otp", { email: recovery.email, otp: recovery.otp });
      setRecovery((r) => ({ ...r, otp: "", resetToken: data.resetToken }));
      setResendAt(0);
      goTo("reset-password");
    });
  };

  const handleResend = () => {
    if (remaining > 0 || loading) return;
    run(async () => {
      await api("/api/auth/resend-otp", { email: recovery.email });
      setRecovery((r) => ({ ...r, otp: "" }));
      setErrors({});
      startCooldown();
      setSuccess("A new verification code has been sent.");
    });
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    const er = {};
    const pe = passwordError(recovery.password);
    if (pe) er.password = pe;
    const ce = confirmError(recovery.password, recovery.confirm);
    if (ce) er.confirm = ce;
    setErrors(er);
    if (Object.keys(er).length) return;
    run(async () => {
      await api("/api/auth/reset-password", {
        email: recovery.email,
        resetToken: recovery.resetToken,
        password: recovery.password,
        confirm: recovery.confirm,
      });
      setRecovery(EMPTY_RECOVERY);
      goTo("reset-success");
    });
  };

  /* ---------------- field updaters (typing clears that field's error) ---------------- */
  const upd = (setter, key) => (e) => {
    setter((s) => ({ ...s, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: "" }));
  };

  const updRecovery = (key) => (e) => {
    const value = key === "otp" ? e.target.value.replace(/\D/g, "").slice(0, 6) : e.target.value;
    setRecovery((r) => ({ ...r, [key]: value }));
    setErrors((er) => ({ ...er, [key]: "" }));
  };

  const heading = {
    login: "Sign in to Conscious Effort",
    signup: "Create your account",
    "forgot-email": "Forgot Password?",
    "verify-otp": "Verify Your Email",
    "reset-password": "Create New Password",
    "reset-success": "Password Updated",
  }[view];

  const subText = {
    login: "Enter your details to continue.",
    signup: "Start building your digital space today.",
    "forgot-email": "Enter your registered email address and we'll send you a verification code.",
    "verify-otp": "Enter the 6-digit verification code sent to your registered email.",
    "reset-password": "Choose a strong password for your account.",
    "reset-success": RESET_SUCCESS,
  }[view];

  const centered = { textAlign: "center", marginTop: 18 };

  return (
    <main className={`sa ${playfair.variable}`}>
      {/* LEFT: image shown only on desktop / tablet landscape (hidden on mobile).
          Put the image at /public/login-image.png — it is set in CSS on .sa-left */}
      <section className="sa-left" aria-hidden="false">
        <div className="left-shade" />
        <div className="left-top">
          <Link href="/" className="back-btn" aria-label="Go back">&larr; Back</Link>
        </div>
      </section>

      {/* RIGHT */}
      <section className="sa-right">
        {/* MOBILE ONLY: brand text in place of the image */}
        <header className="m-top">
          <Link href="/" className="back-btn" aria-label="Go back">&larr; Back</Link>
          <h1 className="m-brand">{BRAND_TEXT}</h1>
        </header>

        <div className="card">
          <span className="eyebrow">{isTabView ? "Welcome back" : "Account recovery"}</span>
          <h2>{heading}</h2>
          <p className={`sub ${isTabView ? "" : "spaced"}`}>{subText}</p>

          {isTabView && (
            <div className="tabs" role="tablist">
              <button type="button" role="tab" aria-selected={isLogin}
                className={`tab ${isLogin ? "active" : ""}`} onClick={() => goTo("login")}>
                Login
              </button>
              <button type="button" role="tab" aria-selected={!isLogin}
                className={`tab ${!isLogin ? "active" : ""}`} onClick={() => goTo("signup")}>
                Sign Up
              </button>
            </div>
          )}

          {success && view !== "reset-success" && (
            <div className="server-success" role="status">{success}</div>
          )}
          {serverError && <div className="server-error" role="alert">{serverError}</div>}

          {/* ---------- LOGIN ---------- */}
          {view === "login" && (
            <form className="form" onSubmit={handleLogin} noValidate>
              <Field id="loginId" label="Email or Username" error={errors.identifier}>
                <input id="loginId" type="text" placeholder="you@example.com" autoComplete="username"
                  value={login.identifier} onChange={upd(setLogin, "identifier")} />
              </Field>
              <Field id="loginPass" label="Password" error={errors.password}
                extra={<button type="button" className="link-btn" onClick={openForgot}>Forgot password?</button>}>
                <PasswordInput id="loginPass" placeholder="Enter your password"
                  autoComplete="current-password"
                  value={login.password} onChange={upd(setLogin, "password")} />
              </Field>
              <button type="submit" className="btn" disabled={loading}>
                {loading ? "Please wait..." : <>Continue <span aria-hidden="true">&rarr;</span></>}
              </button>
            </form>
          )}

          {/* ---------- SIGNUP ---------- */}
          {view === "signup" && (
            <form className="form" onSubmit={handleSignup} noValidate>
              <Field id="suUser" label="Username" error={errors.username}>
                <input id="suUser" type="text" placeholder="yourusername" autoComplete="username"
                  value={signup.username} onChange={upd(setSignup, "username")} />
              </Field>
              <Field id="suEmail" label="Email" error={errors.email}>
                <input id="suEmail" type="email" placeholder="you@example.com" autoComplete="email"
                  value={signup.email} onChange={upd(setSignup, "email")} />
              </Field>
              <Field id="suPass" label="Password" error={errors.password}
                hint="8+ characters with uppercase, lowercase, number and special character.">
                <PasswordInput id="suPass" placeholder="Create a strong password"
                  autoComplete="new-password"
                  value={signup.password} onChange={upd(setSignup, "password")} />
              </Field>
              <Field id="suConfirm" label="Confirm Password" error={errors.confirm}>
                <PasswordInput id="suConfirm" placeholder="Repeat your password"
                  autoComplete="new-password"
                  value={signup.confirm} onChange={upd(setSignup, "confirm")} />
              </Field>
              <button type="submit" className="btn" disabled={loading}>
                {loading ? "Please wait..." : <>Create Account <span aria-hidden="true">&rarr;</span></>}
              </button>
            </form>
          )}

          {/* ---------- STEP 1: ENTER EMAIL ---------- */}
          {view === "forgot-email" && (
            <form className="form" onSubmit={handleSendOtp} noValidate>
              <Field id="fpEmail" label="Email address" error={errors.email}>
                <input id="fpEmail" type="email" placeholder="you@example.com" autoComplete="email"
                  value={recovery.email} onChange={updRecovery("email")} />
              </Field>
              <button type="submit" className="btn" disabled={loading}>
                {loading ? "Please wait..." : <>Send OTP <span aria-hidden="true">&rarr;</span></>}
              </button>
              <div style={centered}>
                <button type="button" className="link-btn" onClick={backToLogin}>&larr; Back to login</button>
              </div>
            </form>
          )}

          {/* ---------- STEP 2: VERIFY OTP ---------- */}
          {view === "verify-otp" && (
            <form className="form" onSubmit={handleVerifyOtp} noValidate>
              <Field id="fpOtp" label="Verification code" error={errors.otp}
                extra={<span className="link" style={{ textDecoration: "none" }} aria-live="off">{fmt(remaining)}</span>}>
                <input id="fpOtp" className="otp-input" type="text" inputMode="numeric"
                  autoComplete="one-time-code" maxLength={6} placeholder="••••••"
                  value={recovery.otp} onChange={updRecovery("otp")} />
              </Field>
              <button type="submit" className="btn" disabled={loading}>
                {loading ? "Please wait..." : <>Verify OTP <span aria-hidden="true">&rarr;</span></>}
              </button>
              <div style={{ ...centered, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <button type="button" className="link-btn" onClick={handleResend}
                  disabled={remaining > 0 || loading}>
                  Resend OTP
                </button>
                <button type="button" className="link-btn" onClick={() => goTo("forgot-email")}>
                  Change email
                </button>
              </div>
            </form>
          )}

          {/* ---------- STEP 3: NEW PASSWORD ---------- */}
          {view === "reset-password" && (
            <form className="form" onSubmit={handleResetPassword} noValidate>
              <Field id="rpPass" label="New Password" error={errors.password}
                hint="8+ characters with uppercase, lowercase, number and special character.">
                <PasswordInput id="rpPass" placeholder="Create a strong password"
                  autoComplete="new-password"
                  value={recovery.password} onChange={updRecovery("password")} />
              </Field>
              <Field id="rpConfirm" label="Confirm New Password" error={errors.confirm}>
                <PasswordInput id="rpConfirm" placeholder="Repeat your password"
                  autoComplete="new-password"
                  value={recovery.confirm} onChange={updRecovery("confirm")} />
              </Field>
              <button type="submit" className="btn" disabled={loading}>
                {loading ? "Please wait..." : <>Update Password <span aria-hidden="true">&rarr;</span></>}
              </button>
              <div style={centered}>
                <button type="button" className="link-btn" onClick={backToLogin}>&larr; Back to login</button>
              </div>
            </form>
          )}

          {/* ---------- STEP 4: SUCCESS ---------- */}
          {view === "reset-success" && (
            <div className="form">
              <button type="button" className="btn" onClick={backToLogin}>
                Back to Login
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}