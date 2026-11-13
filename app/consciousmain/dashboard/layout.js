import { Suspense } from "react";
import { requireAuth } from "@/app/lib/auth/authHelpers";
import DashboardShell from "./DashboardShell";

export const metadata = {
  title: "Dashboard | #ConsciousEffort",
};


async function AuthGate({ children }) {
  const user = await requireAuth();

  return (
    <DashboardShell user={{ username: user.username, email: user.email }}>
      {children}
    </DashboardShell>
  );
}

export default function DashboardLayout({ children }) {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#fbf8f4" }} />}>
      <AuthGate>{children}</AuthGate>
    </Suspense>
  );
}