import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Award, CircleCheck, Inbox, Play, Timer, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { getMe, serverFetch } from "@/lib/api/server";
import { formatDate, formatDuration, formatRelative } from "@/lib/format";
import type { MyAttempt, MyInvitation } from "@/types/api";

export const metadata: Metadata = { title: "Candidate overview" };

export default async function CandidateOverviewPage() {
  const [me, invitations, attempts] = await Promise.all([
    getMe(),
    serverFetch<MyInvitation[]>("/invitations/me"),
    serverFetch<MyAttempt[]>("/attempts"),
  ]);
  const pending = invitations.data.filter((i) => i.status === "PENDING" && new Date(i.expiresAt) > new Date());
  const ready = invitations.data.filter((i) => i.status === "ACCEPTED" && !i.attempt && i.assessment.status === "PUBLISHED");
  const inProgress = attempts.data.filter((a) => a.status === "IN_PROGRESS");
  const finished = attempts.data.filter((a) => a.status !== "IN_PROGRESS" && a.status !== "NOT_STARTED");
  const passed = finished.filter((a) => a.isPassed).length;
  const skills = me.candidateProfile?.skills ?? [];

  const todo = [
    ...inProgress.map((a) => ({
      id: a.id,
      title: a.assessment.title,
      meta: `Started ${formatRelative(a.startedAt)}`,
      href: `/attempt/${a.id}`,
      cta: "Resume",
      icon: Play,
      urgent: true,
    })),
    ...ready.map((i) => ({
      id: i.id,
      title: i.assessment.title,
      meta: `${formatDuration(i.assessment.durationMinutes)} · accepted`,
      href: "/candidate/invitations",
      cta: "Start",
      icon: Timer,
      urgent: false,
    })),
    ...pending.map((i) => ({
      id: i.id,
      title: i.assessment.title,
      meta: `Respond by ${formatDate(i.expiresAt)}`,
      href: "/candidate/invitations",
      cta: "Respond",
      icon: Inbox,
      urgent: false,
    })),
  ];

  return (
    <div className="space-y-8">
      <PageHeader title={`Hi, ${me.name.split(" ")[0]} 👋`} description="Your invitations, attempts and results in one place." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="New invitations" value={pending.length} icon={Inbox} accent="warning" hint="Awaiting your response" />
        <StatCard label="In progress" value={inProgress.length} icon={Timer} accent="info" hint="Clock is running" />
        <StatCard label="Completed" value={finished.length} icon={CircleCheck} />
        <StatCard label="Passed" value={passed} icon={Award} accent="success" hint={finished.length ? `${Math.round((passed / finished.length) * 100)}% pass rate` : undefined} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Up next</CardTitle>
            <CardDescription>Things that need your attention</CardDescription>
          </CardHeader>
          <CardContent>
            {todo.length ? (
              <ul className="divide-y">
                {todo.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                        <item.icon className="size-4" aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.meta}</p>
                      </div>
                    </div>
                    <Button asChild size="sm" variant={item.urgent ? "default" : "outline"}>
                      <Link href={item.href}>{item.cta}</Link>
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState icon={Inbox} title="Nothing waiting" description="When a company invites you, it shows up here." className="py-10" />
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent results</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href="/candidate/results">
                  All <ArrowRight />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {finished.length ? (
                <ul className="space-y-3">
                  {finished.slice(0, 4).map((a) => (
                    <li key={a.id}>
                      <Link href={`/candidate/results/${a.id}`} className="flex items-center justify-between gap-3 rounded-lg p-2 -m-2 hover:bg-muted">
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">{a.assessment.title}</span>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {a.totalScore ?? 0} / {a.assessment.totalMarks}
                          </span>
                        </span>
                        {a.isPassed === null ? (
                          <StatusBadge status={a.status} />
                        ) : (
                          <StatusBadge status={a.isPassed ? "PASSED" : "NOT_PASSED"} label={a.isPassed ? "Passed" : "Not passed"} />
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Trophy className="size-4" aria-hidden /> No results yet
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Your skills</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href="/candidate/profile">Edit</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {skills.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((s) => (
                    <span key={s} className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Add skills so recruiters know your strengths.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
