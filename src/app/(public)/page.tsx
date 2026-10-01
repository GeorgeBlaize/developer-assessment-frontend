import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Code2,
  CreditCard,
  GraduationCap,
  ListChecks,
  MailPlus,
  ShieldCheck,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExamPreview } from "@/components/marketing/exam-preview";
import { PlanCard } from "@/components/shared/plan-card";
import { getPublicPlans } from "@/lib/api/public";
import type { Plan } from "@/types/api";

export const revalidate = 600;

const WORKFLOW = [
  {
    icon: Building2,
    role: "Companies",
    title: "Build & invite",
    points: ["Mix coding, MCQ and written questions", "Set duration, pass mark and an open window", "Invite registered candidates by email"],
  },
  {
    icon: GraduationCap,
    role: "Candidates",
    title: "Take timed attempts",
    points: ["Accept or decline invitations", "Server-enforced countdown that survives refreshes", "Answers autosave as you go"],
  },
  {
    icon: ShieldCheck,
    role: "Admins",
    title: "Govern the platform",
    points: ["Activate, deactivate or remove accounts", "Tune subscription plans and limits", "Full audit trail of every key action"],
  },
];

const FEATURES = [
  { icon: Code2, title: "Code editor built in", body: "Syntax-highlighted editor with starter code and visible test cases." },
  { icon: ListChecks, title: "Instant MCQ scoring", body: "Multiple-choice answers are graded the moment they are saved." },
  { icon: ClipboardCheck, title: "Rubric-guided grading", body: "Grade written and coding answers against a model answer, with feedback." },
  { icon: Timer, title: "Tamper-proof timers", body: "Deadlines are enforced server-side; late answers are rejected automatically." },
  { icon: BarChart3, title: "Pass-rate analytics", body: "Invitation funnel, average score and pass rate for every assessment." },
  { icon: CreditCard, title: "Simple plans", body: "Start free, upgrade through SSLCommerz when you need more capacity." },
];

async function loadPlans(): Promise<Plan[]> {
  try {
    return await getPublicPlans();
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const plans = await loadPlans();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" />
        <div aria-hidden className="absolute -top-40 left-1/2 h-96 w-[48rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pt-16 pb-20 sm:px-6 md:pt-24 lg:grid-cols-[1.05fr_1fr]">
          <div className="space-y-7">
            <span className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="size-1.5 rounded-full bg-success" /> Skills-first technical hiring
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Hire developers on <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">evidence</span>, not résumés.
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              CodeAssess lets your team build coding, multiple-choice and written assessments, invite candidates to
              timed attempts and grade them in one place, then compare pass rates across every role.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-11 px-5 text-base">
                <Link href="/register?role=COMPANY">
                  Start hiring free <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-11 px-5 text-base">
                <Link href="/login">Try a demo account</Link>
              </Button>
            </div>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {["Free plan, no card required", "3 question types", "Role-based workspaces"].map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-success" aria-hidden /> {item}
                </li>
              ))}
            </ul>
          </div>
          <ExamPreview />
        </div>
      </section>

      {/* Workflow by role */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl space-y-3 text-center">
            <h2 className="text-3xl font-semibold tracking-tight">One platform, three tailored workspaces</h2>
            <p className="text-muted-foreground">
              Every role gets its own dashboard, navigation and permissions, enforced on the server and in the UI.
            </p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {WORKFLOW.map(({ icon: Icon, role, title, points }) => (
              <div key={role} className="rounded-2xl border bg-card p-6 shadow-sm">
                <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden />
                </span>
                <p className="mt-5 text-xs font-semibold tracking-wider text-primary uppercase">{role}</p>
                <h3 className="mt-1 text-lg font-semibold">{title}</h3>
                <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                  {points.map((p) => (
                    <li key={p} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden /> {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features + image */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border shadow-lg">
          <Image
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
            alt="A hiring team reviewing candidate results together"
            fill
            sizes="(min-width: 1024px) 560px, 100vw"
            className="object-cover"
          />
        </div>
        <div className="space-y-8">
          <div className="space-y-3">
            <h2 className="text-3xl font-semibold tracking-tight">Everything a technical screen needs</h2>
            <p className="text-muted-foreground">
              From writing the first question to sharing the shortlist, without spreadsheets or email threads.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="space-y-2">
                <Icon className="size-5 text-primary" aria-hidden />
                <h3 className="font-medium">{title}</h3>
                <p className="text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
          <Button asChild variant="link" className="px-0">
            <Link href="/features">
              Explore all features <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>

      {/* Plans */}
      {plans.length > 0 ? (
        <section className="border-t bg-muted/30">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <div className="mx-auto max-w-2xl space-y-3 text-center">
              <h2 className="text-3xl font-semibold tracking-tight">Plans that scale with your hiring</h2>
              <p className="text-muted-foreground">Limits are enforced by the platform, so you only pay for capacity you use.</p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  highlighted={plan.name === "BASIC"}
                  action={
                    <Button asChild className="w-full" size="lg" variant={plan.name === "BASIC" ? "default" : "outline"}>
                      <Link href="/register?role=COMPANY">Choose {plan.name.toLowerCase()}</Link>
                    </Button>
                  }
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-violet-600 px-6 py-14 text-center text-primary-foreground sm:px-12">
          <div aria-hidden className="bg-grid absolute inset-0 opacity-20" />
          <div className="relative mx-auto max-w-2xl space-y-5">
            <MailPlus className="mx-auto size-8" aria-hidden />
            <h2 className="text-3xl font-semibold tracking-tight">Send your first assessment today</h2>
            <p className="text-primary-foreground/80">
              Create a free company account, publish an assessment and invite your first candidates in minutes.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" variant="secondary" className="h-11 px-5">
                <Link href="/register?role=COMPANY">Create company account</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="h-11 px-5 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
              >
                <Link href="/register?role=CANDIDATE">I&apos;m a candidate</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
