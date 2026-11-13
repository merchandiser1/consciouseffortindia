import Link from "next/link";
import styles from "../dashboard.module.css";

export default function PaymentsPage() {
  return (
    <>
      <header className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>Payments</h1>
          <p className={styles.pageSub}>
            Your payment history for confirmed showcases will appear here.
          </p>
        </div>
      </header>

      <div className={styles.empty}>
        <h2 className={styles.emptyTitle}>No payments yet</h2>
        <p className={styles.emptyText}>
          Once your application is approved, the payment details for your
          booking will show up here.
        </p>
        <Link href="/consciousmain/dashboard" className={styles.primaryBtn}>
          View my applications
        </Link>
      </div>
    </>
  );
}