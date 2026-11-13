"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Jost, Cormorant_Garamond } from "next/font/google";
import styles from "./dashboard.module.css";

const jost = Jost({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ui",
  display: "swap",
});

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-serif",
  display: "swap",
});

const BRAND = "#CONSCIOUSEFFORT";
const BASE = "/consciousmain/dashboard";
const LOGIN_HREF = "/consciousmain/login";

/* ---------- Icons ---------- */
const Svg = ({ children, size = 20 }) => (
  <svg
    className={styles.icon}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const HomeIcon = (p) => (
  <Svg {...p}>
    <path d="M3 11l9-8 9 8" />
    <path d="M5 10v10h5v-6h4v6h5V10" />
  </Svg>
);
const GridIcon = (p) => (
  <Svg {...p}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.6" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.6" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.6" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.6" />
  </Svg>
);
const RupeeIcon = (p) => (
  <Svg {...p}>
    <path d="M7 4h11M7 9h11M7 4c6 0 8 2 8 5s-2 5-8 5l7 6" />
  </Svg>
);
const SparkIcon = (p) => (
  <Svg {...p}>
    <path d="M12 3l2.2 6.2L20.5 12l-6.3 2.8L12 21l-2.2-6.2L3.5 12l6.3-2.8z" />
  </Svg>
);
const LogoutIcon = (p) => (
  <Svg {...p}>
    <path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4" />
    <path d="M16 8l4 4-4 4M20 12H9" />
  </Svg>
);

/* Desktop sidebar order */
const LINKS = [
  { label: "Home", href: "/", Icon: HomeIcon },
  { label: "My Applications", href: `${BASE}/applications`, Icon: GridIcon },
  { label: "Payments", href: `${BASE}/payments`, Icon: RupeeIcon },
  { label: "Browse Showcases", href: `${BASE}/showcases`, Icon: SparkIcon },
];

/* Mobile bottom tab order (Home last, like a mobile app) */
const TABS = [
  { label: "Applications", href: `${BASE}/applications`, Icon: GridIcon },
  { label: "Payments", href: `${BASE}/payments`, Icon: RupeeIcon },
  { label: "Showcases", href: `${BASE}/showcases`, Icon: SparkIcon },
  { label: "Home", href: "/", Icon: HomeIcon },
];

export default function DashboardShell({ user, children }) {
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);

  const isActive = (l) => l.href !== "/" && pathname.startsWith(l.href);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
      if (!res.ok) throw new Error("logout failed");
      window.location.replace(LOGIN_HREF);
    } catch {
      setLoggingOut(false);
    }
  };

  const initial = (user?.username || "U").trim().charAt(0).toUpperCase();

  return (
    <div className={`${styles.shell} ${jost.variable} ${serif.variable}`}>
      {/* ---------- Mobile top bar (brand + logout, no hamburger) ---------- */}
      <header className={styles.topbar}>
        <Link href="/" className={styles.topBrand}>
          {BRAND}
        </Link>
        <button
          type="button"
          className={styles.topLogout}
          aria-label="Logout"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          <LogoutIcon size={18} />
        </button>
      </header>

      {/* ---------- Desktop sidebar ---------- */}
      <aside className={styles.sidebar} aria-label="Dashboard menu">
        <div className={styles.sideHead}>
          <Link href="/" className={styles.brand}>
            {BRAND}
          </Link>
        </div>

        <p className={styles.menuLabel}>MENU</p>

        <nav className={styles.nav} aria-label="Dashboard navigation">
          {LINKS.map((l) => {
            const active = isActive(l);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`${styles.link} ${active ? styles.linkActive : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <l.Icon />
                <span>{l.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.bottom}>
          <div className={styles.userCard}>
            <div className={styles.avatar}>{initial}</div>
            <div className={styles.userText}>
              <strong className={styles.userName}>{user?.username}</strong>
              <span className={styles.userEmail}>{user?.email}</span>
            </div>
          </div>

          <button
            type="button"
            className={styles.logout}
            onClick={handleLogout}
            disabled={loggingOut}
          >
            <LogoutIcon />
            <span>{loggingOut ? "Logging out..." : "Logout"}</span>
          </button>
        </div>
      </aside>

      {/* ---------- Page content ---------- */}
      <main className={styles.main}>
        <div className={styles.card}>{children}</div>
      </main>

      {/* ---------- Mobile bottom tab bar ---------- */}
      <nav className={styles.tabbar} aria-label="Dashboard tabs">
        {TABS.map((t) => {
          const active = isActive(t);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`${styles.tab} ${active ? styles.tabActive : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <t.Icon size={22} />
              <span>{t.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}