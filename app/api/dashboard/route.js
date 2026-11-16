import {
  getDashboard,
  updateDashboard,
  logoutDashboard,
} from "@/app/controllers/dashboardController";

export const dynamic = "force-dynamic";

export async function GET() {
  return getDashboard();
}

export async function PATCH(req) {
  return updateDashboard(req);
}

export async function DELETE() {
  return logoutDashboard();
}