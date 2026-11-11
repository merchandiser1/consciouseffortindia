"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./nav.css";

const BRAND_TITLE = "Saahra";
const LOGO_TEXT = "#CONSCIOUSEFFORT";
const LOGO_URL =
  "https://www.saahra.com/pages/conscious-effort-design-show-and-conclave";

// Login page now lives inside the "conscious" folder
const LOGIN_HREF = "/consciousmain/login";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Previous Events", href: "/previous-events" },
  { label: "Upcoming Events", href: "/upcoming-events" },
  { label: "Dashboard", href: "/dashboard" },
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
  const rootRef = useRef(null);
  const [primary, setPrimary] = useState(true);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  // The Home link is never shown as active
  const isActive = (href) => {
    if (href === "/") return false;
    return pathname.startsWith(href);
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

  // Lock body scroll while the drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on Esc key, and when the window is resized to desktop width
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && close();
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
                  className={`rm-nav__link ${isActive(l.href) ? "is-active" : ""}`}
                  aria-current={isActive(l.href) ? "page" : undefined}
                >
                  {l.label}
                </Link>
              ))}
            </div>

            <Link href={LOGIN_HREF} className="rm-nav__login">
              <span>Login</span>
            </Link>
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
              onClick={close}
            >
              <span>{l.label}</span>
              <Arrow />
            </Link>
          ))}
        </div>

        {/* Login button at the bottom */}
        <div className="rm-drawer__bottom">
          <Link
            href={LOGIN_HREF}
            className="rm-drawer__login"
            tabIndex={open ? 0 : -1}
            onClick={close}
          >
            Login
          </Link>
          <p className="rm-drawer__copy">© 2026 {BRAND_TITLE}</p>
        </div>
      </aside>
    </div>
  );
}