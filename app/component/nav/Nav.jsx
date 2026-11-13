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
const LOGO_TEXT = "#CONSCIOUSEFFORT";
const LOGO_URL =
  "https://www.saahra.com/pages/conscious-effort-design-show-and-conclave";

// Login + dashboard live inside the "consciousmain" folder
const LOGIN_HREF = "/consciousmain/login";
const DASHBOARD_HREF = "/consciousmain/dashboard";

// Delay so the mobile drawer can close (and unlock body scroll) first
const DRAWER_CLOSE_MS = 280;

const LINKS = [
  { label: "Home", href: "/", top: true },
  { label: "Upcoming Events", href: "/#upcoming", hash: "upcoming" },
  { label: "Previous Events", href: "/#previous", hash: "previous" },
  { label: "About", href: "/about" },
  { label: "Dashboard", href: DASHBOARD_HREF, protected: true },
];

const SECTION_IDS = ["upcoming", "previous"];

/* ------------------------------------------------------------------
   AUTH CHECK (module level => shared by ALL Nav instances)
   - in-flight dedupe: only one request at a time
   - burst guard: no new request within 2s of the last one
   - logged-in cache: no new request within 30s if user is authed
   - logged-out is NOT cached long, so right after login it re-checks
------------------------------------------------------------------- */
const BURST_GAP_MS = 2000;
const AUTHED_CACHE_MS = 30000;

let inFlight = null;
let lastResult = false;
let lastAt = 0;

async function checkAuth(force = false) {
  // Someone already asking the server -> reuse that same request
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
        lastResult = false; // server clearly says: no session
      }
      // any other error (500, timeout, bad JSON): keep the previous state

      lastAt = Date.now();
      return lastResult;
    } catch {
      return lastResult; // network error: keep previous state
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

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const rootRef = useRef(null);
  const [primary, setPrimary] = useState(true);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  // Button is ALWAYS visible: shows "Login" by default,
  // turns into "Logout" as soon as the server confirms a session.
  const [authed, setAuthed] = useState(false);
  const [loginPrompt, setLoginPrompt] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  // Active link logic:
  // - Home is never shown as active
  // - section links (#upcoming / #previous) are active while that section is on screen
  // - other links are active when the path matches
  const isActive = (link) => {
    if (link.top) return false;
    if (link.hash) return pathname === "/" && activeSection === link.hash;
    return pathname.startsWith(link.href);
  };

  // Smooth scrolling for the whole site (also covers hash navigation from other pages)
  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.scrollBehavior;
    html.style.scrollBehavior = "smooth";
    return () => {
      html.style.scrollBehavior = prev;
    };
  }, []);

  // Highlight the nav link of the section currently in the middle of the screen
  useEffect(() => {
    if (pathname !== "/") {
      setActiveSection("");
      return;
    }

    const els = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      Boolean
    );
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id;
          if (entry.isIntersecting) {
            setActiveSection(id);
          } else {
            setActiveSection((cur) => (cur === id ? "" : cur));
          }
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  // Click on "Upcoming Events" / "Previous Events"
  const onHashClick = (e, id) => {
    e.preventDefault();
    const wasOpen = open;
    close();

    // On another page: go home with the hash (browser scrolls to the section)
    if (pathname !== "/") {
      router.push(`/#${id}`);
      return;
    }

    // Already on home: smooth scroll
    setTimeout(
      () => {
        const el = document.getElementById(id);
        if (!el) return;
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.replaceState(null, "", `/#${id}`);
      },
      wasOpen ? DRAWER_CLOSE_MS : 0
    );
  };

  // Click on "Home": if already on home, smooth scroll to top
  const onHomeClick = (e) => {
    const wasOpen = open;
    close();
    if (pathname !== "/") return; // normal navigation to "/"

    e.preventDefault();
    setTimeout(
      () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        window.history.replaceState(null, "", "/");
      },
      wasOpen ? DRAWER_CLOSE_MS : 0
    );
  };

  // Ask the server (deduped + throttled) if the cookie is a valid session
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

  // Re-check on first load and after every page change (covers login / logout)
  // Only the visible (primary) Nav does this.
  useEffect(() => {
    if (!primary) return;
    refreshAuth();
  }, [pathname, primary, refreshAuth]);

  // Re-check when the tab becomes active again / page restored from back button
  useEffect(() => {
    if (!primary) return;
    const onVisible = () => {
      if (document.visibilityState === "visible") refreshAuth();
    };
    const onShow = (e) => {
      if (e.persisted) refreshAuth(true); // only for bfcache restore
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("pageshow", onShow);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pageshow", onShow);
    };
  }, [primary, refreshAuth]);

  // Dashboard link: logged in => normal navigation, otherwise show the popup
  const onProtectedClick = async (e) => {
    close();
    if (authed) return; // let <Link> navigate
    e.preventDefault();
    const ok = await refreshAuth(true); // session may have just changed
    if (ok) router.push(DASHBOARD_HREF);
    else setLoginPrompt(true);
  };

  // Picks the right click handler for each link
  const handlerFor = (l) => {
    if (l.protected) return onProtectedClick;
    if (l.hash) return (e) => onHashClick(e, l.hash);
    if (l.top) return onHomeClick;
    return close;
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
      resetAuthCache(false);
      setAuthed(false); // button turns back into "Login" immediately
      window.location.replace(
        pathname.startsWith(DASHBOARD_HREF) ? LOGIN_HREF : pathname
      );
    } catch {
      setLoggingOut(false);
      await refreshAuth(true); // logout failed: show the real state
    }
  };

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
      className={`rm-root ${poppins.variable} ${jost.variable}`}
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
                  scroll={!l.hash}
                  onClick={handlerFor(l)}
                  className={`rm-nav__link ${isActive(l) ? "is-active" : ""}`}
                  aria-current={isActive(l) ? "page" : undefined}
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
              scroll={!l.hash}
              className={`rm-drawer__link ${isActive(l) ? "is-active" : ""}`}
              tabIndex={open ? 0 : -1}
              onClick={handlerFor(l)}
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