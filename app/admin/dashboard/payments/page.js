import { requireAdmin } from "@/app/lib/admin/adminAuth";
import { connectDB } from "@/app/lib/connection/db";
import Application from "@/app/models/Application";
import admin from "../admin.module.css";

const inr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

export default async function PaymentsPage() {
  await requireAdmin();
  await connectDB();

  const docs = await Application.find({ paymentStatus: { $in: ["pending", "paid"] } })
    .sort({ createdAt: -1 })
    .lean();

  return (
    <>
      <header className={admin.pageHead}>
        <h1 className={admin.pageTitle}>Payments</h1>
        <p className={admin.pageSub}>Track which brands have paid and who is pending.</p>
      </header>

      {docs.length === 0 ? (
        <div className={admin.empty}>No payments yet.</div>
      ) : (
        <ul className={admin.list} style={{ gap: 12 }}>
          {docs.map((r) => (
            <li
              key={String(r._id)}
              className={admin.card}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}
            >
              <div>
                <strong style={{ fontSize: 17 }}>{r.brand}</strong>
                <div style={{ color: "var(--muted)", fontSize: 14 }}>{r.eventTitle}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 600 }}>{inr(Number(r.amount) || 0)}</div>
                <div style={{ fontSize: 13, color: r.paymentStatus === "paid" ? "#1d6a39" : "#8a5a00" }}>
                  {r.paymentStatus === "paid" ? "Paid" : "Pending"}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}