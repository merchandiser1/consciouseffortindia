import Link from "next/link";
import { requireAdmin } from "@/app/lib/admin/adminAuth";
import { connectDB } from "@/app/lib/connection/db";
import { setStatus } from "@/app/lib/admin/actions";
import Application from "@/app/models/Application";
import admin from "../admin.module.css";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "In Review" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

const STATUS = {
  pending: { label: "Under review", cls: admin.badgePending },
  approved: { label: "Approved", cls: admin.badgeApproved },
  rejected: { label: "Rejected", cls: admin.badgeRejected },
};

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default async function ApplicationsPage({ searchParams }) {
  await requireAdmin();
  const sp = await searchParams;
  const f = FILTERS.some((x) => x.key === sp?.status) ? sp.status : "all";

  await connectDB();
  const docs = await Application.find(f === "all" ? {} : { status: f })
    .sort({ createdAt: -1 })
    .lean();

  const apps = docs.map((a) => ({
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
        <h1 className={admin.pageTitle}>Applications</h1>
        <p className={admin.pageSub}>Review applications, then approve or reject them.</p>
      </header>

      <div className={admin.tabs}>
        {FILTERS.map((x) => (
          <Link
            key={x.key}
            href={x.key === "all" ? "/admin/dashboard/applications" : `/admin/dashboard/applications?status=${x.key}`}
            className={`${admin.tabLink} ${f === x.key ? admin.tabLinkActive : ""}`}
          >
            {x.label}
          </Link>
        ))}
      </div>

      {apps.length === 0 ? (
        <div className={admin.empty}>No applications found.</div>
      ) : (
        <ul className={admin.list}>
          {apps.map((a) => {
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