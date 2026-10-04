import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { PlanCard } from "@/components/shared/plan-card";
import { getPublicPlans } from "@/lib/api/public";
import type { Plan } from "@/types/api";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple plans for technical hiring. Start free with one active assessment and upgrade through SSLCommerz as you grow.",
  openGraph: { title: "CodeAssess pricing", description: "Free, Basic and Pro plans for developer assessments.", url: "/pricing" },
};

const FAQ = [
  {
    q: "What counts as an active assessment?",
    a: "An assessment is active while it is published. Drafts and archived assessments don't count, so you can archive old roles to free up a slot.",
  },
  {
    q: "How are payments processed?",
    a: "Paid plans are charged through SSLCommerz. You're redirected to their secure checkout, and your plan activates as soon as the payment is validated.",
  },
  {
    q: "What happens when my plan period ends?",
    a: "Paid plans run for 30 days. Renew any time from Billing; your assessments and results are never deleted.",
  },
  {
    q: "Can candidates use CodeAssess for free?",
    a: "Yes. Candidates never pay: they register, accept invitations and take assessments at no cost.",
  },
  {
    q: "How are coding answers graded?",
    a: "MCQ answers are scored automatically. Coding and written answers are reviewed by your team against your model answer, with marks and written feedback.",
  },
];

async function loadPlans(): Promise<Plan[] | null> {
  try {
    return await getPublicPlans();
  } catch {
    return null;
  }
}

export default async function PricingPage() {
  const plans = await loadPlans();

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
      <div className="mx-auto max-w-2xl space-y-4 text-center">
        <p className="text-sm font-semibold tracking-wider text-primary uppercase">Pricing</p>
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">Pay for hiring capacity, not seats</h1>
        <p className="text-lg text-muted-foreground">
          Every plan includes all question types, grading and analytics. Upgrade when you need more roles open at once.
        </p>
      </div>

      <h2 className="sr-only">Plans</h2>
      {plans ? (
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              highlighted={plan.name === "BASIC"}
              action={
                <Button asChild className="w-full" size="lg" variant={plan.name === "BASIC" ? "default" : "outline"}>
                  <Link href={`/register?role=COMPANY&plan=${plan.name}`}>
                    {Number(plan.price) === 0 ? "Start for free" : `Get ${plan.name.toLowerCase()}`}
                  </Link>
                </Button>
              }
            />
          ))}
        </div>
      ) : (
        <p role="alert" className="mt-14 rounded-xl border border-dashed p-10 text-center text-muted-foreground">
          Plans are temporarily unavailable. Please refresh in a moment.
        </p>
      )}

      <p className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <ShieldCheck className="size-4 text-success" aria-hidden /> Secure checkout by SSLCommerz · Prices in BDT
      </p>

      <section id="faq" className="mx-auto mt-24 max-w-3xl scroll-mt-24">
        <h2 className="text-center text-3xl font-semibold tracking-tight">Frequently asked questions</h2>
        <Accordion type="single" collapsible className="mt-8">
          {FAQ.map((item, i) => (
            <AccordionItem key={item.q} value={`faq-${i}`}>
              <AccordionTrigger className="text-base">{item.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
}
