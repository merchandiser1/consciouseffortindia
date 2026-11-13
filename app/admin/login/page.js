"use client";

import { useEffect, useState } from "react";
import styles from "./login.module.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HOME = "/admin/dashboard";

async function post(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

export default function AdminLogin() {
  const [step, setStep] = useState("email"); // "email" | "otp"
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const sendCode = async (e) => {
    e?.preventDefault();
    if (loading) return;
    setError("");

    const value = email.trim().toLowerCase();
    if (!EMAIL_RE.test(value)) return setError("Enter a valid email address.");

    setLoading(true);
    try {
      const { res, data } = await post("/api/admin/auth/request-otp", { email: value });

      // Galat email / lockout / rate limit: usi step pe error dikhao, OTP page mat kholo
      if (!res.ok || !data.success ||  data.sent !== true ) {
        if (res.status === 429 && data.retryAfter) {
          setCooldown(Number(data.retryAfter) || 60);
        }
        return setError(data.message || "Something went wrong. Please try again.");
      }

      // Mail sach me chali gayi: tabhi OTP page
      setEmail(value);
      setOtp("");
      setCooldown(60);
      setStep("otp");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verify = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");

    if (!/^\d{6}$/.test(otp)) return setError("Enter the 6-digit code.");

    setLoading(true);
    try {
      const { res, data } = await post("/api/admin/auth/verify-otp", { email, otp });
      if (!res.ok || !data.success) {
        return setError(data.message || "Invalid or expired code.");
      }
      window.location.replace(HOME); // full load: cookie pakka lage
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <p className={styles.brand}>#CONSCIOUSEFFORT</p>
        <h1 className={styles.title}>Admin Login</h1>

        {step === "email" ? (
          <>
            <p className={styles.sub}>Enter your admin email. We will send a one-time code.</p>
            <form onSubmit={sendCode} noValidate className={styles.form}>
              <label htmlFor="a-email" className={styles.label}>Email address</label>
              <input
                id="a-email"
                type="email"
                className={`${styles.input} ${error ? styles.inputError : ""}`}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                placeholder="admin@example.com"
                autoComplete="email"
                maxLength={254}
                aria-invalid={error ? "true" : "false"}
                aria-describedby={error ? "a-email-err" : undefined}
                autoFocus
              />
              {error && (
                <p id="a-email-err" className={styles.error} role="alert">
                  {error}
                </p>
              )}
              <button type="submit" className={styles.btn} disabled={loading}>
                {loading ? "Sending..." : "Send code"}
              </button>
            </form>
          </>
        ) : (
          <>
            <p className={styles.sub}>
              A 6-digit code has been sent to <strong>{email}</strong>. It expires in 5 minutes.
            </p>
            <form onSubmit={verify} noValidate className={styles.form}>
              <label htmlFor="a-otp" className={styles.label}>Verification code</label>
              <input
                id="a-otp"
                className={`${styles.input} ${styles.otp} ${error ? styles.inputError : ""}`}
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                  if (error) setError("");
                }}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                maxLength={6}
                aria-invalid={error ? "true" : "false"}
                aria-describedby={error ? "a-otp-err" : undefined}
                autoFocus
              />
              {error && (
                <p id="a-otp-err" className={styles.error} role="alert">
                  {error}
                </p>
              )}
              <button type="submit" className={styles.btn} disabled={loading || otp.length !== 6}>
                {loading ? "Verifying..." : "Verify & login"}
              </button>
            </form>

            <div className={styles.links}>
              <button
                type="button"
                className={styles.linkBtn}
                onClick={sendCode}
                disabled={loading || cooldown > 0}
              >
                {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
              </button>
              <button
                type="button"
                className={styles.linkBtn}
                onClick={() => {
                  setStep("email");
                  setError("");
                  setOtp("");
                }}
              >
                Change email
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}