"use client"; // Required in the App Router (you can remove it in the Pages Router)

import { useState } from "react";
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

// Same rules as the backend (lib/auth.js): 8-64 chars, upper, lower, number, special, no spaces
const passwordError = (p) => {
  if (p.length < 8) return "Password must be at least 8 characters.";
  if (p.length > 64) return "Password must be at most 64 characters.";
  if (!/[a-z]/.test(p)) return "Add at least one lowercase letter.";
  if (!/[A-Z]/.test(p)) return "Add at least one uppercase letter.";
  if (!/[0-9]/.test(p)) return "Add at least one number.";
  if (!/[^A-Za-z0-9]/.test(p)) return "Add at least one special character.";
  if (/\s/.test(p)) return "Password must not contain spaces.";
  return "";
};

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
  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  const [login, setLogin] = useState({ identifier: "", password: "" });
  const [signup, setSignup] = useState({ username: "", email: "", password: "", confirm: "" });

  const isLogin = tab === "login";

  const switchTab = (t) => {
    setTab(t);
    setErrors({});
    setServerError("");
  };

  const submit = async (url, payload) => {
    setLoading(true);
    setServerError("");
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Something went wrong. Try again.");
      router.push("/dashboard"); // your redirect route after login
      router.refresh();
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const er = {};
    if (!login.identifier.trim()) er.identifier = "Enter your email or username.";
    if (!login.password) er.password = "Enter your password.";
    setErrors(er);
    if (Object.keys(er).length) return;
    submit("/api/auth/login", { identifier: login.identifier.trim(), password: login.password });
  };

  const handleSignup = (e) => {
    e.preventDefault();
    const er = {};
    if (!usernameRe.test(signup.username.trim()))
      er.username = "Use 3–20 letters, numbers, _ or .";
    if (!emailRe.test(signup.email.trim())) er.email = "Enter a valid email address.";
    const pe = passwordError(signup.password);
    if (pe) er.password = pe;
    if (!signup.confirm || signup.confirm !== signup.password) er.confirm = "Passwords do not match.";
    setErrors(er);
    if (Object.keys(er).length) return;
    submit("/api/auth/signup", {
      username: signup.username.trim(),
      email: signup.email.trim(),
      password: signup.password,
    });
  };

  const upd = (setter, key) => (e) => {
    setter((s) => ({ ...s, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: "" }));
  };

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
          <span className="eyebrow">Welcome back</span>
          <h2>{isLogin ? "Sign in to Conscious Effort" : "Create your account"}</h2>
          <p className="sub">
            {isLogin ? "Enter your details to continue." : "Start building your digital space today."}
          </p>

          <div className="tabs" role="tablist">
            <button type="button" role="tab" aria-selected={isLogin}
              className={`tab ${isLogin ? "active" : ""}`} onClick={() => switchTab("login")}>
              Login
            </button>
            <button type="button" role="tab" aria-selected={!isLogin}
              className={`tab ${!isLogin ? "active" : ""}`} onClick={() => switchTab("signup")}>
              Sign Up
            </button>
          </div>

          {serverError && <div className="server-error" role="alert">{serverError}</div>}

          {isLogin ? (
            <form className="form" onSubmit={handleLogin} noValidate>
              <Field id="loginId" label="Email or Username" error={errors.identifier}>
                <input id="loginId" type="text" placeholder="you@example.com" autoComplete="username"
                  value={login.identifier} onChange={upd(setLogin, "identifier")} />
              </Field>
              <Field id="loginPass" label="Password" error={errors.password}
                extra={<Link href="/forgot-password" className="link">Forgot password?</Link>}>
                <PasswordInput id="loginPass" placeholder="Enter your password"
                  autoComplete="current-password"
                  value={login.password} onChange={upd(setLogin, "password")} />
              </Field>
              <button type="submit" className="btn" disabled={loading}>
                {loading ? "Please wait..." : <>Continue <span aria-hidden="true">&rarr;</span></>}
              </button>
            </form>
          ) : (
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
        </div>
      </section>
    </main>
  );
}