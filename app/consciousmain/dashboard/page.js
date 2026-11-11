"use client";

import { useEffect, useState } from "react";

const LOGIN_HREF = "/consciousmain/login";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  // Show who is logged in
  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store", credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setUser(d.user))
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
      if (!res.ok) throw new Error("logout failed");
      // Full page load: clears router cache, no competing navigations
      window.location.replace(LOGIN_HREF);
    } catch {
      setLoggingOut(false); // failed: show the Logout button again
    }
  };

  return (
    <main style={{ padding: "120px 24px 40px", maxWidth: 960, margin: "0 auto" }}>
      <h1>Dashboard</h1>
      {user && <p>Welcome, {user.username}</p>}

      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        style={{
          marginTop: 24,
          padding: "12px 28px",
          background: "#000",
          color: "#fff",
          border: "1.5px solid #000",
          fontWeight: 600,
          letterSpacing: "0.06em",
          cursor: loggingOut ? "not-allowed" : "pointer",
          opacity: loggingOut ? 0.6 : 1,
        }}
      >
        {loggingOut ? "Logging out..." : "Logout"}
      </button>
    </main>
  );
}