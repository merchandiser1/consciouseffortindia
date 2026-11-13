import Link from "next/link";
import mongoose from "mongoose";
import { requireAuth } from "@/app/lib/auth/authHelpers";
import { connectDB } from "@/app/lib/connection/db";
import Application from "@/app/models/Application";
import styles from "../dashboard.module.css";

const STATUS = {
  pending: { label: "Under review", cls: styles.badgePending },
  approved: { label: "Approved", cls: styles.badgeApproved },
  rejected: { label: "Not selected", cls: styles.badgeRejected },
};

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

async function getMyApplications(user) {
  try {
    await connectDB();

    const or = [];
    if (user.id && mongoose.isValidObjectId(user.id)) or.push({ userId: user.id });
    if (user.email) or.push({ email: String(user.email).toLowerCase() });
    if (or.length === 0) return [];

    const docs = await Application.find({ $or: or })
      .sort({ createdAt: -1 })
      .lean();

    return docs.map((a) => ({
      id: String(a._id),
      brand: a.brand,
      eventTitle: a.eventTitle,
      status: a.status || "pending",
      createdAt: a.createdAt ? new Date(a.createdAt).toISOString() : null,
      catalogueUrl: a.catalogueUrl || "",
      imageUrls: a.imageUrls || [],
    }));
  } catch (err) {
    console.error("getMyApplications failed:", err);
    return [];
  }
}

export default async function MyApplicationsPage() {
  const user = await requireAuth();
  const apps = await getMyApplications(user);

  return (
    <>
      <header className={styles.pageHead}>
        <div>
          <h1 className={styles.pageTitle}>My Applications</h1>
          <p className={styles.pageSub}>
            Track the showcases you have applied to and see where each
            application stands.
          </p>
        </div>

        <Link href="/consciousmain/upcoming" className={styles.primaryBtn}>
          New application
        </Link>
      </header>

      {apps.length === 0 ? (
        <div className={styles.empty}>
          <h2 className={styles.emptyTitle}>No applications yet</h2>
          <p className={styles.emptyText}>
            When you apply for a showcase, it will appear here along with its
            review status.
          </p>
          <Link
            href="/consciousmain/dashboard/showcases"
            className={styles.primaryBtn}
          >
            Browse showcases
          </Link>
        </div>
      ) : (
        <ul className={styles.appList}>
          {apps.map((a) => {
            const st = STATUS[a.status] || STATUS.pending;
            return (
              <li key={a.id} className={styles.appCard}>
                <div className={styles.appTop}>
                  <div>
                    <h2 className={styles.appBrand}>{a.brand}</h2>
                    <p className={styles.appEvent}>{a.eventTitle}</p>
                  </div>
                  <span className={`${styles.badge} ${st.cls}`}>{st.label}</span>
                </div>

                <ul className={styles.appMeta}>
                  {a.createdAt && (
                    <li>
                      <span>Submitted: </span>
                      {fmtDate(a.createdAt)}
                    </li>
                  )}
                  <li>
                    <span>Images: </span>
                    {a.imageUrls.length}
                  </li>
                </ul>

                {a.imageUrls.length > 0 && (
                  <div className={styles.thumbs}>
                    {a.imageUrls.map((url) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.thumb}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" loading="lazy" />
                      </a>
                    ))}
                  </div>
                )}

                {a.catalogueUrl && (
                  <a
                    href={a.catalogueUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.textLink}
                  >
                    View catalogue (PDF)
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}