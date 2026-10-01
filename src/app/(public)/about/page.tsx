import type { Metadata } from "next";
import Image from "next/image";
import { Eye, Scale, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description: "Why we built CodeAssess: fairer, faster technical hiring that's grounded in what candidates can actually do.",
  openGraph: { title: "About CodeAssess", url: "/about" },
};

const VALUES = [
  {
    icon: Scale,
    title: "Fair by design",
    body: "Every candidate gets the same questions, the same clock and the same rubric. Deadlines are enforced by the server, not by trust.",
  },
  {
    icon: Eye,
    title: "Transparent",
    body: "Candidates see their score and grader feedback. Companies see exactly how each mark was awarded. Admins see an audit trail of every key action.",
  },
  {
    icon: Zap,
    title: "Fast to run",
    body: "Multiple-choice answers grade themselves and a focused queue handles the rest, so a shortlist takes hours, not weeks.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div className="space-y-5">
          <p className="text-sm font-semibold tracking-wider text-primary uppercase">About us</p>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">Hiring should reward skill, not polish</h1>
          <p className="text-lg text-muted-foreground">
            Résumés and unstructured interviews favour people who are good at presenting themselves. CodeAssess gives
            every applicant the same structured, timed task and gives hiring teams clear evidence to compare.
          </p>
          <p className="text-muted-foreground">
            The platform serves three groups: companies who design and grade assessments, candidates who take them,
            and administrators who keep the platform healthy. Each has its own workspace and permissions.
          </p>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border shadow-lg">
          <Image
            src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1200&q=80"
            alt="Engineer smiling while working at a computer"
            fill
            priority
            sizes="(min-width: 1024px) 560px, 100vw"
            className="object-cover"
          />
        </div>
      </div>

      <section className="mt-24">
        <h2 className="text-center text-3xl font-semibold tracking-tight">What we believe</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {VALUES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border bg-card p-6">
              <Icon className="size-6 text-primary" aria-hidden />
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
