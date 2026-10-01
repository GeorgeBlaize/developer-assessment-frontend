import type { Metadata } from "next";
import { HydrationBoundary } from "@tanstack/react-query";
import { CalendarClock, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PaymentHistory } from "@/components/company/payment-history";
import { SubscribeButton } from "@/components/company/subscribe-button";
import { PageHeader } from "@/components/shared/page-header";
import { PlanCard } from "@/components/shared/plan-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { prefetch } from "@/lib/api/prefetch";
import { queryKeys } from "@/lib/api/query-keys";
import { serverFetch } from "@/lib/api/server";
import { formatDate } from "@/lib/format";
import { paymentListParams } from "@/lib/list-params";
import type { CompanyDashboard, Payment, Plan } from "@/types/api";

export const metadata: Metadata = { title: "Billing & plans" };

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const paymentParams = paymentListParams(sp);
  const [dashboard, plans, state] = await Promise.all([
    serverFetch<CompanyDashboard>("/companies/me/dashboard"),
    serverFetch<Plan[]>("/plans"),
    prefetch([
      {
        queryKey: queryKeys.company.payments(paymentParams),
        queryFn: () => serverFetch<Payment[]>("/payments", { query: paymentParams }),
      },
    ]),
  ]);
  const d = dashboard.data;
  const wanted = typeof sp.plan === "string" ? sp.plan : undefined;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Billing & plans"
        description="Upgrade for more published assessments and invitations. Payments are processed by SSLCommerz."
      />

      <Card className="flex-row flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
            <CalendarClock className="size-5" aria-hidden />
          </span>
          <div>
            <p className="text-sm text-muted-foreground">Current subscription</p>
            <p className="font-semibold">
              {d.plan?.name ?? "No plan"}
              {d.subscriptionEndsAt && d.plan && Number(d.plan.price) > 0 ? (
                <span className="font-normal text-muted-foreground"> · until {formatDate(d.subscriptionEndsAt)}</span>
              ) : null}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={d.subscriptionStatus} />
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 text-success" aria-hidden /> Secure checkout
          </span>
        </div>
      </Card>

      <section aria-labelledby="plans-heading" className="space-y-4">
        <h2 id="plans-heading" className="font-semibold">
          Choose a plan
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {plans.data.map((plan) => {
            const isCurrent = d.plan?.id === plan.id;
            const highlighted = wanted ? plan.name === wanted : plan.name === "BASIC";
            return (
              <PlanCard
                key={plan.id}
                plan={plan}
                current={isCurrent}
                highlighted={!isCurrent && highlighted}
                action={<SubscribeButton plan={plan} isCurrent={isCurrent} highlighted={highlighted} />}
              />
            );
          })}
        </div>
      </section>

      <section aria-labelledby="history-heading" className="space-y-4">
        <h2 id="history-heading" className="font-semibold">
          Payment history
        </h2>
        <HydrationBoundary state={state}>
          <PaymentHistory />
        </HydrationBoundary>
      </section>
    </div>
  );
}
