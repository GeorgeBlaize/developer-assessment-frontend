import type { Metadata } from "next";
import { PlansManager } from "@/components/admin/plans-manager";
import { PageHeader } from "@/components/shared/page-header";
import { serverFetch } from "@/lib/api/server";
import type { Plan } from "@/types/api";

export const metadata: Metadata = { title: "Plans" };

export default async function AdminPlansPage() {
  // Uncached read here: admins must always see the latest values they're editing.
  const { data: plans } = await serverFetch<Plan[]>("/plans");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscription plans"
        description="Pricing and limits for company accounts. Changes apply to new subscriptions and to limit checks immediately."
      />
      <PlansManager initialPlans={plans} />
    </div>
  );
}
