import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { ArrowLeft, Building2, CalendarDays, Globe, GraduationCap, KeyRound, Mail, Phone, Wallet } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserAdminActions } from "@/components/admin/user-admin-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { orNotFound } from "@/lib/api/not-found";
import { serverFetch } from "@/lib/api/server";
import { ROLE_LABEL } from "@/lib/auth/constants";
import { formatDate, formatDateTime, formatMoney, initials } from "@/lib/format";
import type { Me } from "@/types/api";

type Props = { params: Promise<{ id: string }> };

// Shared by generateMetadata and the page so the API is called once per request.
const getUser = cache((id: string) => serverFetch<Me>(`/users/${id}`));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const { data } = await getUser(id);
    return { title: data.name };
  } catch {
    return { title: "User" };
  }
}

function Detail({ icon: Icon, label, children }: { icon: typeof Mail; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="text-sm font-medium break-words">{children}</dd>
      </div>
    </div>
  );
}

export default async function AdminUserDetailPage({ params }: Props) {
  const { id } = await params;
  const { data: user } = await orNotFound(getUser(id));
  const company = user.companyProfile;
  const candidate = user.candidateProfile;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/admin/users">
          <ArrowLeft /> All users
        </Link>
      </Button>

      <Card className="p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">{initials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1.5">
              <h1 className="text-2xl font-semibold tracking-tight">{user.name}</h1>
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={user.role} label={ROLE_LABEL[user.role]} />
                <StatusBadge status={user.isActive ? "ACTIVE" : "INACTIVE"} />
                <StatusBadge status={user.provider} tone="neutral" label={user.provider === "GOOGLE" ? "Google sign-in" : "Email & password"} />
              </div>
            </div>
          </div>
          {user.role !== "ADMIN" ? <UserAdminActions id={user.id} name={user.name} isActive={user.isActive} /> : null}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-5 sm:grid-cols-2">
              <Detail icon={Mail} label="Email">
                {user.email}
              </Detail>
              <Detail icon={KeyRound} label="Sign-in method">
                {user.provider === "GOOGLE" ? "Google" : "Password"}
              </Detail>
              <Detail icon={CalendarDays} label="Joined">
                {formatDate(user.createdAt)}
              </Detail>
              <Detail icon={CalendarDays} label="Last login">
                {formatDateTime(user.lastLoginAt, "Never")}
              </Detail>
            </dl>
          </CardContent>
        </Card>

        {company ? (
          <Card>
            <CardHeader>
              <CardTitle>Company</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-5 sm:grid-cols-2">
                <Detail icon={Building2} label="Company name">
                  {company.companyName}
                </Detail>
                <Detail icon={Globe} label="Website">
                  {company.website ? (
                    <a href={company.website} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                      {company.website.replace(/^https?:\/\//, "")}
                    </a>
                  ) : (
                    "—"
                  )}
                </Detail>
                <Detail icon={Wallet} label="Plan">
                  {company.plan ? `${company.plan.name} · ${formatMoney(company.plan.price, company.plan.currency)}` : "No plan"}
                </Detail>
                <Detail icon={CalendarDays} label="Subscription">
                  <span className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={company.subscriptionStatus} />
                    {company.subscriptionEndsAt ? `until ${formatDate(company.subscriptionEndsAt)}` : null}
                  </span>
                </Detail>
              </dl>
            </CardContent>
          </Card>
        ) : null}

        {candidate ? (
          <Card>
            <CardHeader>
              <CardTitle>Candidate profile</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-5 sm:grid-cols-2">
                <Detail icon={Phone} label="Phone">
                  {candidate.phone ?? "—"}
                </Detail>
                <Detail icon={GraduationCap} label="Résumé">
                  {candidate.resumeUrl ? (
                    <a href={candidate.resumeUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                      Open résumé
                    </a>
                  ) : (
                    "—"
                  )}
                </Detail>
              </dl>
              <div className="mt-5">
                <p className="mb-2 text-xs text-muted-foreground">Skills</p>
                {candidate.skills.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.skills.map((skill) => (
                      <span key={skill} className="rounded-md bg-muted px-2 py-1 text-xs font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No skills listed</p>
                )}
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
