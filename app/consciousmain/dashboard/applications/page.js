"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { getBooth, priceBreakup, TAX_RATE } from "@/app/lib/booths";
import styles from "./dashboard.module.css";

// Routes yahan se change karo
const LOGIN_PATH = "/login";
const UPCOMING_PATH = "/upcoming-events";
const HOME_PATH = "/";
const PAYMENTS_PATH = "/consciousmain/dashboard/payments";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});
const sans = Jost({ subsets: ["latin"], weight: ["400", "500", "600"] });

const STEPS = ["Applied", "Review", "Booth", "Payment", "Confirmed"];
const GST = Math.round(TAX_RATE * 100);

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
  grid: (s) => (
    <Svg size={s}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </Svg>
  ),
  rupee: (s) => (<Svg size={s}><path d="M6 4h12M6 9h12M6 4c6 0 8 2 8 5s-2 5-8 5l7 6" /></Svg>),
  sparkle: (s) => (
    <Svg size={s}>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
      <path d="M19 15l.7 1.8L21.5 17.5l-1.8.7L19 20l-.7-1.8-1.8-.7 1.8-.7L19 15z" />
    </Svg>
  ),
  sparkleSolid: (s) => (
    <Svg size={s} fill="currentColor" sw={0}>
      <path d="M12 2l2.2 6.8L21 11l-6.8 2.2L12 20l-2.2-6.8L3 11l6.8-2.2L12 2z" />
    </Svg>
  ),
  home: (s) => (
    <Svg size={s}>
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10h14V10" />
      <path d="M10 20v-6h4v6" />
    </Svg>
  ),
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
  card: (s) => (
    <Svg size={s}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M3 10h18M7 15h4" />
    </Svg>
  ),
  lock: (s) => (
    <Svg size={s}>
      <rect x="5" y="11" width="14" height="10" rx="2.5" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </Svg>
  ),
  clip: (s) => (
    <Svg size={s}>
      <path d="M21 11.5l-8.6 8.6a5.5 5.5 0 0 1-7.8-7.8l9-9a3.7 3.7 0 0 1 5.2 5.2l-9 9a1.8 1.8 0 0 1-2.6-2.6l8.2-8.2" />
    </Svg>
  ),
  send: (s) => (
    <Svg size={s} sw={2}>
      <path d="M21 3L10 14" />
      <path d="M21 3l-7 18-4-7-7-4 18-7z" />
    </Svg>
  ),
  chat: (s) => (
    <Svg size={s} sw={2}>
      <path d="M21 11.5a8.4 8.4 0 0 1-12.2 7.5L3 20.5l1.6-5.2A8.4 8.4 0 1 1 21 11.5z" />
    </Svg>
  ),
  min: (s) => (<Svg size={s} sw={2.4}><line x1="5" y1="12" x2="19" y2="12" /></Svg>),
  close: (s) => (
    <Svg size={s} sw={2.4}>
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </Svg>
  ),
  arrow: (s) => (
    <Svg size={s} sw={2}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
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

/* ================= BOOTH STAGE (list + selected panel) ================= */
function BoothStage({ app, booths, taken, busy, pickErr, onContinue, innerRef }) {
  const [selName, setSelName] = useState(null);
  const takenForEvent = taken?.[app.eventTitle] || {};
  const leftOf = (b) => Math.max(b.stock - (takenForEvent[b.name] || 0), 0);

  const sel = booths.find((b) => b.name === selName) || null;
  const selSoldOut = sel ? leftOf(sel) === 0 : false;

  return (
    <section className={styles.boothSection} ref={innerRef}>
      <div className={styles.boothHead}>
        <span className={styles.ticketIc}>{I.ticket(46)}</span>
        <div>
          <h3 className={`${styles.boothTitle} ${serif.className}`}>Choose Your Booth</h3>
          <p className={styles.muted}>Select a booth category that best fits your brand and showcase requirements.</p>
        </div>
      </div>

      <div className={styles.boothLayout}>
        {/* ---------- booth list ---------- */}
        <ul className={styles.rows}>
          {booths.map((b, i) => {
            const left = leftOf(b);
            const soldOut = left === 0;
            const low = left > 0 && left <= 2;
            const isSel = selName === b.name;

            return (
              <li
                key={b.id}
                className={`${styles.row} ${isSel ? styles.rowOn : ""} ${soldOut ? styles.rowSold : ""}`}
                onClick={() => !soldOut && setSelName(b.name)}
              >
                <span className={styles.rowBadge} style={{ background: b.grad }}>B{i + 1}</span>

                <div className={styles.rowName}>
                  <h4 className={serif.className}>{b.name}</h4>
                  {b.tag && <span className={`${styles.pill} ${tagClass(b.tag)}`}>{b.tag}</span>}
                  {(soldOut || low) && (
                    <span className={`${styles.stockNote} ${soldOut ? styles.stockNoteSold : ""}`}>
                      {soldOut ? "Sold out" : `Only ${left} left`}
                    </span>
                  )}
                </div>

                <p className={styles.rowPrice}>
                  <strong>{inr(b.price)}</strong> <span>+ {GST}% GST</span>
                </p>

                <button
                  type="button"
                  className={`${styles.rowBtn} ${isSel ? styles.rowBtnOn : ""}`}
                  disabled={busy || soldOut}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelName(b.name);
                  }}
                >
                  {isSel ? <>{I.check(16)} Selected</> : soldOut ? "Sold out" : "Select"}
                </button>
              </li>
            );
          })}
        </ul>

        {/* ---------- selected booth panel ---------- */}
        <aside className={styles.sidePanel}>
          {sel ? (
            <>
              <p className={styles.sideLabel}>SELECTED BOOTH</p>
              <div className={styles.sideTop}>
                <h4 className={`${styles.sideName} ${serif.className}`}>{sel.name}</h4>
                {sel.tag && <span className={`${styles.pill} ${tagClass(sel.tag)}`}>{sel.tag}</span>}
              </div>
              <p className={styles.sidePrice}>
                <strong>{inr(sel.price)}</strong> <span>+ {GST}% GST</span>
              </p>
              <div className={styles.sideRule} />

              <h5 className={styles.specTitle}>{I.box(22)} Inclusions &amp; Specifications</h5>
              <dl className={styles.spec}>
                {Object.entries(sel.features || {}).map(([k, v]) => (
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
                onClick={() => onContinue(sel)}
              >
                {busy ? "Saving..." : <>Continue to Payment {I.arrow(18)}</>}
              </button>
            </>
          ) : (
            <div className={styles.sideEmpty}>
              <span className={styles.sideEmptyIc}>{I.box(30)}</span>
              <strong>No booth selected</strong>
              <p>Select a booth from the list to see its inclusions and specifications.</p>
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
            ← Change booth
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
          <p className={styles.note}>Demo payment only — no real money is charged and no card details are saved.</p>
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
    notify(r.ok ? "Payment successful 🎉" : r.message || "Payment failed");
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

/* ================= CHATBOT ================= */
const QUICK = [
  { key: "applications", title: "My Applications", sub: "Track your event applications", icon: I.grid },
  { key: "booth", title: "Choose Booth", sub: "Pick a booth & pay", icon: I.card },
  { key: "showcases", title: "Browse Showcases", sub: "Explore upcoming events", icon: I.sparkle },
  { key: "home", title: "Back to SAAHRA", sub: "Go to homepage", icon: I.home },
];

function Chatbot({ apps, onGoPage }) {
  const [state, setState] = useState("closed"); // open | min | closed
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState([]);
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(true);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [msgs, typing, state]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setState((s) => (s === "open" ? "closed" : s));
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const reply = (q) => {
    const s = q.toLowerCase();
    const paid = apps.filter((a) => a.payment?.status === "paid").length;
    if (/pay|txn|transaction|₹|rupee/.test(s))
      return apps.length
        ? `You have ${paid} paid booking${paid === 1 ? "" : "s"}. Payment opens on your application card right after you select a booth.`
        : "No payments yet. Payment opens once your application is approved and a booth is selected.";
    if (/applic|status|approve|review/.test(s))
      return apps.length
        ? `You have ${apps.length} application${apps.length === 1 ? "" : "s"}. Scroll down to see each step.`
        : "You have no applications yet. Browse showcases and apply to get started.";
    if (/location|venue|booth|stall/.test(s))
      return "After approval, pick a booth (Woodpecker, Hummingbird, Eagle...) and tap Continue to Payment. Payment opens right after.";
    if (/show|event|browse/.test(s)) return "Opening upcoming showcases for you.";
    if (/hi|hello|hey/.test(s)) return "Hello! Ask about your applications, booths or showcases.";
    return "I can help with applications, booths and showcases. Try one of the quick options.";
  };

  const send = (raw) => {
    const q = (raw ?? text).trim();
    if (!q) return;
    setMsgs((m) => [...m, { from: "me", text: q }]);
    setText("");
    setTyping(true);
    setTimeout(() => {
      setMsgs((m) => [...m, { from: "bot", text: reply(q) }]);
      setTyping(false);
      if (/show|event|browse/.test(q.toLowerCase())) onGoPage(UPCOMING_PATH);
    }, 650);
  };

  const quick = (k) => {
    if (k === "applications" || k === "booth") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (window.innerWidth <= 900) setState("min");
      setMsgs((m) => [
        ...m,
        { from: "me", text: k === "applications" ? "My Applications" : "Choose Booth" },
        {
          from: "bot",
          text:
            k === "applications"
              ? "Your applications are right here."
              : "Pick a booth on your approved application, then tap Continue to Payment.",
        },
      ]);
    } else if (k === "showcases") onGoPage(UPCOMING_PATH);
    else onGoPage(HOME_PATH);
  };

  const toggleLauncher = () => {
    setUnread(false);
    setState((s) => (s === "open" ? "closed" : "open"));
  };

  return (
    <>
      {state !== "closed" && (
        <section className={`${styles.chat} ${state === "min" ? styles.chatMin : ""}`}
          role="dialog" aria-label="SAAHRA Assistant">
          <header className={styles.chatHead}>
            <span className={styles.botAvatar}>{I.sparkleSolid(22)}</span>
            <div className={styles.chatWho}>
              <strong>SAAHRA Assistant</strong>
              <p><i className={styles.onlineDot} /><b>Online</b> · Here to help you</p>
            </div>
            <button className={styles.chatIcBtn}
              aria-label={state === "min" ? "Expand chat" : "Minimize chat"}
              onClick={() => setState((s) => (s === "min" ? "open" : "min"))}>
              {I.min(22)}
            </button>
            <button className={styles.chatIcBtn} aria-label="Close chat" onClick={() => setState("closed")}>
              {I.close(22)}
            </button>
          </header>

          {state === "open" && (
            <>
              <div className={styles.chatBody} ref={bodyRef}>
                <div className={styles.msgRow}>
                  <span className={`${styles.botAvatar} ${styles.botSm}`}>{I.sparkleSolid(18)}</span>
                  <div className={styles.bubble}>
                    Hi there! 👋<br />I’m your SAAHRA Assistant.<br />How can I help you today?
                  </div>
                </div>

                {msgs.length === 0 && (
                  <div className={styles.quickGrid}>
                    {QUICK.map((q) => (
                      <button key={q.key} className={styles.quickCard} onClick={() => quick(q.key)}>
                        <span className={styles.quickIc}>{q.icon(26)}</span>
                        <strong>{q.title}</strong>
                        <span>{q.sub}</span>
                      </button>
                    ))}
                  </div>
                )}

                {msgs.map((m, i) =>
                  m.from === "bot" ? (
                    <div key={i} className={styles.msgRow}>
                      <span className={`${styles.botAvatar} ${styles.botSm}`}>{I.sparkleSolid(18)}</span>
                      <div className={styles.bubble}>{m.text}</div>
                    </div>
                  ) : (
                    <div key={i} className={`${styles.msgRow} ${styles.msgMe}`}>
                      <div className={`${styles.bubble} ${styles.bubbleMe}`}>{m.text}</div>
                    </div>
                  )
                )}

                {typing && (
                  <div className={styles.msgRow}>
                    <span className={`${styles.botAvatar} ${styles.botSm}`}>{I.sparkleSolid(18)}</span>
                    <div className={`${styles.bubble} ${styles.typing}`}><i /> <i /> <i /></div>
                  </div>
                )}
              </div>

              <form className={styles.chatInput} onSubmit={(e) => { e.preventDefault(); send(); }}>
                <button type="button" className={styles.attach} aria-label="Attach file">{I.clip(22)}</button>
                <input value={text} onChange={(e) => setText(e.target.value)}
                  placeholder="Type your message..." aria-label="Type your message" />
                <button type="submit" className={styles.sendBtn} aria-label="Send message">{I.send(20)}</button>
              </form>
            </>
          )}
        </section>
      )}

      <button
        className={`${styles.launcher} ${state === "open" ? styles.launcherOpen : ""}`}
        onClick={toggleLauncher}
        aria-label={state === "open" ? "Close assistant" : "Open assistant"}
      >
        {I.chat(34)}
        {unread && <i className={styles.launchDot} />}
      </button>
    </>
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

      {data && <Chatbot apps={apps} onGoPage={(href) => router.push(href)} />}

      {toast && <div className={styles.toast} role="status">{toast}</div>}
    </div>
  );
}