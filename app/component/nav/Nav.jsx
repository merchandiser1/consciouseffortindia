"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Poppins, Jost } from "next/font/google";
import "./nav.css";

// Fonts are loaded HERE, so no change is needed in layout.js
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jost",
  display: "swap",
});

const BRAND_TITLE = "Saahra";
const LOGO_ALT = "#ConsciousEffort India";
const LOGO_SRC = "/logo.png"; // file: public/logo.png
const LOGO_URL =
  "https://www.saahra.com/pages/conscious-effort-design-show-and-conclave";

// Login + dashboard live inside the "consciousmain" folder
const LOGIN_HREF = "/consciousmain/login";
const DASHBOARD_HREF = "/consciousmain/dashboard";
const ABOUT_HREF = "/consciousmain/about";
const APPLY_HREF = "/consciousmain/upcoming"; // "Apply for the Event" => application form
const UPCOMING_HREF = "/consciousmain/upcomingpage"; // Upcoming Events page
const PREVIOUS_HREF = "/consciousmain/previouspage"; // Previous Events page

// ✏️ UPCOMING EVENT DETAILS — yahan se edit karo
const EVENT = {
  city: "Hyderabad",
  name: "#ConsciousEffort India",
  date: "12th December, 2026",
  venue: "The Quorum, Hyderabad",
  categories: "Fashion, Fine Jewels, Accessories, Bags & Home",
};

/* ------------------------------------------------------------------
   AUTH CHECK (module level => shared by ALL Nav instances)
------------------------------------------------------------------- */
const BURST_GAP_MS = 2000;
const AUTHED_CACHE_MS = 30000;

let inFlight = null;
let lastResult = false;
let lastAt = 0;

async function checkAuth(force = false) {
  if (inFlight) return inFlight;

  if (!force) {
    const age = Date.now() - lastAt;
    if (age < BURST_GAP_MS) return lastResult;
    if (lastResult === true && age < AUTHED_CACHE_MS) return lastResult;
  }

  inFlight = (async () => {
    try {
      const res = await fetch("/api/auth/me", {
        cache: "no-store",
        credentials: "same-origin",
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.authenticated === true) {
        lastResult = true;
      } else if (res.status === 401 || data.authenticated === false) {
        lastResult = false;
      }

      lastAt = Date.now();
      return lastResult;
    } catch {
      return lastResult;
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}

function resetAuthCache(value = false) {
  lastResult = value;
  lastAt = 0;
}

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

function Chevron({ className = "" }) {
  return (
    <svg
      className={`rm-chev ${className}`}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
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

  // desktop dropdown: null | "apply" | "events"
  const [menu, setMenu] = useState(null);
  // mobile drawer accordion: "" | "apply" | "events"
  const [acc, setAcc] = useState("");

  const [authed, setAuthed] = useState(false);
  const [loginPrompt, setLoginPrompt] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const close = useCallback(() => setOpen(false), []);
  const closeMenu = useCallback(() => setMenu(null), []);

  const previousActive = pathname.startsWith(PREVIOUS_HREF);
  const upcomingActive = pathname.startsWith(UPCOMING_HREF);
  const eventsActive = previousActive || upcomingActive;
  // "/consciousmain/upcoming" exact ya uske andar ke pages (upcomingpage match nahi hoga)
  const applyActive =
    pathname === APPLY_HREF || pathname.startsWith(APPLY_HREF + "/");
  const aboutActive = pathname.startsWith(ABOUT_HREF);
  const dashActive = pathname.startsWith(DASHBOARD_HREF);

  // Smooth scrolling for the whole site
  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.scrollBehavior;
    html.style.scrollBehavior = "smooth";
    return () => {
      html.style.scrollBehavior = prev;
    };
  }, []);

  // Home click: agar already home pe ho toh smooth scroll to top
  const onHomeClick = (e) => {
    close();
    closeMenu();
    if (pathname !== "/") return;

    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.history.replaceState(null, "", "/");
  };

  const refreshAuth = useCallback(async (force = false) => {
    const ok = await checkAuth(force);
    setAuthed(ok);
    return ok;
  }, []);

  // Safety: if <Nav /> gets rendered twice, only the first one is shown
  useEffect(() => {
    const all = document.querySelectorAll("[data-rm-nav]");
    setPrimary(all[0] === rootRef.current);
  }, [pathname]);

  useEffect(() => {
    if (!primary) return;
    refreshAuth();
  }, [pathname, primary, refreshAuth]);

  useEffect(() => {
    if (!primary) return;
    const onVisible = () => {
      if (document.visibilityState === "visible") refreshAuth();
    };
    const onShow = (e) => {
      if (e.persisted) refreshAuth(true);
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("pageshow", onShow);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pageshow", onShow);
    };
  }, [primary, refreshAuth]);

  const onProtectedClick = async (e) => {
    close();
    closeMenu();
    if (authed) return;
    e.preventDefault();
    const ok = await refreshAuth(true);
    if (ok) router.push(DASHBOARD_HREF);
    else setLoginPrompt(true);
  };

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    close();
    closeMenu();
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
      if (!res.ok) throw new Error("logout failed");
      resetAuthCache(false);
      setAuthed(false);
      window.location.replace(
        pathname.startsWith(DASHBOARD_HREF) ? LOGIN_HREF : pathname
      );
    } catch {
      setLoggingOut(false);
      await refreshAuth(true);
    }
  };

  // route change => close everything
  useEffect(() => {
    setOpen(false);
    setMenu(null);
    setAcc("");
  }, [pathname]);

  // reset drawer accordion when drawer closes
  useEffect(() => {
    if (!open) setAcc("");
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open || loginPrompt ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, loginPrompt]);

  // click outside dropdown => close
  useEffect(() => {
    if (!menu) return;
    const onDown = (e) => {
      if (!e.target.closest("[data-rm-dd]")) setMenu(null);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [menu]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        close();
        setMenu(null);
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

  // helper props for a desktop dropdown wrapper
  const ddProps = (key) => ({
    "data-rm-dd": true,
    onMouseEnter: () => setMenu(key),
    onMouseLeave: () => setMenu((cur) => (cur === key ? null : cur)),
  });

  return (
    <div
      ref={rootRef}
      data-rm-nav
      suppressHydrationWarning
      className={`rm-root ${poppins.variable} ${jost.variable}`}
      style={{ display: primary ? "contents" : "none" }}
    >
      <div
        role="banner"
        className={`rm-nav ${scrolled ? "rm-nav--scrolled" : ""} ${open ? "rm-nav--open" : ""}`}
      >
        <div className="rm-nav__inner">
          {/* ROW 1: centered logo */}
          <div className="rm-nav__top" suppressHydrationWarning>
            <a href={LOGO_URL} className="rm-nav__logo" aria-label={LOGO_ALT}>
              <img src={LOGO_SRC} alt={LOGO_ALT} className="rm-nav__logoImg" />
            </a>

            {/* Hamburger (mobile only) */}
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

          {/* ROW 2: links (desktop only) */}
          <div
            className="rm-nav__bar"
            role="navigation"
            aria-label="Main navigation"
          >
            <Link href="/" onClick={onHomeClick} className="rm-nav__link">
              Home
            </Link>

            {/* Apply for Exhibition dropdown */}
            <div className="rm-dd" {...ddProps("apply")}>
              <button
                type="button"
                className={`rm-nav__link rm-dd__trigger ${
                  applyActive || menu === "apply" ? "is-active" : ""
                }`}
                aria-haspopup="true"
                aria-expanded={menu === "apply"}
                onClick={() => setMenu("apply")}
              >
                Apply for Exhibition
                <Chevron className={menu === "apply" ? "is-flipped" : ""} />
              </button>

              <div
                className={`rm-dd__wrap ${menu === "apply" ? "is-open" : ""}`}
              >
                <div className="rm-dd__panel rm-dd__panel--event">
                  <span className="rm-event__tag">Upcoming Event</span>
                  <p className="rm-event__city">{EVENT.city}</p>
                  <h4 className="rm-event__name">{EVENT.name}</h4>
                  <p className="rm-event__date">{EVENT.date}</p>

                  <ul className="rm-event__list">
                    <li>{EVENT.venue}</li>
                    <li>{EVENT.categories}</li>
                  </ul>

                  <Link
                    href={APPLY_HREF}
                    className="rm-event__btn"
                    onClick={closeMenu}
                  >
                    Apply for the Event
                  </Link>
                </div>
              </div>
            </div>

            {/* Events dropdown */}
            <div className="rm-dd" {...ddProps("events")}>
              <button
                type="button"
                className={`rm-nav__link rm-dd__trigger ${
                  eventsActive || menu === "events" ? "is-active" : ""
                }`}
                aria-haspopup="true"
                aria-expanded={menu === "events"}
                onClick={() => setMenu("events")}
              >
                Events
                <Chevron className={menu === "events" ? "is-flipped" : ""} />
              </button>

              <div
                className={`rm-dd__wrap ${menu === "events" ? "is-open" : ""}`}
              >
                <div className="rm-dd__panel rm-dd__panel--list">
                  {/* Upcoming Events => alag page */}
                  <Link
                    href={UPCOMING_HREF}
                    className={`rm-dd__item ${
                      upcomingActive ? "is-active" : ""
                    }`}
                    aria-current={upcomingActive ? "page" : undefined}
                    onClick={closeMenu}
                  >
                    Upcoming Events
                  </Link>

                  {/* Previous Events => alag page */}
                  <Link
                    href={PREVIOUS_HREF}
                    className={`rm-dd__item ${
                      previousActive ? "is-active" : ""
                    }`}
                    aria-current={previousActive ? "page" : undefined}
                    onClick={closeMenu}
                  >
                    Previous Events
                  </Link>
                </div>
              </div>
            </div>

            <Link
              href={ABOUT_HREF}
              onClick={closeMenu}
              className={`rm-nav__link ${aboutActive ? "is-active" : ""}`}
              aria-current={aboutActive ? "page" : undefined}
            >
              About
            </Link>

            <Link
              href={DASHBOARD_HREF}
              onClick={onProtectedClick}
              className={`rm-nav__link ${dashActive ? "is-active" : ""}`}
              aria-current={dashActive ? "page" : undefined}
            >
              Dashboard
            </Link>

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
        </div>
      </div>

      {/* Backdrop blur overlay */}
      <div
        className={`rm-overlay ${open ? "is-open" : ""}`}
        onClick={close}
        aria-hidden="true"
      />

      {/* Mobile drawer */}
      <aside
        id="rm-mobile-drawer"
        className={`rm-drawer ${open ? "is-open" : ""}`}
        aria-hidden={!open}
      >
        <div className="rm-drawer__head">
          <a
            href={LOGO_URL}
            className="rm-drawer__logo"
            aria-label={LOGO_ALT}
            tabIndex={open ? 0 : -1}
            onClick={close}
          >
            <img
              src={LOGO_SRC}
              alt={LOGO_ALT}
              className="rm-drawer__logoImg"
            />
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
          <Link
            href="/"
            className="rm-drawer__link"
            tabIndex={open ? 0 : -1}
            onClick={onHomeClick}
          >
            <span>Home</span>
            <Arrow />
          </Link>

          {/* Apply for Exhibition (accordion) */}
          <button
            type="button"
            className={`rm-drawer__link rm-drawer__acc ${
              acc === "apply" ? "is-open" : ""
            }`}
            tabIndex={open ? 0 : -1}
            aria-expanded={acc === "apply"}
            onClick={() => setAcc((c) => (c === "apply" ? "" : "apply"))}
          >
            <span>Apply for Exhibition</span>
            <Chevron className={acc === "apply" ? "is-flipped" : ""} />
          </button>
          <div className={`rm-acc ${acc === "apply" ? "is-open" : ""}`}>
            <div className="rm-acc__inner">
              <div className="rm-acc__event">
                <span className="rm-event__tag">Upcoming Event</span>
                <p className="rm-event__city">{EVENT.city}</p>
                <h4 className="rm-event__name">{EVENT.name}</h4>
                <p className="rm-event__date">{EVENT.date}</p>
                <ul className="rm-event__list">
                  <li>{EVENT.venue}</li>
                  <li>{EVENT.categories}</li>
                </ul>
                <Link
                  href={APPLY_HREF}
                  className="rm-event__btn"
                  tabIndex={open && acc === "apply" ? 0 : -1}
                  onClick={close}
                >
                  Apply for the Event
                </Link>
              </div>
            </div>
          </div>

          {/* Events (accordion) */}
          <button
            type="button"
            className={`rm-drawer__link rm-drawer__acc ${
              acc === "events" ? "is-open" : ""
            }`}
            tabIndex={open ? 0 : -1}
            aria-expanded={acc === "events"}
            onClick={() => setAcc((c) => (c === "events" ? "" : "events"))}
          >
            <span>Events</span>
            <Chevron className={acc === "events" ? "is-flipped" : ""} />
          </button>
          <div className={`rm-acc ${acc === "events" ? "is-open" : ""}`}>
            <div className="rm-acc__inner">
              {/* Upcoming Events => alag page */}
              <Link
                href={UPCOMING_HREF}
                className="rm-acc__link"
                tabIndex={open && acc === "events" ? 0 : -1}
                onClick={close}
              >
                Upcoming Events
              </Link>

              {/* Previous Events => alag page */}
              <Link
                href={PREVIOUS_HREF}
                className="rm-acc__link"
                tabIndex={open && acc === "events" ? 0 : -1}
                onClick={close}
              >
                Previous Events
              </Link>
            </div>
          </div>

          <Link
            href={ABOUT_HREF}
            className={`rm-drawer__link ${aboutActive ? "is-active" : ""}`}
            tabIndex={open ? 0 : -1}
            onClick={close}
          >
            <span>About</span>
            <Arrow />
          </Link>

          <Link
            href={DASHBOARD_HREF}
            className={`rm-drawer__link ${dashActive ? "is-active" : ""}`}
            tabIndex={open ? 0 : -1}
            onClick={onProtectedClick}
          >
            <span>Dashboard</span>
            <Arrow />
          </Link>
        </div>

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

      {/* "Please login" popup */}
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