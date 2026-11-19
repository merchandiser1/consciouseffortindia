import Link from "next/link";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { requireAdmin } from "@/app/lib/admin/adminAuth";
import { connectDB } from "@/app/lib/connection/db";
import { setStatus } from "@/app/lib/admin/actions";
import Application from "@/app/models/Application";
import styles from "./applications.module.css";

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const sans = Jost({ subsets: ["latin"], weight: ["400", "500", "600"] });

const BASE = "/admin/dashboard/applications";
const PER_PAGE = 10;

const FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "shortlisted", label: "Shortlisted" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];
const PAY_FILTERS = [
  ["any", "Any payment"],
  ["paid", "Paid"],
  ["pending", "Payment pending"],
  ["awaiting", "Awaiting location"],
];
const SORTS = [
  ["new", "Newest first"],
  ["old", "Oldest first"],
  ["brand", "Brand A–Z"],
  ["status", "Status"],
];
const STATUS_ORDER = { pending: 0, shortlisted: 1, approved: 2, rejected: 3 };

const PAY = {
  none: { label: "—", cls: "" },
  awaiting: { label: "Awaiting location", cls: styles.pWait },
  pending: { label: "Payment pending", cls: styles.pPend },
  paid: { label: "Paid", cls: styles.pPaid },
};

const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

const payKey = (a) => {
  if (a.status !== "approved") return "none";
  if (!a.location) return "awaiting";
  return a.payment?.status === "paid" ? "paid" : "pending";
};

/* catalogue / images: purana (catalogueUrl, imageUrls) aur naya (object) dono chalega */
const urlOf = (v) => (!v ? "" : typeof v === "string" ? v : v.url || v.secure_url || "");

const normalize = (a) => {
  const rawImgs = a.imageUrls?.length ? a.imageUrls : a.images || [];
  return {
    id: String(a._id),
    brand: a.brand || "",
    eventTitle: a.eventTitle || "",
    status: a.status || "pending",
    name: a.name || "",
    email: a.email || "",
    phone: a.phone || "",
    website: a.website || "",
    message: a.message || "",
    location: a.location || "",
    createdAt: a.createdAt ? new Date(a.createdAt).toISOString() : null,
    catalogueUrl: urlOf(a.catalogueUrl) || urlOf(a.catalogue),
    imageUrls: rawImgs.map(urlOf).filter(Boolean),
    payment: a.payment
      ? {
          status: a.payment.status || "",
          amount: a.payment.amount || 0,
          method: a.payment.method || "",
          txnId: a.payment.txnId || "",
          paidAt: a.payment.paidAt ? new Date(a.payment.paidAt).toISOString() : null,
        }
      : null,
  };
};

const csvOf = (list) => {
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = [
    ["Brand", "Event", "Status", "Name", "Email", "Phone", "Website", "Applied", "Booth", "Payment", "Amount", "Txn ID"],
    ...list.map((a) => [
      a.brand, a.eventTitle, a.status, a.name, a.email, a.phone, a.website,
      fmtDate(a.createdAt), a.location, PAY[payKey(a)].label, a.payment?.amount || "", a.payment?.txnId || "",
    ]),
  ];
  return "\ufeff" + rows.map((r) => r.map(esc).join(",")).join("\n");
};

/* ---------- icons ---------- */
const Ic = ({ children, size = 16, sw = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);
const IEye = () => (<Ic><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></Ic>);
const ICheck = ({ size }) => (<Ic size={size} sw={2.4}><polyline points="5 12 10 17 19 7" /></Ic>);
const IX = ({ size }) => (<Ic size={size} sw={2.2}><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></Ic>);
const IDown = () => (<Ic><path d="M12 3v12" /><polyline points="7 11 12 16 17 11" /><path d="M4 20h16" /></Ic>);
const IFile = () => (<Ic><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></Ic>);
const IUndo = () => (<Ic><path d="M9 14L4 9l5-5" /><path d="M4 9h10a6 6 0 0 1 0 12h-3" /></Ic>);
const IPin = () => (<Ic size={15}><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></Ic>);
const ISearch = () => (<Ic size={18}><circle cx="11" cy="11" r="6.5" /><line x1="16" y1="16" x2="21" y2="21" /></Ic>);
const ICal = () => (<Ic size={18}><rect x="3" y="5" width="18" height="16" rx="2.5" /><path d="M3 10h18M8 3v4M16 3v4" /></Ic>);
const IWallet = () => (<Ic size={18}><rect x="3" y="6" width="18" height="13" rx="2.5" /><path d="M3 10h18M16 14.5h2" /></Ic>);
const ISort = () => (<Ic size={18}><path d="M4 7h10M4 12h7M4 17h4" /><path d="M18 18V6M14.5 9.5L18 6l3.5 3.5" /></Ic>);
const ISheet = () => (<Ic><path d="M12 3v12" /><polyline points="7 11 12 16 17 11" /><path d="M4 20h16" /></Ic>);
const IHour = () => (<Ic size={15}><path d="M7 3h10M7 21h10M8 3c0 5 8 5 8 9s-8 4-8 9M16 3c0 5-8 5-8 9s8 4 8 9" /></Ic>);
const IStar = () => (<Ic size={15}><polygon points="12 3.5 14.6 9 20.5 9.7 16.2 13.8 17.3 19.7 12 16.8 6.7 19.7 7.8 13.8 3.5 9.7 9.4 9" /></Ic>);

const STATUS_ICON = {
  pending: <IHour />,
  shortlisted: <IStar />,
  approved: <ICheck size={15} />,
  rejected: <IX size={15} />,
};

function StatusBadge({ status }) {
  return (
    <span className={`${styles.badge} ${styles["b_" + status]}`}>
      {STATUS_ICON[status]} {status}
    </span>
  );
}

function StatusForm({ id, status, className, children }) {
  return (
    <form action={setStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button type="submit" className={className}>{children}</button>
    </form>
  );
}

const Row = ({ k, children }) => (
  <div>
    <dt>{k}</dt>
    <dd>{children}</dd>
  </div>
);

const catDownload = (url) => `/api/admin/catalogue?url=${encodeURIComponent(url)}&download=1`;
const catOpen = (url) => `/api/admin/catalogue?url=${encodeURIComponent(url)}`;

export default async function ApplicationsPage({ searchParams }) {
  await requireAdmin();
  const sp = await searchParams;

  const f = FILTERS.some((x) => x.key === sp?.status) ? sp.status : "all";
  const q = String(sp?.q || "").trim();
  const ev = sp?.event ? String(sp.event) : "all";
  const payF = PAY_FILTERS.some((x) => x[0] === sp?.pay) ? sp.pay : "any";
  const sort = SORTS.some((x) => x[0] === sp?.sort) ? sp.sort : "new";
  const pageNo = Math.max(parseInt(sp?.page, 10) || 1, 1);
  const viewId = sp?.view ? String(sp.view) : "";

  await connectDB();
  const docs = await Application.find({}).sort({ createdAt: -1 }).lean();
  const all = docs.map(normalize);

  const countOf = (k) => (k === "all" ? all.length : all.filter((a) => a.status === k).length);
  const events = [...new Set(all.map((a) => a.eventTitle).filter(Boolean))].sort();

  /* ---------- filter + sort ---------- */
  const t = q.toLowerCase();
  const filtered = all
    .filter((a) => {
      if (f !== "all" && a.status !== f) return false;
      if (ev !== "all" && a.eventTitle !== ev) return false;
      if (payF !== "any" && payKey(a) !== payF) return false;
      if (!t) return true;
      return [a.name, a.brand, a.email, a.phone, a.eventTitle].some((v) =>
        v.toLowerCase().includes(t)
      );
    })
    .sort({
      new: (x, y) => new Date(y.createdAt) - new Date(x.createdAt),
      old: (x, y) => new Date(x.createdAt) - new Date(y.createdAt),
      brand: (x, y) => x.brand.localeCompare(y.brand),
      status: (x, y) => (STATUS_ORDER[x.status] ?? 9) - (STATUS_ORDER[y.status] ?? 9),
    }[sort]);

  const pages = Math.max(Math.ceil(filtered.length / PER_PAGE), 1);
  const cur = Math.min(pageNo, pages);
  const apps = filtered.slice((cur - 1) * PER_PAGE, cur * PER_PAGE);
  const dirty = f !== "all" || q || ev !== "all" || payF !== "any" || sort !== "new";

  const href = (o = {}) => {
    const p = { status: f, q, event: ev, pay: payF, sort, page: 1, view: "", ...o };
    const u = new URLSearchParams();
    if (p.status !== "all") u.set("status", p.status);
    if (p.q) u.set("q", p.q);
    if (p.event !== "all") u.set("event", p.event);
    if (p.pay !== "any") u.set("pay", p.pay);
    if (p.sort !== "new") u.set("sort", p.sort);
    if (p.page > 1) u.set("page", String(p.page));
    if (p.view) u.set("view", p.view);
    const s = u.toString();
    return s ? `${BASE}?${s}` : BASE;
  };

  const csvHref = "data:text/csv;charset=utf-8," + encodeURIComponent(csvOf(filtered));
  const open = viewId ? all.find((a) => a.id === viewId) : null;

  return (
    <div className={`${styles.wrap} ${sans.className}`}>
      <header className={styles.pageHead}>
        <h1 className={`${styles.pageTitle} ${serif.className}`}>Applications</h1>
        <p className={styles.pageSub}>Review, approve or reject brand applications.</p>
      </header>

      {/* ---------- status tabs ---------- */}
      <div className={styles.tabs}>
        {FILTERS.map((x) => (
          <Link
            key={x.key}
            href={href({ status: x.key })}
            className={`${styles.tabLink} ${f === x.key ? styles.tabLinkActive : ""}`}
          >
            {x.label} <span>{countOf(x.key)}</span>
          </Link>
        ))}
      </div>

      {/* ---------- search / filter / sort ---------- */}
      <form method="get" action={BASE} className={styles.bar}>
        {f !== "all" && <input type="hidden" name="status" value={f} />}

        <label className={`${styles.field} ${styles.searchWrap}`}>
          <span className={styles.fieldIc}><ISearch /></span>
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search name, brand, email, event..."
            className={styles.search}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.fieldIc}><ICal /></span>
          <select name="event" defaultValue={ev} className={styles.select} aria-label="Event">
            <option value="all">All events</option>
            {events.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </label>

        <label className={styles.field}>
          <span className={styles.fieldIc}><IWallet /></span>
          <select name="pay" defaultValue={payF} className={styles.select} aria-label="Payment">
            {PAY_FILTERS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </label>

        <label className={styles.field}>
          <span className={styles.fieldIc}><ISort /></span>
          <select name="sort" defaultValue={sort} className={styles.select} aria-label="Sort">
            {SORTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </label>

        <button type="submit" className={styles.btnApply}>Apply</button>
        {dirty && <Link href={BASE} className={styles.textLink}>Clear</Link>}
      </form>

      <div className={styles.noteRow}>
        <p className={styles.count}>
          {filtered.length} application{filtered.length === 1 ? "" : "s"}
          {pages > 1 ? ` · page ${cur} of ${pages}` : ""}
        </p>
        {filtered.length > 0 && (
          <a
            href={csvHref}
            download={`saahra-applications-${new Date().toISOString().slice(0, 10)}.csv`}
            className={styles.btnGhost}
          >
            <ISheet /> Export CSV
          </a>
        )}
      </div>

      {/* ---------- cards ---------- */}
      {apps.length === 0 ? (
        <div className={styles.empty}>No applications found.</div>
      ) : (
        <div className={styles.grid}>
          {apps.map((a) => {
            const pk = payKey(a);
            const isPaid = a.payment?.status === "paid";
            return (
              <div key={a.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <div className={styles.cardTitleWrap}>
                    <h3 className={`${styles.cardBrand} ${serif.className}`}>{a.brand}</h3>
                    <p className={styles.cardEvent}><IPin /> {a.eventTitle}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>

                <div className={styles.details}>
                  <dl className={styles.col}>
                    <Row k="Name">{a.name || "—"}</Row>
                    <Row k="Phone">{a.phone || "—"}</Row>
                    <Row k="Applied">{fmtDate(a.createdAt)}</Row>
                  </dl>
                  <dl className={styles.col}>
                    <Row k="Email">{a.email || "—"}</Row>
                    <Row k="Booth">{a.location || "—"}</Row>
                    <Row k="Payment">
                      {PAY[pk].cls ? (
                        <span className={`${styles.pay} ${PAY[pk].cls}`}>{PAY[pk].label}</span>
                      ) : "—"}
                    </Row>
                  </dl>
                </div>

                <div className={styles.actions}>
                  <Link href={href({ view: a.id, page: cur })} scroll={false} className={styles.btnGhost}>
                    <IEye /> View
                  </Link>
                  {a.catalogueUrl && (
                    <a href={catDownload(a.catalogueUrl)} className={styles.btnGhost}>
                      <IDown /> Catalogue
                    </a>
                  )}
                  {a.status !== "approved" && (
                    <StatusForm id={a.id} status="approved" className={styles.btnOk}>
                      <ICheck /> Approve
                    </StatusForm>
                  )}
                  {a.status !== "rejected" && !isPaid && (
                    <StatusForm id={a.id} status="rejected" className={styles.btnBad}>
                      <IX /> Reject
                    </StatusForm>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ---------- pagination ---------- */}
      {pages > 1 && (
        <nav className={styles.pager} aria-label="Pagination">
          {cur > 1 ? (
            <Link href={href({ page: cur - 1 })} className={styles.btnGhost}>← Previous</Link>
          ) : (
            <span className={styles.pagerOff}>← Previous</span>
          )}
          <span className={styles.note}>Page {cur} of {pages}</span>
          {cur < pages ? (
            <Link href={href({ page: cur + 1 })} className={styles.btnGhost}>Next →</Link>
          ) : (
            <span className={styles.pagerOff}>Next →</span>
          )}
        </nav>
      )}

      {/* ---------- VIEW MODAL ---------- */}
      {open && (() => {
        const a = open;
        const pk = payKey(a);
        const isPaid = a.payment?.status === "paid";
        const closeHref = href({ page: cur });
        const wa = a.phone.replace(/\D/g, "");
        const web = a.website
          ? /^https?:\/\//i.test(a.website) ? a.website : `https://${a.website}`
          : "";
        return (
          <div className={styles.modalBg}>
            <Link href={closeHref} scroll={false} className={styles.backdrop} aria-label="Close" />
            <div className={styles.modal} role="dialog" aria-modal="true">
              <Link href={closeHref} scroll={false} className={styles.close} aria-label="Close">
                <IX size={16} />
              </Link>

              <p className={styles.cardEvent}><IPin /> {a.eventTitle}</p>
              <h2 className={`${styles.modalTitle} ${serif.className}`}>{a.brand}</h2>
              <StatusBadge status={a.status} />

              <div className={styles.contactRow}>
                {a.email && <a href={`mailto:${a.email}`} className={styles.btnGhost}>Email</a>}
                {a.phone && <a href={`tel:${a.phone}`} className={styles.btnGhost}>Call</a>}
                {wa && (
                  <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className={styles.btnGhost}>
                    WhatsApp
                  </a>
                )}
              </div>

              <dl className={styles.modalGrid}>
                <Row k="Full Name">{a.name || "—"}</Row>
                <Row k="Email">{a.email || "—"}</Row>
                <Row k="Phone">{a.phone || "—"}</Row>
                <Row k="Website / Instagram">
                  {a.website ? (
                    <a href={web} target="_blank" rel="noopener noreferrer" className={styles.textLink}>
                      {a.website}
                    </a>
                  ) : "—"}
                </Row>
                <Row k="Applied On">{fmtDate(a.createdAt)}</Row>
                <Row k="Booth">{a.location || "—"}</Row>
                <Row k="Payment">{PAY[pk].label}</Row>
                {pk === "paid" && (
                  <>
                    <Row k="Amount">
                      {inr(a.payment.amount)}
                      {a.payment.method ? ` · ${a.payment.method.toUpperCase()}` : ""}
                    </Row>
                    <Row k="Txn ID">{a.payment.txnId || "—"}</Row>
                    <Row k="Paid On">{fmtDate(a.payment.paidAt)}</Row>
                  </>
                )}
              </dl>

              <h4 className={styles.sec}>Message</h4>
              <p className={styles.msg}>{a.message || "No message."}</p>

              <h4 className={styles.sec}>Catalogue</h4>
              {a.catalogueUrl ? (
                <div className={styles.actions}>
                  <a href={catOpen(a.catalogueUrl)} target="_blank" rel="noopener noreferrer" className={styles.btnGhost}>
                    <IFile /> Open catalogue
                  </a>
                  <a href={catDownload(a.catalogueUrl)} className={styles.btnGhost}>
                    <IDown /> Download
                  </a>
                </div>
              ) : (
                <p className={styles.note}>No catalogue uploaded.</p>
              )}

              <h4 className={styles.sec}>Images ({a.imageUrls.length})</h4>
              {a.imageUrls.length > 0 ? (
                <div className={styles.gallery}>
                  {a.imageUrls.map((url) => (
                    <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="Uploaded" loading="lazy" />
                    </a>
                  ))}
                </div>
              ) : (
                <p className={styles.note}>No images uploaded.</p>
              )}

              <div className={styles.modalActions}>
                {a.status !== "approved" && (
                  <StatusForm id={a.id} status="approved" className={styles.btnOk}>
                    <ICheck /> Approve
                  </StatusForm>
                )}
                {a.status !== "rejected" && !isPaid && (
                  <StatusForm id={a.id} status="rejected" className={styles.btnBad}>
                    <IX /> Reject
                  </StatusForm>
                )}
                {a.status !== "pending" && !isPaid && (
                  <StatusForm id={a.id} status="pending" className={styles.btnGhost}>
                    <IUndo /> Reset to Pending
                  </StatusForm>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}