import { requireAdmin } from "@/app/lib/admin/adminAuth";
import { connectDB } from "@/app/lib/connection/db";
import Application from "@/app/models/Application";
import AdminShell from "./AdminShell";

export const metadata = { title: "Admin | #ConsciousEffort" };

export default async function AdminLayout({ children }) {
  await requireAdmin();
  await connectDB();
  const payBadge = await Application.countDocuments({ paymentStatus: "pending" });

  return <AdminShell payBadge={payBadge}>{children}</AdminShell>;
}