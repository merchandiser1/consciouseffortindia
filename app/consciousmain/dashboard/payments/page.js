"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Cormorant_Garamond, Jost } from "next/font/google";
import s from "./payments.module.css";

// Routes yahan se change karo
const LOGIN_PATH = "/login";
const APPLICATIONS_PATH = "/consciousmain/dashboard";
const UPCOMING_PATH = "/upcoming-events";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});
const sans = Jost({ subsets: ["latin"], weight: ["400", "500", "600"] });

const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
const fmt = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

/* ================= ICONS ================= */
const Svg = ({ size = 20, sw = 1.8, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);
const TicketIcon = ({ size = 20 }) => (
  <Svg size={size} sw={1.5}>
    <path d="M3 8.5a2 2 0 0 0 0 3.5 2 2 0 0 0 0 3.5V18h18v-2.5a2 2 0 0 1 0-3.5 2 2 0 0 1 0-3.5V6H3v2.5z" />
    <path d="M15 6v12" strokeDasharray="2 2.4" />
  </Svg>
);
const RupeeIcon = ({ size = 18 }) => (
  <Svg size={size}><path d="M6 4h12M6 9h12M6 4c6 0 8 2 8 5s-2 5-8 5l7 6" /></Svg>
);
const ArrowIcon = ({ size = 18 }) => (
  <Svg size={size} sw={2}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></Svg>
);
const CheckIcon = ({ size = 18 }) => (
  <Svg size={size} sw={2.6}><polyline points="5 12 10 17 19 7" /></Svg>
);
const ClockIcon = ({ size = 20 }) => (
  <Svg size={size}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Svg>
);
const WalletIcon = ({ size = 20 }) => (
  <Svg size={size}><rect x="3" y="6" width="18" height="13" rx="2.5" /><path d="M16 12.5h2M3 9.5h14" /></Svg>
);
const PinIcon = ({ size = 16 }) => (
  <Svg size={size}>
    <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </Svg>
);
const CopyIcon = ({ size = 15 }) => (
  <Svg size={size}><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></Svg>
);

/* ================= PAGE ================= */
export default function PaymentsPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [filter, setFilter] = useState("all");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/dashboard", { cache: "no-store" });
        if (res.status === 401) {
          router.replace(LOGIN_PATH);
          return;
        }
        const j = await res.json().catch(() => ({}));
        if (!alive) return;
        if (!res.ok) setErr(j.message || "Failed to load");
        else setData(j);
      } catch {
        if (alive) setErr("Failed to load");
      }
    })();
    return () => {
      alive = false;
    };
  }, [router]);

  // sirf wo applications jinke booth/payment ban chuke hain
  const items = useMemo(
    () =>
      (data?.applications || [])
        .filter((a) => a.status === "approved" && a.location && a.payment?.status)
        .sort((a, b) => {
          const pa = a.payment.status === "paid" ? 1 : 0;
          const pb = b.payment.status === "paid" ? 1 : 0;
          if (pa !== pb) return pa - pb; // pending upar
          return new Date(b.payment.paidAt || b.createdAt) - new Date(a.payment.paidAt || a.createdAt);
        }),
    [data]
  );

  const paidItems = items.filter((a) => a.payment.status === "paid");
  const pendItems = items.filter((a) => a.payment.status !== "paid");
  const totalPaid = paidItems.reduce((sum, a) => sum + (a.payment.amount || 0), 0);

  const shown = filter === "paid" ? paidItems : filter === "pending" ? pendItems : items;

  const copyTxn = async (id, txn) => {
    try {
      await navigator.clipboard.writeText(txn);
      setCopied(id);
      setTimeout(() => setCopied(""), 1800);
    } catch {
      /* clipboard block ho to chup-chaap ignore */
    }
  };

  return (
    <div className={`${s.shell} ${sans.className}`}>
      <main className={s.main}>
        {/* ---------- head ---------- */}
        <div className={s.pageHead}>
          <p className={s.eyebrow}>EVENT APPLICATIONS</p>
          <h1 className={`${s.h1} ${serif.className}`}>Payments</h1>
          <p className={s.sub}>Your payment history for showcases, all in one place.</p>
        </div>

        <div className={s.toolbar}>
          <nav className={s.tabs} aria-label="Application sections">
            <Link href={APPLICATIONS_PATH} className={s.tab}>
              <TicketIcon size={20} /> My Applications
            </Link>
            <span className={`${s.tab} ${s.tabOn}`} aria-current="page">
              <RupeeIcon size={18} /> Payments
            </span>
          </nav>

          <Link href={UPCOMING_PATH} className={s.browseBtn}>
            Browse All Showcases <ArrowIcon />
          </Link>
        </div>

        {err && <p className={s.errorTxt}>{err}</p>}
        {!data && !err && <p className={s.muted}>Loading...</p>}

        {/* ---------- empty ---------- */}
        {data && items.length === 0 && (
          <div className={s.empty}>
            <span className={s.emptyIc}><WalletIcon size={28} /></span>
            <h2 className={serif.className}>No payments yet</h2>
            <p>
              Once your application is approved and you pick a booth, the payment details for
              your booking will show up here.
            </p>
            <Link href={APPLICATIONS_PATH} className={s.btn}>
              View my applications <ArrowIcon size={15} />
            </Link>
          </div>
        )}

        {data && items.length > 0 && (
          <>
            {/* ---------- stats ---------- */}
            <div className={s.stats}>
              <div className={`${s.stat} ${s.statMain}`}>
                <span className={`${s.statIc} ${s.icGreen}`}><RupeeIcon size={22} /></span>
                <div>
                  <p className={s.statLabel}>Total paid</p>
                  <p className={s.statValue}>{inr(totalPaid)}</p>
                </div>
              </div>
              <div className={s.stat}>
                <span className={`${s.statIc} ${s.icBlue}`}><CheckIcon size={20} /></span>
                <div>
                  <p className={s.statLabel}>Bookings confirmed</p>
                  <p className={s.statValue}>{paidItems.length}</p>
                </div>
              </div>
              <div className={s.stat}>
                <span className={`${s.statIc} ${s.icAmber}`}><ClockIcon size={20} /></span>
                <div>
                  <p className={s.statLabel}>Payment pending</p>
                  <p className={s.statValue}>{pendItems.length}</p>
                </div>
              </div>
            </div>

            {/* ---------- filters ---------- */}
            <div className={s.filters} role="tablist" aria-label="Filter payments">
              {[
                ["all", "All", items.length],
                ["paid", "Paid", paidItems.length],
                ["pending", "Pending", pendItems.length],
              ].map(([k, l, n]) => (
                <button
                  key={k}
                  type="button"
                  role="tab"
                  aria-selected={filter === k}
                  className={`${s.chip} ${filter === k ? s.chipOn : ""}`}
                  onClick={() => setFilter(k)}
                >
                  {l} <span>{n}</span>
                </button>
              ))}
            </div>

            {/* ---------- list ---------- */}
            {shown.length === 0 ? (
              <div className={s.emptySmall}>Nothing here.</div>
            ) : (
              <ul className={s.txList}>
                {shown.map((a) => {
                  const paid = a.payment.status === "paid";
                  return (
                    <li key={a._id} className={`${s.txCard} ${paid ? s.txPaid : s.txPend}`}>
                      <div className={s.txTop}>
                        <div className={s.txTitleWrap}>
                          <h3 className={`${s.txTitle} ${serif.className}`}>{a.eventTitle}</h3>
                          <p className={s.txMeta}>
                            <span className={s.boothTag}><PinIcon /> {a.location} booth</span>
                            {a.brand && <span className={s.brand}>{a.brand}</span>}
                          </p>
                        </div>

                        <div className={s.txRight}>
                          <span className={`${s.badge} ${paid ? s.bPaid : s.bPend}`}>
                            {paid ? <CheckIcon size={14} /> : <ClockIcon size={14} />}
                            {paid ? "Paid" : "Payment pending"}
                          </span>
                          <p className={s.amount}>{inr(a.payment.amount)}</p>
                          <p className={s.amountNote}>incl. GST</p>
                        </div>
                      </div>

                      <dl className={s.txGrid}>
                        {paid ? (
                          <>
                            <div><dt>Method</dt><dd>{(a.payment.method || "—").toUpperCase()}</dd></div>
                            <div><dt>Paid on</dt><dd>{fmt(a.payment.paidAt)}</dd></div>
                            <div className={s.txnCell}>
                              <dt>Transaction ID</dt>
                              <dd>
                                <span className={s.txn}>{a.payment.txnId || "—"}</span>
                                {a.payment.txnId && (
                                  <button
                                    type="button"
                                    className={s.copyBtn}
                                    onClick={() => copyTxn(a._id, a.payment.txnId)}
                                    aria-label="Copy transaction ID"
                                  >
                                    {copied === a._id ? <CheckIcon size={14} /> : <CopyIcon />}
                                    {copied === a._id ? "Copied" : "Copy"}
                                  </button>
                                )}
                              </dd>
                            </div>
                          </>
                        ) : (
                          <>
                            <div><dt>Status</dt><dd>Awaiting payment</dd></div>
                            <div><dt>Applied on</dt><dd>{fmt(a.createdAt)}</dd></div>
                          </>
                        )}
                      </dl>

                      {!paid && (
                        <Link href={APPLICATIONS_PATH} className={`${s.btn} ${s.txBtn}`}>
                          Complete payment <ArrowIcon size={15} />
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </main>
    </div>
  );
}