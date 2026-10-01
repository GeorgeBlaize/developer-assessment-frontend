import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ClipboardList, CreditCard, MailPlus, Plus, Rocket, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AssessmentCard } from "@/components/company/assessment-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { getMe, serverFetch } from "@/lib/api/server";
import { formatDate, formatMoney, formatNumber, percent } from "@/lib/format";
import type { AssessmentListItem, CompanyDashboard } from "@/types/api";

export const metadata: Metadata = { title: "Company overview" };

export default async function CompanyOverviewPage() {
  const [me, dashboard, recent] = await Promise.all([
    getMe(),
    serverFetch<CompanyDashboard>("/companies/me/dashboard"),
    serverFetch<AssessmentListItem[]>("/assessments", { query: { limit: 3, sortBy: "updatedAt", sortOrder: "desc" } }),
  ]);
  const d = dashboard.data;
  const plan = d.plan;
  const usage = plan ? percent(d.publishedAssessments, plan.maxActiveAssessments) : 0;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={me.companyProfile?.companyName}
        title={`Welcome back, ${me.name.split(" ")[0]}`}
        description="Here's how your hiring pipeline is doing."
        actions={
          <Button asChild size="lg">
            <Link href="/company/assessments/new">
              <Plus /> New assessment
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Assessments" value={formatNumber(d.totalAssessments)} icon={ClipboardList} hint="Drafts, published & archived" />
        <StatCard label="Published" value={formatNumber(d.publishedAssessments)} icon={Rocket} accent="success" hint="Accepting candidates" />
        <StatCard label="Invitations sent" value={formatNumber(d.totalInvitations)} icon={MailPlus} accent="info" />
        <StatCard label="Attempts" value={formatNumber(d.totalAttempts)} icon={Timer} accent="warning" hint="Started by candidates" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2">
              {plan ? `${plan.name.charAt(0)}${plan.name.slice(1).toLowerCase()} plan` : "No plan"}
              <StatusBadge status={d.subscriptionStatus} />
            </CardTitle>
            <CardDescription>
              {plan && Number(plan.price) > 0
                ? `${formatMoney(plan.price, plan.currency)} / ${plan.durationDays} days${d.subscriptionEndsAt ? ` · renews ${formatDate(d.subscriptionEndsAt)}` : ""}`
                : "Free forever"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {plan ? (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Published assessments</span>
                    <span className="font-medium tabular-nums">
                      {d.publishedAssessments} / {plan.maxActiveAssessments}
                    </span>
                  </div>
                  <Progress value={Math.min(usage, 100)} aria-label="Published assessment usage" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Up to <span className="font-medium text-foreground">{formatNumber(plan.maxInvitesPerAssessment)}</span> invitations
                  per assessment.
                </p>
              </>
            ) : null}
            <Button asChild variant={usage >= 100 ? "default" : "outline"} className="w-full">
              <Link href="/company/billing">
                <CreditCard /> {usage >= 100 ? "Upgrade to publish more" : "Manage plan"}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Recently updated</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/company/assessments">
                View all <ArrowRight />
              </Link>
            </Button>
          </div>
          {recent.data.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {recent.data.map((a) => (
                <AssessmentCard key={a.id} assessment={a} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={ClipboardList}
              title="Build your first assessment"
              description="It takes a few minutes. Add questions, publish, then invite candidates by email."
              action={
                <Button asChild>
                  <Link href="/company/assessments/new">
                    <Plus /> Create assessment
                  </Link>
                </Button>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
