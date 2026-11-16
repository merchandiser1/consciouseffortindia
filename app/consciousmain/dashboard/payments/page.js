import Link from "next/link";
import { Cormorant_Garamond, Jost } from "next/font/google";
import styles from "../dashboard.module.css";

// Routes yahan se change karo
const APPLICATIONS_PATH = "/consciousmain/dashboard";
const PAYMENTS_PATH = "/consciousmain/dashboard/payments";
const UPCOMING_PATH = "/upcoming-events";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});
const sans = Jost({ subsets: ["latin"], weight: ["400", "500", "600"] });

const TicketIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 8.5a2 2 0 0 0 0 3.5 2 2 0 0 0 0 3.5V18h18v-2.5a2 2 0 0 1 0-3.5 2 2 0 0 1 0-3.5V6H3v2.5z" />
    <path d="M15 6v12" strokeDasharray="2 2.4" />
  </svg>
);

const RupeeIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 4h12M6 9h12M6 4c6 0 8 2 8 5s-2 5-8 5l7 6" />
  </svg>
);

const ArrowIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

export default function PaymentsPage() {
  return (
    <div className={`${styles.shell} ${sans.className}`}>
      <main className={styles.main}>
        <div className={styles.pageHead}>
          <p className={styles.eyebrow}>EVENT APPLICATIONS</p>
          <h1 className={`${styles.h1} ${serif.className}`}>Payments</h1>
          <p className={styles.sub}>
            Your payment history for confirmed showcases will appear here.
          </p>
        </div>

        <div className={styles.toolbar}>
          <nav className={styles.tabs} aria-label="Application sections">
            <Link href={APPLICATIONS_PATH} className={styles.tab}>
              <TicketIcon /> My Applications
            </Link>
            <span className={`${styles.tab} ${styles.tabOn}`} aria-current="page">
              <RupeeIcon /> Payments
            </span>
          </nav>

          <Link href={UPCOMING_PATH} className={styles.browseBtn}>
            Browse All Showcases <ArrowIcon />
          </Link>
        </div>

        <div className={styles.empty}>
          <h2 className={serif.className}>No payments yet</h2>
          <p>
            Once your application is approved, the payment details for your
            booking will show up here.
          </p>
          <Link href={APPLICATIONS_PATH} className={styles.btn}>
            View my applications <ArrowIcon size={15} />
          </Link>
        </div>
      </main>
    </div>
  );
}