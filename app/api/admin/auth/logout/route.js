import { ok } from "@/app/lib/auth/authHelpers";
import { clearAdminCookie } from "@/app/lib/admin/adminAuth";

export async function POST() {
  return clearAdminCookie(ok("Logged out."));
}