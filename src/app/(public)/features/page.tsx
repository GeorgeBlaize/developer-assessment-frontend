import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  ClipboardCheck,
  Code2,
  FileText,
  History,
  ListChecks,
  Lock,
  MailPlus,
  Timer,
  UserCog,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Coding, MCQ and written questions, timed attempts, manual grading with feedback, analytics, plan limits and a full audit trail.",
  openGraph: { title: "CodeAssess features", url: "/features" },
};

const GROUPS = [
  {
    title: "Author assessments",
    description: "A three-step builder takes you from a blank page to a published assessment.",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
    alt: "Laptop showing source code in an editor",
    items: [
      { icon: Code2, title: "Coding questions", body: "Language hint, starter code and input/expected-output test cases." },
      { icon: ListChecks, title: "Multiple choice", body: "Two or more options with one correct answer, scored instantly." },
      { icon: FileText, title: "Written answers", body: "Open questions with a private model answer to guide graders." },
      { icon: Timer, title: "Timing rules", body: "Duration, pass mark and an optional start/end availability window." },
    ],
  },
  {
    title: "Run fair, timed attempts",
    description: "Candidates get a focused exam workspace that respects the clock and saves every answer.",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
    alt: "Developer working on a laptop at a desk",
    items: [
      { icon: MailPlus, title: "Invitations", body: "Invite registered candidates in bulk; they accept or decline in their inbox." },
      { icon: Lock, title: "Server-side deadlines", body: "The countdown comes from the server and late answers are rejected." },
      { icon: History, title: "Autosave", body: "Answers save as candidates move between questions and are restored on reload." },
    ],
  },
  {
    title: "Grade and decide",
    description: "Everything you need to turn submissions into a confident shortlist.",
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=80",
    alt: "Team discussing results around a table with laptops",
    items: [
      { icon: ClipboardCheck, title: "Grading queue", body: "Filter pending answers, award marks up to the question's weight, leave feedback." },
      { icon: BarChart3, title: "Analytics", body: "Invitation funnel, average score, pass count and pass rate per assessment." },
      { icon: UserCog, title: "Admin governance", body: "User management, plan configuration and a searchable audit log." },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
      <div className="mx-auto max-w-2xl space-y-4 text-center">
        <p className="text-sm font-semibold tracking-wider text-primary uppercase">Features</p>
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">The whole technical screen, end to end</h1>
        <p className="text-lg text-muted-foreground">
          Author, invite, assess, grade and analyse, with role-based workspaces for companies, candidates and admins.
        </p>
      </div>

      <div className="mt-20 space-y-24">
        {GROUPS.map((group, index) => (
          <section key={group.title} className="grid items-center gap-10 lg:grid-cols-2">
            <div className={index % 2 === 1 ? "lg:order-2" : undefined}>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{group.title}</h2>
              <p className="mt-3 text-muted-foreground">{group.description}</p>
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                {group.items.map(({ icon: Icon, title, body }) => (
                  <div key={title} className="flex gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-4.5" aria-hidden />
                    </span>
                    <div>
                      <h3 className="font-medium">{title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border shadow-lg">
              <Image src={group.image} alt={group.alt} fill sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" />
            </div>
          </section>
        ))}
      </div>

      <div className="mt-24 flex flex-col items-center gap-4 text-center">
        <h2 className="text-2xl font-semibold">See it with real data</h2>
        <p className="max-w-md text-muted-foreground">Log in with a one-click demo account for any of the three roles.</p>
        <Button asChild size="lg">
          <Link href="/login">
            Open the demo <ArrowRight />
          </Link>
        </Button>
      </div>
    </div>
  );
}
