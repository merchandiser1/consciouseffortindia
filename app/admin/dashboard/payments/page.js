import { requireAdmin } from "@/app/lib/admin/adminAuth";
import { connectDB } from "@/app/lib/connection/db";
import Application from "@/app/models/Application";
import admin from "../admin.module.css";

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

export default async function PaymentsPage() {
  await requireAdmin();
  await connectDB();

  const docs = await Application.find({ "payment.status": { $in: ["pending", "paid"] } })
    .sort({ "payment.paidAt": -1, createdAt: -1 })
    .lean();

  const rows = docs.map((a) => ({
    id: String(a._id),
    brand: a.brand || "",
    event: a.eventTitle || "Event",
    booth: a.location || "—",
    email: a.email || "",
    status: a.payment?.status || "pending",
    amount: Number(a.payment?.amount) || 0,
    method: a.payment?.method || "",
    txnId: a.payment?.txnId || "",
    paidAt: a.payment?.paidAt || null,
  }));

  const paidRows = rows.filter((r) => r.status === "paid");
  const pendRows = rows.filter((r) => r.status !== "paid");
  const collected = paidRows.reduce((s, r) => s + r.amount, 0);
  const outstanding = pendRows.reduce((s, r) => s + r.amount, 0);

  // event-wise group
  const groups = {};
  for (const r of rows) (groups[r.event] = groups[r.event] || []).push(r);

  return (
    <>
      <header className={admin.pageHead}>
        <h1 className={admin.pageTitle}>Payments</h1>
        <p className={admin.pageSub}>Track which brands have paid and who is pending.</p>
      </header>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
        {[
          ["Collected", inr(collected), "#1d6a39"],
          ["Paid", paidRows.length, "#1d6a39"],
          ["Pending", pendRows.length, "#8a5a00"],
          ["Outstanding", inr(outstanding), "#8a5a00"],
        ].map(([l, v, c]) => (
          <div key={l} className={admin.card} style={{ flex: "1 1 160px", padding: "16px 20px" }}>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>{l}</div>
            <div style={{ fontSize: 24, fontWeight: 600, color: c }}>{v}</div>
          </div>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className={admin.empty}>No payments yet.</div>
      ) : (
        Object.entries(groups).map(([event, list]) => {
          const evPaid = list.filter((r) => r.status === "paid").reduce((s, r) => s + r.amount, 0);
          return (
            <section key={event} style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                <h2 className={admin.sectionTitle} style={{ margin: 0 }}>{event}</h2>
                <span style={{ fontSize: 14, color: "var(--muted)" }}>Collected: {inr(evPaid)}</span>
              </div>

              <ul className={admin.list} style={{ gap: 12 }}>
                {list.map((r) => (
                  <li
                    key={r.id}
                    className={admin.card}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}
                  >
                    <div>
                      <strong style={{ fontSize: 17 }}>{r.brand}</strong>
                      <div style={{ color: "var(--muted)", fontSize: 14 }}>
                        Booth: {r.booth}
                        {r.email ? ` · ${r.email}` : ""}
                      </div>
                      {r.status === "paid" && (
                        <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 2 }}>
                          {r.method.toUpperCase()} · {r.txnId} · {fmtDate(r.paidAt)}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 600 }}>{inr(r.amount)}</div>
                      <div style={{ fontSize: 13, color: r.status === "paid" ? "#1d6a39" : "#8a5a00" }}>
                        {r.status === "paid" ? "Paid" : "Pending"}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })
      )}
    </>
  );
}