import Link from "next/link";
import { Cabin, Poppins } from "next/font/google";
import styles from "./Footer.module.css";

const cabin = Cabin({ subsets: ["latin"], weight: ["400", "500"] });
const poppins = Poppins({ subsets: ["latin"], weight: ["500", "600"] });

const INSTAGRAM = "https://www.instagram.com/consciouseffortofficial";
const WHATSAPP = "https://wa.me/918920792438";

const EMAIL = "info@saahra.com";
const PHONE_DISPLAY = "(+91) 9871110063";
const PHONE_LINK = "tel:+919871110063";

const InstaIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 21l1.65-4.8A9 9 0 1 1 8 19.4L3 21z" />
    <path d="M9 9.2c.3 2.6 2.6 5 5.4 5.6l1.1-1.1a.8.8 0 0 1 .9-.1l1.5.8c.3.2.4.5.3.8-.4 1-1.4 1.6-2.5 1.4-3.3-.6-6-3.3-6.6-6.6-.2-1.100.4-2.100 1.400-2.500.3-.1.600 0 .800.300l.800 1.500c.1.300.1.600-.1.800L9 9.200z" />
  </svg>
);

const links = [
  { label: "Home", href: "/" },
  { label: "Upcoming Events", href: "/#upcoming" },
  { label: "Previous Events", href: "/#previous" },
  { label: "About", href: "/consciousmain/about" },
  { label: "Apply for the Event", href: "/consciousmain/upcoming" },
];

export default function Footer() {
  return (
    <footer className={`${styles.footer} ${cabin.className}`}>
      <div className={styles.container}>
        {/* Brand */}
        <div className={styles.brand}>
          <h3 className={styles.logo}>#ConsciousEffort India</h3>
          <p className={styles.tagline}>
            India’s leading sustainable fashion &amp; lifestyle event. Educating,
            engaging and empowering a community that champions conscious
            fashion and living.
          </p>
          <p className={`${styles.est} ${poppins.className}`}>
            <span />
            Est. 2017
          </p>
        </div>

        {/* Quick links */}
        <nav className={styles.col} aria-label="Footer navigation">
          <h4 className={`${styles.heading} ${poppins.className}`}>Quick Links</h4>
          <ul className={styles.list}>
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={styles.link}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Social + contact */}
        <div className={styles.col}>
          <h4 className={`${styles.heading} ${poppins.className}`}>Connect With Us</h4>
          <p className={styles.connectText}>
            Follow our journey or chat with us directly.
          </p>

          <div className={styles.social}>
            <a
              href={INSTAGRAM}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.iconBtn} ${styles.insta}`}
              aria-label="Follow us on Instagram"
            >
              <InstaIcon />
            </a>

            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.iconBtn} ${styles.wa}`}
              aria-label="Chat with us on WhatsApp"
            >
              <WhatsAppIcon />
            </a>
          </div>

          {/* Stay in Touch */}
          <div className={styles.touch}>
            <h4 className={`${styles.heading} ${poppins.className}`}>Stay in Touch</h4>
            <p className={styles.connectText}>
              Email us at{" "}
              <a href={`mailto:${EMAIL}`} className={styles.contactLink}>
                {EMAIL}
              </a>{" "}
              or please reach out to{" "}
              <a href={PHONE_LINK} className={`${styles.contactLink} ${styles.nowrap}`}>
                {PHONE_DISPLAY}
              </a>
            </p>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>© 2026 Saahra. All rights reserved.</p>
      </div>
    </footer>
  );
}