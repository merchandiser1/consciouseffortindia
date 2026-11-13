"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Jost, Cormorant_Garamond } from "next/font/google";
import styles from "./admin.module.css";

const jost = Jost({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-ui", display: "swap" });
const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-serif", display: "swap" });

const BRAND = "#CONSCIOUSEFFORT";
const BASE = "/admin/dashboard";

const Svg = ({ children, size = 20 }) => (
  <svg className={styles.icon} width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);
const OverviewIcon = (p) => (
  <Svg {...p}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.6" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.6" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.6" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.6" />
  </Svg>
);
const AppsIcon = (p) => (
  <Svg {...p}><path d="M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-10A.5.5 0 0 1 7 20V3.5z" /><path d="M14 3.5V8h4M10 12h5M10 16h5" /></Svg>
);
const RupeeIcon = (p) => (
  <Svg {...p}><path d="M7 4h11M7 9h11M7 4c6 0 8 2 8 5s-2 5-8 5l7 6" /></Svg>
);
const HomeIcon = (p) => (
  <Svg {...p}><path d="M3 11l9-8 9 8" /><path d="M5 10v10h5v-6h4v6h5V10" /></Svg>
);
const LogoutIcon = (p) => (
  <Svg {...p}><path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4" /><path d="M16 8l4 4-4 4M20 12H9" /></Svg>
);

export default function AdminShell({ payBadge = 0, children }) {
  const pathname = usePathname();
  const [busy, setBusy] = useState(false);

  const links = [
    { label: "Overview", href: `${BASE}/overview`, Icon: OverviewIcon },
    { label: "Applications", href: `${BASE}/applications`, Icon: AppsIcon },
    { label: "Payments", href: `${BASE}/payments`, Icon: RupeeIcon, badge: payBadge },
    { label: "View Website", href: "/", Icon: HomeIcon, external: true },
  ];

  const isActive = (l) => !l.external && pathname.startsWith(l.href);

  const logout = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await fetch("/api/admin/auth/logout", { method: "POST", credentials: "same-origin" });
    } finally {
      window.location.replace("/admin/login");
    }
  };

  return (
    <div className={`${styles.shell} ${jost.variable} ${serif.variable}`}>
      <header className={styles.topbar}>
        <Link href="/" className={styles.topBrand}>
          {BRAND} <em className={styles.pill}>Admin</em>
        </Link>
        <button type="button" className={styles.topLogout} onClick={logout} disabled={busy} aria-label="Logout">
          <LogoutIcon size={18} />
        </button>
      </header>

      <aside className={styles.sidebar} aria-label="Admin menu">
        <div className={styles.sideHead}>
          <Link href="/" className={styles.brand}>{BRAND}</Link>
          <span className={styles.pill}>Admin</span>
        </div>

        <p className={styles.menuLabel}>MENU</p>
        <nav className={styles.nav}>
          {links.map((l) => {
            const active = isActive(l);
            return (
              <Link key={l.href} href={l.href}
                className={`${styles.link} ${active ? styles.linkActive : ""}`}
                aria-current={active ? "page" : undefined}>
                <l.Icon />
                <span>{l.label}</span>
                {l.badge > 0 && <b className={styles.badgeCount}>{l.badge}</b>}
              </Link>
            );
          })}
        </nav>

        <div className={styles.bottom}>
          <div className={styles.userCard}>
            <div className={styles.avatar}>A</div>
            <div className={styles.userText}>
              <strong className={styles.userName}>Admin</strong>
              <span className={styles.userEmail}>Admin Panel</span>
            </div>
          </div>
          <button type="button" className={styles.logout} onClick={logout} disabled={busy}>
            <LogoutIcon />
            <span>{busy ? "Logging out..." : "Logout"}</span>
          </button>
        </div>
      </aside>

      <main className={styles.main}>{children}</main>

      <nav className={styles.tabbar} aria-label="Admin tabs">
        {links.map((l) => {
          const active = isActive(l);
          return (
            <Link key={l.href} href={l.href} className={`${styles.tab} ${active ? styles.tabActive : ""}`}>
              <l.Icon size={22} />
              <span>{l.label === "View Website" ? "Website" : l.label}</span>
              {l.badge > 0 && <b className={styles.tabBadge}>{l.badge}</b>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}