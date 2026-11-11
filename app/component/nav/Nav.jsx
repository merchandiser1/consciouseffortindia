"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import "./nav.css";

const BRAND_TITLE = "Saahra";
const LOGO_TEXT = "#CONSCIOUSEFFORT";
const LOGO_URL =
  "https://www.saahra.com/pages/conscious-effort-design-show-and-conclave";

// Login + dashboard live inside the "consciousmain" folder
const LOGIN_HREF = "/consciousmain/login";
const DASHBOARD_HREF = "/consciousmain/dashboard";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Previous Events", href: "/previous-events" },
  { label: "Upcoming Events", href: "/upcoming-events" },
  { label: "Dashboard", href: DASHBOARD_HREF, protected: true },
];

function Arrow() {
  return (
    <svg
      className="rm-drawer__arrow"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const rootRef = useRef(null);
  const [primary, setPrimary] = useState(true);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Button is ALWAYS visible: shows "Login" by default,
  // turns into "Logout" as soon as the server confirms a session.
  const [authed, setAuthed] = useState(false);
  const [loginPrompt, setLoginPrompt] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  // The Home link is never shown as active
  const isActive = (href) => {
    if (href === "/") return false;
    return pathname.startsWith(href);
  };

  // Ask the server if the cookie is a valid session
  const refreshAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", {
        cache: "no-store",
        credentials: "same-origin",
      });
      setAuthed(res.ok);
      return res.ok;
    } catch {
      return false; // network error: keep whatever the button shows now
    }
  }, []);

  // Re-check on first load and after every page change (covers login / logout)
  useEffect(() => {
    refreshAuth();
  }, [pathname, refreshAuth]);

  // Re-check when the tab becomes active again / page restored from back button
  useEffect(() => {
    const onVisible = () => document.visibilityState === "visible" && refreshAuth();
    const onShow = () => refreshAuth();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onShow);
    window.addEventListener("pageshow", onShow);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onShow);
      window.removeEventListener("pageshow", onShow);
    };
  }, [refreshAuth]);

  // Dashboard link: logged in => normal navigation, otherwise show the popup
  const onProtectedClick = async (e) => {
    close();
    if (authed) return; // let <Link> navigate
    e.preventDefault();
    const ok = await refreshAuth(); // re-check, session may have just changed
    if (ok) router.push(DASHBOARD_HREF);
    else setLoginPrompt(true);
  };

  // Tap on "Logout": clear the cookie, then reload so every page forgets the session
  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    close();
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
      if (!res.ok) throw new Error("logout failed");
      setAuthed(false); // button turns back into "Login" immediately
      window.location.replace(
        pathname.startsWith(DASHBOARD_HREF) ? LOGIN_HREF : pathname
      );
    } catch {
      setLoggingOut(false);
      await refreshAuth(); // logout failed: show the real state
    }
  };

  // Safety: if <Nav /> gets rendered twice, only the first one is shown
  useEffect(() => {
    const all = document.querySelectorAll("[data-rm-nav]");
    setPrimary(all[0] === rootRef.current);
  }, [pathname]);

  // Close the drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Track scrolled state
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the drawer or popup is open
  useEffect(() => {
    document.body.style.overflow = open || loginPrompt ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, loginPrompt]);

  // Close on Esc key, and when the window is resized to desktop width
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        close();
        setLoginPrompt(false);
      }
    };
    const onResize = () => window.innerWidth > 991 && close();
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [close]);

  return (
    <div
      ref={rootRef}
      data-rm-nav
      style={{ display: primary ? "contents" : "none" }}
    >
      <div
        role="banner"
        className={`rm-nav ${scrolled ? "rm-nav--scrolled" : ""} ${open ? "rm-nav--open" : ""}`}
      >
        <div className="rm-nav__inner">
          {/* Logo: #CONSCIOUSEFFORT */}
          <a href={LOGO_URL} className="rm-nav__logo">
            {LOGO_TEXT}
          </a>

          {/* Right side */}
          <div className="rm-nav__right">
            <div
              className="rm-nav__links"
              role="navigation"
              aria-label="Main navigation"
            >
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={l.protected ? onProtectedClick : undefined}
                  className={`rm-nav__link ${isActive(l.href) ? "is-active" : ""}`}
                  aria-current={isActive(l.href) ? "page" : undefined}
                >
                  {l.label}
                </Link>
              ))}
            </div>

            {/* One button: Login <-> Logout (never hidden) */}
            {authed ? (
              <button
                type="button"
                className="rm-nav__login"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                <span>Logout</span>
              </button>
            ) : (
              <Link href={LOGIN_HREF} className="rm-nav__login">
                <span>Login</span>
              </Link>
            )}
          </div>

          {/* Hamburger */}
          <button
            type="button"
            className="rm-burger"
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="rm-mobile-drawer"
            onClick={() => setOpen(true)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Backdrop blur overlay */}
      <div
        className={`rm-overlay ${open ? "is-open" : ""}`}
        onClick={close}
        aria-hidden="true"
      />

      {/* Mobile drawer: slides in from the left (white) */}
      <aside
        id="rm-mobile-drawer"
        className={`rm-drawer ${open ? "is-open" : ""}`}
        aria-hidden={!open}
      >
        {/* Top row: logo text + close button */}
        <div className="rm-drawer__head">
          <a
            href={LOGO_URL}
            className="rm-drawer__logo"
            tabIndex={open ? 0 : -1}
            onClick={close}
          >
            {LOGO_TEXT}
          </a>
          <button
            type="button"
            className="rm-close"
            aria-label="Close menu"
            tabIndex={open ? 0 : -1}
            onClick={close}
          >
            <span />
            <span />
          </button>
        </div>

        <div
          className="rm-drawer__links"
          role="navigation"
          aria-label="Mobile navigation"
        >
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rm-drawer__link ${isActive(l.href) ? "is-active" : ""}`}
              tabIndex={open ? 0 : -1}
              onClick={l.protected ? onProtectedClick : close}
            >
              <span>{l.label}</span>
              <Arrow />
            </Link>
          ))}
        </div>

        {/* Login / Logout button at the bottom (same button, never hidden) */}
        <div className="rm-drawer__bottom">
          {authed ? (
            <button
              type="button"
              className="rm-drawer__login"
              tabIndex={open ? 0 : -1}
              onClick={handleLogout}
              disabled={loggingOut}
            >
              Logout
            </button>
          ) : (
            <Link
              href={LOGIN_HREF}
              className="rm-drawer__login"
              tabIndex={open ? 0 : -1}
              onClick={close}
            >
              Login
            </Link>
          )}
          <p className="rm-drawer__copy">© 2026 {BRAND_TITLE}</p>
        </div>
      </aside>

      {/* "Please login" popup (shown when a logged-out user clicks Dashboard) */}
      {loginPrompt && (
        <div className="rm-modal-overlay" onClick={() => setLoginPrompt(false)}>
          <div
            className="rm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rm-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="rm-modal__x"
              aria-label="Close"
              onClick={() => setLoginPrompt(false)}
            >
              <span />
              <span />
            </button>
            <h3 id="rm-modal-title" className="rm-modal__title">
              Please login
            </h3>
            <p className="rm-modal__text">
              You need to be logged in to open your dashboard.
            </p>
            <Link
              href={LOGIN_HREF}
              className="rm-modal__btn"
              onClick={() => setLoginPrompt(false)}
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}