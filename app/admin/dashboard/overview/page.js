import { requireAdmin } from "@/app/lib/admin/adminAuth";
import { connectDB } from "@/app/lib/connection/db";
import { setStatus } from "@/app/lib/admin/actions";
import Application from "@/app/models/Application";
import admin from "../admin.module.css";
import styles from "./overview.module.css";

const inr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const STATUS = {
  pending: { label: "Under review", cls: admin.badgePending },
  approved: { label: "Approved", cls: admin.badgeApproved },
  rejected: { label: "Rejected", cls: admin.badgeRejected },
};

const ICONS = {
  file: <><path d="M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-10A.5.5 0 0 1 7 20V3.5z" /><path d="M14 3.5V8h4M10 12h5M10 16h5" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  check: <><circle cx="12" cy="12" r="8.5" /><path d="M8 12.5l2.7 2.7L16 9.5" /></>,
  cross: <><circle cx="12" cy="12" r="8.5" /><path d="M9 9l6 6M15 9l-6 6" /></>,
  wallet: <><rect x="3.5" y="6" width="17" height="13" rx="2.5" /><path d="M16 12.5h2M3.5 9.5h13" /></>,
  rupee: <path d="M7 4h11M7 9h11M7 4c6 0 8 2 8 5s-2 5-8 5l7 6" />,
};

export default async function OverviewPage() {
  await requireAdmin();
  await connectDB();

  const [total, pending, approved, rejected, payPending, paid, docs] = await Promise.all([
    Application.countDocuments({}),
    Application.countDocuments({ status: "pending" }),
    Application.countDocuments({ status: "approved" }),
    Application.countDocuments({ status: "rejected" }),
    Application.countDocuments({ paymentStatus: "pending" }),
    Application.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, sum: { $sum: "$amount" } } },
    ]),
    Application.find({}).sort({ createdAt: -1 }).limit(6).lean(),
  ]);

  const revenue = paid[0]?.sum || 0;

  const cards = [
    { label: "Total Applications", value: total, icon: "file", tone: "tTotal" },
    { label: "In Review", value: pending, icon: "clock", tone: "tReview" },
    { label: "Approved", value: approved, icon: "check", tone: "tOk" },
    { label: "Rejected", value: rejected, icon: "cross", tone: "tBad" },
    { label: "Payments Pending", value: payPending, icon: "wallet", tone: "tPay" },
    { label: "Revenue (Paid)", value: inr(revenue), icon: "rupee", tone: "tOk" },
  ];

  const recent = docs.map((a) => ({
    id: String(a._id),
    brand: a.brand || "",
    eventTitle: a.eventTitle || "",
    status: a.status || "pending",
    name: a.name || "",
    email: a.email || "",
    phone: a.phone || "",
    website: a.website || "",
    message: a.message || "",
    createdAt: a.createdAt ? new Date(a.createdAt).toISOString() : null,
    catalogueUrl: a.catalogueUrl || "",
    imageUrls: a.imageUrls || [],
  }));

  return (
    <>
      <header className={admin.pageHead}>
        <h1 className={admin.pageTitle}>Overview</h1>
        <p className={admin.pageSub}>A quick look at applications and revenue.</p>
      </header>

      <div className={styles.grid}>
        {cards.map((c) => (
          <div key={c.label} className={styles.stat}>
            <span className={`${styles.tile} ${styles[c.tone]}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {ICONS[c.icon]}
              </svg>
            </span>
            <p className={styles.label}>{c.label}</p>
            <p className={styles.value}>{c.value}</p>
          </div>
        ))}
      </div>

      <h2 className={admin.sectionTitle}>Recent Applications</h2>

      {recent.length === 0 ? (
        <div className={admin.empty}>No applications yet.</div>
      ) : (
        <ul className={`${admin.list} ${styles.recent}`}>
          {recent.map((a) => {
            const st = STATUS[a.status] || STATUS.pending;
            return (
              <li key={a.id} className={admin.card}>
                <div className={admin.cardTop}>
                  <div>
                    <h3 className={admin.cardBrand}>{a.brand}</h3>
                    <p className={admin.cardEvent}>{a.eventTitle}</p>
                  </div>
                  <span className={`${admin.badge} ${st.cls}`}>{st.label}</span>
                </div>

                <div className={admin.actions}>
                  <details className={admin.view}>
                    <summary className={admin.btnGhost}>View</summary>
                    <div className={admin.details}>
                      <dl className={admin.dl}>
                        {a.createdAt && (<><dt>Submitted</dt><dd>{fmtDate(a.createdAt)}</dd></>)}
                        {a.name && (<><dt>Name</dt><dd>{a.name}</dd></>)}
                        {a.email && (<><dt>Email</dt><dd>{a.email}</dd></>)}
                        {a.phone && (<><dt>Phone</dt><dd>{a.phone}</dd></>)}
                        {a.website && (<><dt>Website</dt><dd>{a.website}</dd></>)}
                      </dl>
                      {a.message && <p className={admin.msg}>{a.message}</p>}
                      {a.imageUrls.length > 0 && (
                        <div className={admin.thumbs}>
                          {a.imageUrls.map((url) => (
                            <a key={url} href={url} target="_blank" rel="noopener noreferrer" className={admin.thumb}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={url} alt="" loading="lazy" />
                            </a>
                          ))}
                        </div>
                      )}
                      {a.catalogueUrl && (
                        <a href={a.catalogueUrl} target="_blank" rel="noopener noreferrer" className={admin.textLink}>
                          View catalogue (PDF)
                        </a>
                      )}
                    </div>
                  </details>

                  {a.status !== "approved" && (
                    <form action={setStatus}>
                      <input type="hidden" name="id" value={a.id} />
                      <input type="hidden" name="status" value="approved" />
                      <button type="submit" className={admin.btnDark}>Approve</button>
                    </form>
                  )}
                  {a.status !== "rejected" && (
                    <form action={setStatus}>
                      <input type="hidden" name="id" value={a.id} />
                      <input type="hidden" name="status" value="rejected" />
                      <button type="submit" className={admin.btnDanger}>Reject</button>
                    </form>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}