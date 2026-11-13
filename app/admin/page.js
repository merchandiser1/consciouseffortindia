import { redirect } from "next/navigation";
import { getAdmin, ADMIN_HOME_PATH, ADMIN_LOGIN_PATH } from "@/app/lib/admin/adminAuth";

export default async function AdminIndex() {
  const admin = await getAdmin();
  redirect(admin ? ADMIN_HOME_PATH : ADMIN_LOGIN_PATH);
}