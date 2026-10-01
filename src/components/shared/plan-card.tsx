import type { ReactNode } from "react";
import { Check, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatMoney, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Plan } from "@/types/api";

const PLAN_TAGLINES: Record<Plan["name"], string> = {
  FREE: "Try the full workflow on a single role.",
  BASIC: "For teams hiring steadily each month.",
  PRO: "High-volume hiring across many roles.",
};

interface PlanCardProps {
  plan: Plan;
  highlighted?: boolean;
  current?: boolean;
  action?: ReactNode;
}

export function PlanCard({ plan, highlighted, current, action }: PlanCardProps) {
  const isFree = Number(plan.price) === 0;
  return (
    <Card
      className={cn(
        "relative gap-6 px-6 py-7",
        highlighted && "ring-2 ring-primary shadow-xl shadow-primary/10",
        current && "ring-2 ring-success",
      )}
    >
      {highlighted && !current ? (
        <span className="absolute top-0 right-6 -translate-y-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
          <Sparkles className="mr-1 inline size-3" aria-hidden />
          Most popular
        </span>
      ) : null}
      {current ? (
        <span className="absolute top-0 right-6 -translate-y-1/2 rounded-full bg-success px-3 py-1 text-xs font-medium text-success-foreground">
          Current plan
        </span>
      ) : null}

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{plan.name.charAt(0) + plan.name.slice(1).toLowerCase()}</h3>
        <p className="text-sm text-muted-foreground">{PLAN_TAGLINES[plan.name]}</p>
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-4xl font-semibold tracking-tight">{isFree ? "Free" : formatMoney(plan.price, plan.currency)}</span>
        {!isFree ? <span className="text-sm text-muted-foreground">/ {plan.durationDays} days</span> : null}
      </div>

      <ul className="space-y-2.5 text-sm">
        <li className="flex gap-2.5">
          <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          {formatNumber(plan.maxActiveAssessments)} active assessment{plan.maxActiveAssessments === 1 ? "" : "s"}
        </li>
        <li className="flex gap-2.5">
          <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          Up to {formatNumber(plan.maxInvitesPerAssessment)} invites per assessment
        </li>
        {plan.features
          .filter((f) => !/active assessment|invites per assessment/i.test(f))
          .map((feature) => (
            <li key={feature} className="flex gap-2.5">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              {feature}
            </li>
          ))}
        <li className="flex gap-2.5">
          <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          Coding, MCQ & written questions
        </li>
      </ul>

      {action ? <div className="mt-auto">{action}</div> : null}
    </Card>
  );
}
