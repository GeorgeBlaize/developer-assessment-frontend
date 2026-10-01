import type { Metadata } from "next";
import Link from "next/link";
import { format, parseISO, subDays } from "date-fns";
import { ArrowRight, Banknote, Building2, ClipboardList, GraduationCap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ActionBreakdownChart, ActivityChart, UsersByRoleChart } from "@/components/admin/lazy-admin-charts";
import { SweepAttemptsButton } from "@/components/admin/sweep-attempts-button";
import type { ActivityPoint, SliceDatum } from "@/components/admin/admin-charts";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { getMe, serverFetch } from "@/lib/api/server";
import { dayKey, formatMoney, formatNumber, formatRelative, humanize } from "@/lib/format";
import type { AuditLog, PlatformStats } from "@/types/api";

export const metadata: Metadata = { title: "Admin overview" };

const SIGN_IN_ACTIONS = new Set(["LOGIN", "LOGIN_GOOGLE", "REGISTER"]);
const HIRING_ACTIONS = new Set([
  "CREATE_ASSESSMENT",
  "PUBLISH_ASSESSMENT",
  "INVITE_CANDIDATES",
  "START_ATTEMPT",
  "FINISH_ATTEMPT",
  "GRADE_SUBMISSION",
]);

function buildActivity(logs: AuditLog[]): ActivityPoint[] {
  const days = Array.from({ length: 14 }, (_, i) => dayKey(subDays(new Date(), 13 - i)));
  const buckets = new Map(days.map((d) => [d, { signIns: 0, hiring: 0, other: 0 }]));
  for (const log of logs) {
    const bucket = buckets.get(dayKey(log.createdAt));
    if (!bucket) continue;
    if (SIGN_IN_ACTIONS.has(log.action)) bucket.signIns++;
    else if (HIRING_ACTIONS.has(log.action)) bucket.hiring++;
    else bucket.other++;
  }
  return days.map((d) => ({ date: format(parseISO(d), "d MMM"), ...buckets.get(d)! }));
}

function buildActionBreakdown(logs: AuditLog[]): SliceDatum[] {
  const counts = new Map<string, number>();
  for (const log of logs) counts.set(log.action, (counts.get(log.action) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([action, value]) => ({ name: humanize(action), value }));
}

/**
 * Server Component: stats and recent audit logs are fetched in parallel on the server,
 * aggregated here, and only the small chart-ready arrays are sent to the client charts.
 */
export default async function AdminOverviewPage() {
  const [me, stats, logs] = await Promise.all([
    getMe(),
    serverFetch<PlatformStats>("/admin/stats"),
    serverFetch<AuditLog[]>("/admin/audit-logs", { query: { limit: 100, sortOrder: "desc" } }),
  ]);
  const s = stats.data;
  const admins = Math.max(s.totalUsers - s.totalCompanies - s.totalCandidates, 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Good to see you, ${me.name.split(" ")[0]}`}
        description="Platform health at a glance: accounts, hiring activity and revenue."
        actions={<SweepAttemptsButton />}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total users" value={formatNumber(s.totalUsers)} icon={Users} hint={`${admins} admin${admins === 1 ? "" : "s"}`} />
        <StatCard label="Companies" value={formatNumber(s.totalCompanies)} icon={Building2} accent="info" />
        <StatCard label="Candidates" value={formatNumber(s.totalCandidates)} icon={GraduationCap} accent="success" />
        <StatCard
          label="Revenue"
          value={formatMoney(s.totalRevenue)}
          icon={Banknote}
          accent="warning"
          hint={`${s.totalPayments} paid subscription${s.totalPayments === 1 ? "" : "s"}`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ActivityChart data={buildActivity(logs.data)} />
        <UsersByRoleChart
          data={[
            { name: "Candidates", value: s.totalCandidates },
            { name: "Companies", value: s.totalCompanies },
            { name: "Admins", value: admins },
          ]}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ActionBreakdownChart data={buildActionBreakdown(logs.data)} />
        </div>
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between">
            <div className="space-y-1">
              <CardTitle>Assessments</CardTitle>
              <CardDescription>
                {s.publishedAssessments} of {s.totalAssessments} currently published
              </CardDescription>
            </div>
            <ClipboardList className="size-5 text-muted-foreground" aria-hidden />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-violet-500"
                style={{ width: `${s.totalAssessments ? (s.publishedAssessments / s.totalAssessments) * 100 : 0}%` }}
              />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Recent activity</p>
              <ul className="divide-y">
                {logs.data.slice(0, 5).map((log) => (
                  <li key={log.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{humanize(log.action)}</p>
                      <p className="truncate text-xs text-muted-foreground">{log.actor?.name ?? "System / gateway"}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <StatusBadge status={log.entityType} tone="neutral" />
                      <span className="text-xs text-muted-foreground">{formatRelative(log.createdAt)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/audit-logs">
                View full audit log <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
