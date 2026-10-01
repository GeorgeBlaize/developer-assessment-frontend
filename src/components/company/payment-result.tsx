import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDateTime, formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Payment } from "@/types/api";

interface PaymentResultProps {
  icon: LucideIcon;
  tone: "success" | "danger" | "neutral";
  title: string;
  description: ReactNode;
  payment?: Payment;
  tranId?: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
}

const TONES = {
  success: "bg-success/12 text-success ring-success/25",
  danger: "bg-destructive/10 text-destructive ring-destructive/20",
  neutral: "bg-muted text-muted-foreground ring-border",
};

export function PaymentResult({ icon: Icon, tone, title, description, payment, tranId, primary, secondary }: PaymentResultProps) {
  return (
    <Card className="items-center gap-6 px-6 py-10 text-center sm:px-10">
      <span className={cn("grid size-16 place-items-center rounded-full ring-8", TONES[tone])}>
        <Icon className="size-8" aria-hidden />
      </span>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <div className="text-muted-foreground">{description}</div>
      </div>

      {payment ? (
        <dl className="grid w-full gap-3 rounded-xl border bg-muted/30 p-4 text-left text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Plan</dt>
            <dd className="font-medium">{payment.plan.name}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Amount</dt>
            <dd className="font-medium">{formatMoney(payment.amount, payment.currency)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Status</dt>
            <dd>
              <StatusBadge status={payment.status} />
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Date</dt>
            <dd>{formatDateTime(payment.validatedAt ?? payment.createdAt)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Reference</dt>
            <dd className="truncate font-mono text-xs">{payment.tranId}</dd>
          </div>
        </dl>
      ) : tranId ? (
        <p className="font-mono text-xs text-muted-foreground">Reference: {tranId}</p>
      ) : null}

      <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
        <Button asChild size="lg">
          <Link href={primary.href}>{primary.label}</Link>
        </Button>
        {secondary ? (
          <Button asChild size="lg" variant="outline">
            <Link href={secondary.href}>{secondary.label}</Link>
          </Button>
        ) : null}
      </div>
    </Card>
  );
}
