"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { getBooth, priceBreakup, TAX_RATE } from "@/app/lib/booths";
import styles from "./dashboard.module.css";

// Routes yahan se change karo
const LOGIN_PATH = "/consciousmain/login";
const UPCOMING_PATH = "/consciousmain/upcomingpage";
const PAYMENTS_PATH = "/consciousmain/dashboard/payments";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});
const sans = Jost({ subsets: ["latin"], weight: ["400", "500", "600"] });

const STEPS = ["Applied", "Review", "Booth", "Payment", "Confirmed"];
const GST = Math.round(TAX_RATE * 100);
const SEATS_PER_BOOTH = 10; // har booth category mein itni seats dikhengi

// 1 = review, 2 = booth select, 3 = payment, 4 = confirmed
const stageOf = (a) => {
  if (a.status === "approved") {
    if (!a.location) return 2;
    return a.payment?.status === "paid" ? 4 : 3;
  }
  return 1;
};

const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
const fmt = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

// "#ConsciousEffort India, Hyderabad" -> "Hyderabad" (agar app.city na ho)
const cityOf = (a) =>
  a.city || (a.eventTitle?.includes(",") ? a.eventTitle.split(",").pop().trim() : "");

const STATUS_LABEL = {
  pending: "Pending",
  shortlisted: "Shortlisted",
  approved: "Approved",
  rejected: "Rejected",
};

/* ================= ICONS ================= */
const Svg = ({ size = 20, children, fill = "none", sw = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor"
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const I = {
  rupee: (s) => (<Svg size={s}><path d="M6 4h12M6 9h12M6 4c6 0 8 2 8 5s-2 5-8 5l7 6" /></Svg>),
  check: (s) => (<Svg size={s} sw={2.6}><polyline points="5 12 10 17 19 7" /></Svg>),
  checkCircle: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="currentColor" />
      <polyline points="7 12.5 10.5 16 17 9" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  pin: (s) => (
    <Svg size={s}>
      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </Svg>
  ),
  receipt: (s) => (
    <Svg size={s}>
      <rect x="4" y="3" width="16" height="18" rx="2.5" />
      <path d="M8 8h3M8 12h8M8 16h8" />
    </Svg>
  ),
  calendar: (s) => (
    <Svg size={s}>
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M3 10h18M8 3v4M16 3v4" />
      <path d="M8 14h.01M12 14h.01M16 14h.01" strokeWidth="2.6" />
    </Svg>
  ),
  lock: (s) => (
    <Svg size={s}>
      <rect x="5" y="11" width="14" height="10" rx="2.5" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </Svg>
  ),
  arrow: (s) => (
    <Svg size={s} sw={2}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </Svg>
  ),
  back: (s) => (
    <Svg size={s} sw={2}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </Svg>
  ),
  ticket: (s) => (
    <Svg size={s} sw={1.5}>
      <path d="M3 8.5a2 2 0 0 0 0 3.5 2 2 0 0 0 0 3.5V18h18v-2.5a2 2 0 0 1 0-3.5 2 2 0 0 1 0-3.5V6H3v2.5z" />
      <path d="M15 6v12" strokeDasharray="2 2.4" />
    </Svg>
  ),
  tag: (s) => (
    <Svg size={s}>
      <path d="M3 12V4h8l10 10-8 8L3 12z" />
      <circle cx="7.5" cy="8.5" r="1" />
    </Svg>
  ),
  box: (s) => (
    <Svg size={s}>
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
      <path d="M4 7.5l8 4.5 8-4.5M12 12v9" />
    </Svg>
  ),
  layers: (s) => (
    <Svg size={s}>
      <polygon points="12 3 3 8 12 13 21 8 12 3" />
      <polyline points="3 13 12 18 21 13" />
    </Svg>
  ),
  table: (s) => (
    <Svg size={s}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18M9 9v11" />
    </Svg>
  ),
  chair: (s) => (
    <Svg size={s}>
      <path d="M7 3v9h10V3M5 12h14M7 12v9M17 12v9" />
    </Svg>
  ),
  plug: (s) => (
    <Svg size={s}>
      <path d="M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0V8zM12 17v4" />
    </Svg>
  ),
  spot: (s) => (
    <Svg size={s}>
      <circle cx="12" cy="9" r="5" />
      <path d="M9.5 15.5V20h5v-4.5M10 22h4" />
    </Svg>
  ),
  dot: (s) => (<Svg size={s}><circle cx="12" cy="12" r="2.2" /></Svg>),
};

// booth feature ke naam se icon chun lo
const featIcon = (key, s = 18) => {
  const t = String(key).toLowerCase();
  if (/location|where|zone/.test(t)) return I.pin(s);
  if (/reel|tag|collab/.test(t)) return I.calendar(s);
  if (/fascia/.test(t)) return I.layers(s);
  if (/octonorm|stall|built|booth/.test(t)) return I.box(s);
  if (/rack|table/.test(t)) return I.table(s);
  if (/chair/.test(t)) return I.chair(s);
  if (/plug|power|electric/.test(t)) return I.plug(s);
  if (/spot|light/.test(t)) return I.spot(s);
  return I.dot(s);
};

const TAG_TONE = {
  starter: "pillStarter",
  popular: "pillPopular",
  prime: "pillPrime",
  "ultra prime": "pillUltra",
};
const tagClass = (t) => styles[TAG_TONE[String(t || "").toLowerCase()] || "pillDefault"];

/* ================= STEPPER ================= */
function Stepper({ stage }) {
  return (
    <ol className={styles.stepper}>
      {STEPS.map((s, i) => {
        const done = i < stage || stage === 4;
        const current = i === stage && stage < 4;
        return (
          <li key={s} className={`${styles.step} ${done ? styles.stepDone : ""} ${current ? styles.stepCurrent : ""}`}>
            <span className={styles.dot}>{done ? I.check(16) : i + 1}</span>
            <span className={styles.stepLabel}>{s}</span>
          </li>
        );
      })}
    </ol>
  );
}

/* ================= BOOTH STAGE (ticket-style seat map + booking summary) ================= */
function BoothStage({ app, booths, taken, busy, pickErr, onContinue, innerRef }) {
  // sel = { name, no }  (no = sirf dikhane ke liye seat number; backend mein booth ka naam save hota hai)
  const [sel, setSel] = useState(null);

  const takenForEvent = taken?.[app.eventTitle] || {};
  const stockOf = () => SEATS_PER_BOOTH; // har booth ke 10 seats
  const bookedOf = (b) => Math.min(takenForEvent[b.name] || 0, stockOf(b));
  const leftOf = (b) => Math.max(stockOf(b) - bookedOf(b), 0);

  const selIndex = sel ? booths.findIndex((b) => b.name === sel.name) : -1;
  const selBooth = selIndex >= 0 ? booths[selIndex] : null;
  const selSoldOut = selBooth ? leftOf(selBooth) === 0 : false;
  const br = selBooth ? priceBreakup(selBooth) : null;

  return (
    <section className={styles.boothSection} ref={innerRef}>
      <div className={styles.boothHead}>
        <span className={styles.ticketIc}>{I.ticket(46)}</span>
        <div>
          <h3 className={`${styles.boothTitle} ${serif.className}`}>Choose Your Booth</h3>
          <p className={styles.muted}>Pick a seat in the booth category that fits your brand, just like booking a ticket.</p>
        </div>
      </div>

      <div className={styles.boothLayout}>
        {/* ---------- seat map ---------- */}
        <div className={styles.seatCard}>
          <div className={styles.seatTop}>
            <h4 className={`${styles.seatHeading} ${serif.className}`}>Select Your Booth</h4>
            <ul className={styles.legend} aria-label="Seat legend">
              <li><i className={`${styles.lgBox} ${styles.lgFree}`} />Available</li>
              <li><i className={`${styles.lgBox} ${styles.lgSel}`} />Selected</li>
              <li><i className={`${styles.lgBox} ${styles.lgBooked}`} />Booked</li>
            </ul>
          </div>

          <ul className={styles.tiers}>
            {booths.map((b, i) => {
              const stock = stockOf(b);
              const booked = bookedOf(b);
              const left = leftOf(b);
              const soldOut = left === 0;
              const low = left > 0 && left <= 2;
              const firstBooked = stock - booked; // is number ke baad ki seats booked

              return (
                <li key={b.id} className={`${styles.tier} ${soldOut ? styles.tierSold : ""}`}>
                  <div className={styles.tierHead}>
                    <span className={styles.rowBadge}>B{i + 1}</span>

                    <div className={styles.tierInfo}>
                      <div className={styles.tierName}>
                        <h4 className={serif.className}>{b.name}</h4>
                        {b.tag && <span className={`${styles.pill} ${tagClass(b.tag)}`}>{b.tag}</span>}
                        {(soldOut || low) && (
                          <span className={`${styles.stockNote} ${soldOut ? styles.stockNoteSold : ""}`}>
                            {soldOut ? "Sold out" : `Only ${left} left`}
                          </span>
                        )}
                      </div>
                      <p className={styles.tierPrice}>
                        <strong>{inr(b.price)}</strong> <span>+ {GST}% GST</span>
                      </p>
                    </div>
                  </div>

                  <div className={styles.seats} role="group" aria-label={`${b.name} seats`}>
                    {Array.from({ length: stock }, (_, n) => n + 1).map((no) => {
                      const isBooked = no > firstBooked;
                      const isSel = sel?.name === b.name && sel?.no === no;
                      const label = String(no).padStart(2, "0");

                      return (
                        <button
                          key={no}
                          type="button"
                          className={`${styles.seat} ${isSel ? styles.seatOn : ""} ${isBooked ? styles.seatBooked : ""}`}
                          disabled={busy || isBooked}
                          aria-pressed={isSel}
                          aria-label={`${b.name} seat ${label}${isBooked ? ", booked" : ""}`}
                          title={isBooked ? "Booked" : `${b.name} - ${label}`}
                          onClick={() => setSel({ name: b.name, no })}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* ---------- booking summary ---------- */}
        <aside className={styles.sidePanel}>
          <h4 className={`${styles.sumHeading} ${serif.className}`}>Booking Summary</h4>

          {selBooth ? (
            <>
              <div className={styles.sumBooth}>
                <span className={styles.sumBadge}>B{selIndex + 1}</span>
                <div className={styles.sumBoothInfo}>
                  <strong className={serif.className}>{selBooth.name}</strong>
                  <span className={styles.sumSeat}>Seat {String(sel.no).padStart(2, "0")}</span>
                  {selBooth.tag && <span className={`${styles.pill} ${tagClass(selBooth.tag)}`}>{selBooth.tag}</span>}
                </div>
                <span className={styles.sumBoothPrice}>{inr(selBooth.price)}</span>
              </div>

              {br && (
                <div className={styles.sumRows}>
                  <div><span>Booth Price</span><span>{inr(br.base)}</span></div>
                  <div><span>GST ({GST}%)</span><span>{inr(br.tax)}</span></div>
                  <div className={styles.sumTotal}><span>Total Payable</span><span>{inr(br.total)}</span></div>
                </div>
              )}

              <h5 className={styles.specTitle}>Booth Details</h5>
              <dl className={styles.spec}>
                {Object.entries(selBooth.features || {}).map(([k, v]) => (
                  <div key={k}>
                    <dt>{featIcon(k)}<span>{k}</span></dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>

              <button
                type="button"
                className={styles.continueBtn}
                disabled={busy || selSoldOut}
                onClick={() => onContinue(selBooth)}
              >
                {busy ? "Saving..." : <>Continue to Payment {I.arrow(18)}</>}
              </button>
            </>
          ) : (
            <div className={styles.sideEmpty}>
              <span className={styles.sideEmptyIc}>{I.box(30)}</span>
              <strong>No booth selected</strong>
              <p>Tap an available seat to see the price, inclusions and specifications.</p>
            </div>
          )}
        </aside>
      </div>

      {pickErr && <p className={styles.pickErr} role="alert">{pickErr}</p>}
    </section>
  );
}

/* ================= PAYMENT SECTION ================= */
function PaymentSection({ boothName, ready, busy, onPay, onChange, innerRef }) {
  const [method, setMethod] = useState("upi");
  const booth = getBooth(boothName);
  const br = booth ? priceBreakup(booth) : null;

  return (
    <section className={styles.paySection} ref={innerRef}>
      <div className={styles.payHead}>
        <span className={styles.payIc}>{I.lock(20)}</span>
        <div>
          <h3 className={`${styles.payTitle} ${serif.className}`}>Complete your payment</h3>
          <p className={styles.muted}>Your booth is held for you. Booking is confirmed once payment is done.</p>
        </div>
      </div>

      <div className={styles.payGrid}>
        <div className={styles.summary}>
          <p className={styles.label}>Selected booth</p>
          <h4 className={`${styles.sumName} ${serif.className}`}>{boothName}</h4>
          {br && (
            <div className={styles.breakup}>
              <div><span>Booth price</span><span>{inr(br.base)}</span></div>
              <div><span>GST ({GST}%)</span><span>{inr(br.tax)}</span></div>
              <div className={styles.total}><span>Total</span><span>{inr(br.total)}</span></div>
            </div>
          )}
          <button type="button" className={styles.linkBtn} onClick={onChange} disabled={busy}>
            {I.back(15)} Change booth
          </button>
        </div>

        <div className={styles.form}>
          <div className={styles.methods}>
            {[["upi", "UPI"], ["card", "Card"], ["netbanking", "Net Banking"]].map(([k, l]) => (
              <button key={k} type="button"
                className={`${styles.method} ${method === k ? styles.methodOn : ""}`}
                onClick={() => setMethod(k)}>
                {l}
              </button>
            ))}
          </div>

          {method === "upi" && (
            <div className={styles.field}>
              <label>UPI ID</label>
              <input placeholder="yourname@upi" />
            </div>
          )}
          {method === "card" && (
            <div className={styles.fieldGrid}>
              <div className={`${styles.field} ${styles.span2}`}>
                <label>Card Number</label>
                <input placeholder="0000 0000 0000 0000" inputMode="numeric" />
              </div>
              <div className={styles.field}>
                <label>Expiry</label>
                <input placeholder="MM / YY" />
              </div>
              <div className={styles.field}>
                <label>CVV</label>
                <input placeholder="•••" type="password" maxLength={4} />
              </div>
            </div>
          )}
          {method === "netbanking" && (
            <div className={styles.field}>
              <label>Select Bank</label>
              <select defaultValue="">
                <option value="">Choose your bank</option>
                <option>State Bank of India</option>
                <option>HDFC Bank</option>
                <option>ICICI Bank</option>
                <option>Axis Bank</option>
              </select>
            </div>
          )}

          <button className={styles.btn} disabled={busy || !ready} onClick={() => onPay(method)}>
            {busy ? "Processing..." : `Pay ${inr(br?.total)}`}
          </button>
          <p className={styles.note}>Demo payment only. No real money is charged and no card details are saved.</p>
        </div>
      </div>
    </section>
  );
}

/* ================= APPLICATION ================= */
function AppCard({ app, booths, taken, patch, reload, notify }) {
  const stage = stageOf(app);
  const rejected = app.status === "rejected";
  const paid = app.payment?.status === "paid";
  const city = cityOf(app);

  const [busy, setBusy] = useState(false);
  const [pickErr, setPickErr] = useState("");
  const cardRef = useRef(null);
  const payRef = useRef(null);
  const boothsRef = useRef(null);
  const wantScroll = useRef(false);

  const selectedName = app.location || null;

  // Booth save hone ke baad payment section tak scroll
  useEffect(() => {
    if (!wantScroll.current || stage !== 3) return;
    wantScroll.current = false;
    const t = setTimeout(
      () => payRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      200
    );
    return () => clearTimeout(t);
  }, [stage, selectedName]);

  const scrollTo = (ref) =>
    setTimeout(() => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 300);

  const pickBooth = async (b) => {
    if (busy || paid) return;
    setPickErr("");

    if (app.location === b.name) {
      scrollTo(payRef);
      return;
    }

    setBusy(true);
    try {
      if (app.location) {
        const r = await patch({ id: app._id, action: "reset_location" });
        if (!r.ok) throw new Error(r.message || "Could not change booth");
      }
      const r = await patch({ id: app._id, action: "location", location: b.name });
      if (!r.ok) throw new Error(r.message || "Booth could not be saved");

      wantScroll.current = true;
      await reload(); // stage 3 ho jayega -> payment section khud dikh jayega
      notify(`${b.name} booth selected`);
    } catch (e) {
      setPickErr(e.message || "Something went wrong");
      notify(e.message || "Something went wrong");
      await reload();
    } finally {
      setBusy(false);
    }
  };

  const changeBooth = async () => {
    if (busy) return;
    setBusy(true);
    const r = await patch({ id: app._id, action: "reset_location" });
    await reload(); // stage 2 -> booth list wapas
    setBusy(false);
    notify(r.ok ? "You can pick another booth" : r.message || "Something went wrong");
    scrollTo(boothsRef);
  };

  const pay = async (method) => {
    if (busy) return;
    setBusy(true);
    const r = await patch({ id: app._id, action: "pay", method });
    await reload(); // stage 4 -> Booking confirmed
    setBusy(false);
    notify(r.ok ? "Payment successful" : r.message || "Payment failed");
    if (r.ok) scrollTo(cardRef);
  };

  return (
    <article className={styles.app} ref={cardRef}>
      {/* ---------- header card: title + meta + stepper ---------- */}
      <header className={styles.card}>
        <div className={styles.cardHead}>
          <div className={styles.titleWrap}>
            <span className={styles.accent} aria-hidden="true" />
            <div>
              <h3 className={`${styles.cardTitle} ${serif.className}`}>{app.eventTitle}</h3>
              <ul className={styles.meta}>
                <li title="Applied on">{I.calendar(18)}{fmt(app.createdAt)}</li>
                {city && <li>{I.pin(18)}{city}</li>}
                {app.brand && <li>{I.tag(18)}<span className={styles.cap}>{app.brand}</span></li>}
              </ul>
            </div>
          </div>

          {!(stage === 4 && paid) && (
            <span className={`${styles.badge} ${styles["b_" + app.status]}`}>
              {app.status === "approved" && I.checkCircle(18)}
              {STATUS_LABEL[app.status] || app.status}
            </span>
          )}
        </div>

        {!rejected && <Stepper stage={stage} />}
      </header>

      {/* Rejected */}
      {rejected && (
        <div className={`${styles.panel} ${styles.panelBad}`}>
          <strong>Application not selected</strong>
          <p>Your application was not selected this time. Please apply to our upcoming showcases.</p>
        </div>
      )}

      {/* Step 2: Review */}
      {stage === 1 && !rejected && (
        <div className={styles.panel}>
          <strong>Under review</strong>
          <p>Our team is reviewing your application. Booth selection opens here once it is approved.</p>
        </div>
      )}

      {/* Step 3: Booth select */}
      {stage === 2 && (
        <BoothStage app={app} booths={booths} taken={taken} busy={busy}
          pickErr={pickErr} onContinue={pickBooth} innerRef={boothsRef} />
      )}

      {/* Step 4: Payment */}
      {stage === 3 && (
        <>
          {pickErr && <p className={styles.pickErr} role="alert">{pickErr}</p>}
          <PaymentSection innerRef={payRef} boothName={selectedName} ready={!busy}
            busy={busy} onPay={pay} onChange={changeBooth} />
        </>
      )}

      {/* Step 5: Confirmed */}
      {stage === 4 && paid && (
        <div className={`${styles.panel} ${styles.panelOk}`}>
          <div className={styles.okTitle}>
            <span className={styles.okIc}>{I.checkCircle(22)}</span>
            <strong>Payment successful · Booking confirmed</strong>
          </div>
          <ul className={styles.okList}>
            <li><span className={styles.okIc}>{I.pin(20)}</span>{app.location} booth</li>
            <li>
              <span className={styles.okIc}>{I.rupee(20)}</span>
              {inr(app.payment.amount)} (incl. GST) paid via {app.payment.method?.toUpperCase()}
            </li>
            <li><span className={styles.okIc}>{I.receipt(20)}</span>Transaction ID: {app.payment.txnId}</li>
            {app.payment.paidAt && (
              <li><span className={styles.okIc}>{I.calendar(20)}</span>{fmt(app.payment.paidAt)}</li>
            )}
          </ul>
        </div>
      )}
    </article>
  );
}

/* ================= PAGE ================= */
export default function Dashboard() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [toast, setToast] = useState("");
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/dashboard", { cache: "no-store" });
    if (res.status === 401) {
      router.replace(LOGIN_PATH);
      return null;
    }
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(j.message || "Failed to load");
      return null;
    }
    setErr("");
    setData(j);
    return j;
  }, [router]);

  useEffect(() => { load(); }, [load]);

  const notify = (m) => {
    setToast(m);
    setTimeout(() => setToast(""), 2800);
  };

  const patch = async (body) => {
    const res = await fetch("/api/dashboard", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const j = await res.json().catch(() => ({}));
    return { ok: res.ok, message: j.message };
  };

  const apps = data?.applications || [];

  return (
    <div className={`${styles.shell} ${sans.className}`}>
      <main className={styles.main}>
        <div className={styles.pageHead}>
          <p className={styles.eyebrow}>EVENT APPLICATIONS</p>
          <h1 className={`${styles.h1} ${serif.className}`}>My Applications</h1>
          <p className={styles.sub}>Track, manage, and book your showcase application in one place.</p>
        </div>

        <div className={styles.toolbar}>
          <nav className={styles.tabs} aria-label="Application sections">
            <span className={`${styles.tab} ${styles.tabOn}`} aria-current="page">
              {I.ticket(22)} My Applications
            </span>
            <Link href={PAYMENTS_PATH} className={styles.tab}>
              {I.rupee(18)} Payments
            </Link>
          </nav>

          <Link href={UPCOMING_PATH} className={styles.browseBtn}>
            Browse All Showcases {I.arrow(18)}
          </Link>
        </div>

        {err && <p className={styles.errorTxt}>{err}</p>}
        {!data && !err && <p className={styles.muted}>Loading...</p>}

        {data && (
          <div className={styles.list}>
            {apps.length === 0 && (
              <div className={styles.empty}>
                <h3 className={serif.className}>No applications yet</h3>
                <p>Apply to a showcase and its status will appear here.</p>
                <Link href={UPCOMING_PATH} className={styles.btn}>
                  Browse Showcases {I.arrow(15)}
                </Link>
              </div>
            )}
            {apps.map((a) => (
              <AppCard key={a._id} app={a} booths={data.booths} taken={data.taken}
                patch={patch} reload={load} notify={notify} />
            ))}
          </div>
        )}
      </main>

      {toast && <div className={styles.toast} role="status">{toast}</div>}
    </div>
  );
}