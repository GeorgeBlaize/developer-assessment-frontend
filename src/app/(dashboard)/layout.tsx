import type { Metadata } from "next";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getMe } from "@/lib/api/server";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s · CodeAssess" },
  robots: { index: false, follow: false },
};

/**
 * Server Component: fetches the signed-in user's profile once per request (React cache dedupes
 * the call with any page that also needs it) and hands it to the client shell, which renders
 * role-specific navigation and hydrates the global auth store.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const me = await getMe();
  return <DashboardShell user={me}>{children}</DashboardShell>;
}
