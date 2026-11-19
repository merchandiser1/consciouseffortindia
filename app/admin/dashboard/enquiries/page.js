"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./Enquiries.module.css";

export default function EnquiriesPage() {
  /* ================= STATE ================= */
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  /* ================= FUNCTIONS ================= */

  // 10 digit number ho toh 91 laga do
  const waNumber = (phone) => {
    const d = String(phone || "").replace(/\D/g, "");
    return d.length === 10 ? `91${d}` : d;
  };

  // date format
  const fmtDate = (iso) =>
    new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // aaj ki enquiry hai ya nahi
  const isToday = (iso) => new Date(iso).toDateString() === new Date().toDateString();

  // whatsapp link
  const getWaLink = (e) =>
    `https://wa.me/${waNumber(e.phone)}?text=${encodeURIComponent(
      `Hello ${e.name}, thank you for contacting #ConsciousEffort India.`
    )}`;

  // gmail compose link
  const getMailLink = (e) => {
    const subject = "Reply to your enquiry - #ConsciousEffort India";
    const body = `Hello ${e.name},\n\nThank you for contacting #ConsciousEffort India.\n\n`;
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      e.email
    )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // saari enquiries fetch karo
  const loadEnquiries = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/enquiry", {
        credentials: "same-origin",
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load enquiries");
      }
      setItems(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiries();
  }, []);

  // search filter
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((e) =>
      [e.name, e.email, e.phone, e.message].some((v) =>
        String(v || "").toLowerCase().includes(s)
      )
    );
  }, [items, q]);

  // stats
  const todayCount = useMemo(() => items.filter((e) => isToday(e.createdAt)).length, [items]);

  /* ================= UI ================= */
  return (
    <section className={styles.wrap}>
      {/* ---------- header ---------- */}
      <div className={styles.head}>
        <div>
          <p className={styles.eyebrow}>
            <span />
            Inbox
          </p>
          <h1 className={styles.title}>
            Your <em>Enquiries</em>
          </h1>
          <p className={styles.sub}>Reply to your visitors by call, WhatsApp or email.</p>
        </div>

        <div className={styles.searchBox}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            type="search"
            className={styles.search}
            placeholder="Search name, email, phone..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      {/* ---------- stats ---------- */}
      <div className={styles.stats}>
        <div className={styles.stat}>
          <div className={`${styles.statIcon} ${styles.sGold}`}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9a1.5 1.5 0 0 1-1.5 1.5H10l-4.5 4v-4A1.5 1.5 0 0 1 4 14.5v-9z" />
              <path d="M8 8.5h8M8 12h5" />
            </svg>
          </div>
          <div>
            <strong>{loading ? "-" : items.length}</strong>
            <span>Total Enquiries</span>
          </div>
        </div>

        <div className={styles.stat}>
          <div className={`${styles.statIcon} ${styles.sGreen}`}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
              <path d="M3.5 10h17M8 3v4M16 3v4" />
            </svg>
          </div>
          <div>
            <strong>{loading ? "-" : todayCount}</strong>
            <span>Received Today</span>
          </div>
        </div>

        <div className={styles.stat}>
          <div className={`${styles.statIcon} ${styles.sBlue}`}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
          </div>
          <div>
            <strong>{loading ? "-" : filtered.length}</strong>
            <span>Showing Now</span>
          </div>
        </div>
      </div>

      {/* ---------- error / empty / loading ---------- */}
      {error && <p className={styles.error}>{error}</p>}

      {loading && (
        <div className={styles.list}>
          {[0, 1, 2].map((i) => (
            <div key={i} className={`${styles.card} ${styles.skeleton}`} />
          ))}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className={styles.empty}>
          <p>No enquiries found.</p>
        </div>
      )}

      {/* ---------- list ---------- */}
      <div className={styles.list}>
        {filtered.map((e) => (
          <article key={e._id} className={styles.card}>
            {isToday(e.createdAt) && <span className={styles.newBadge}>New</span>}

            <div className={styles.top}>
              <div className={styles.who}>
                <h3>{e.name}</h3>
                <span>
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                  {fmtDate(e.createdAt)}
                </span>
              </div>
            </div>

            <ul className={styles.meta}>
              <li>
                <span className={`${styles.chip} ${styles.chipPhone}`}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
                    strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.8a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
                  </svg>
                </span>
                <a href={`tel:${e.phone}`}>{e.phone}</a>
              </li>
              <li>
                <span className={`${styles.chip} ${styles.chipMail}`}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
                    strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M3 7l9 6 9-6" />
                  </svg>
                </span>
                <a href={getMailLink(e)} target="_blank" rel="noopener noreferrer">{e.email}</a>
              </li>
            </ul>

            <p className={styles.message}>{e.message}</p>

            <div className={styles.actions}>
              {/* CALL */}
              <a href={`tel:${e.phone}`} className={`${styles.act} ${styles.call}`}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.8a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
                </svg>
                Call
              </a>

              {/* WHATSAPP */}
              <a
                href={getWaLink(e)}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.act} ${styles.wa}`}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </a>

              {/* GMAIL */}
              <a
                href={getMailLink(e)}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.act} ${styles.mail}`}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                  <path fill="#4285F4" d="M2 7.2v10.3A1.5 1.5 0 0 0 3.5 19h3v-8.4z" />
                  <path fill="#34A853" d="M22 7.2v10.3a1.5 1.5 0 0 1-1.5 1.5h-3v-8.4z" />
                  <path fill="#FBBC04" d="M17.5 5.9v4.7L22 7.2V6a1.5 1.5 0 0 0-2.4-1.2z" />
                  <path fill="#C5221F" d="M6.5 5.9v4.7L2 7.2V6a1.5 1.5 0 0 1 2.4-1.2z" />
                  <path fill="#EA4335" d="M6.5 5.9L12 10l5.5-4.1v4.7L12 14.8l-5.5-4.2z" />
                </svg>
                Gmail
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}