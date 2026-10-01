"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useSubscribe } from "@/hooks/queries/use-company";
import { formatMoney } from "@/lib/format";
import type { Plan } from "@/types/api";

/**
 * Starts an SSLCommerz checkout session via the API and hands the browser over to the hosted
 * payment page. Free plans activate immediately without the gateway.
 */
export function SubscribeButton({ plan, isCurrent, highlighted }: { plan: Plan; isCurrent: boolean; highlighted?: boolean }) {
  const router = useRouter();
  const subscribe = useSubscribe();
  const [redirecting, setRedirecting] = useState(false);
  const isFree = Number(plan.price) === 0;
  const busy = subscribe.isPending || redirecting;

  const start = () =>
    subscribe.mutate(plan.id, {
      onSuccess: ({ data }) => {
        if (data.freePlan) {
          toast.success("You're on the Free plan");
          router.refresh();
          return;
        }
        setRedirecting(true);
        toast.loading("Redirecting to SSLCommerz secure checkout…");
        window.location.assign(data.gatewayPageURL);
      },
    });

  const label = isCurrent ? (isFree ? "Current plan" : "Renew plan") : isFree ? "Switch to Free" : `Upgrade to ${plan.name.toLowerCase()}`;

  if (isCurrent && isFree) {
    return (
      <Button className="w-full" variant="outline" disabled>
        Current plan
      </Button>
    );
  }

  if (isFree) {
    return (
      <ConfirmDialog
        trigger={
          <Button className="w-full" variant="outline" disabled={busy}>
            {busy ? <Loader2 className="animate-spin" /> : null}
            {label}
          </Button>
        }
        title="Switch to the Free plan?"
        description="Free allows 1 published assessment. Anything above the limit stays published, but you won't be able to publish more."
        confirmLabel="Switch to Free"
        pending={busy}
        onConfirm={start}
      />
    );
  }

  return (
    <ConfirmDialog
      trigger={
        <Button className="w-full" size="lg" variant={highlighted ? "default" : "outline"} disabled={busy}>
          {busy ? <Loader2 className="animate-spin" /> : <ExternalLink />}
          {busy ? "Opening checkout…" : label}
        </Button>
      }
      title={`Pay ${formatMoney(plan.price, plan.currency)} for ${plan.name}?`}
      description={
        <span className="flex flex-col gap-2">
          <span>
            You&apos;ll be redirected to SSLCommerz to pay securely. Your plan activates as soon as the payment is confirmed and runs for{" "}
            {plan.durationDays} days.
          </span>
          <span className="flex items-center gap-1.5 text-xs">
            <ShieldCheck className="size-3.5 text-success" /> Sandbox mode: use the SSLCommerz test card or mobile banking OTP.
          </span>
        </span>
      }
      confirmLabel="Continue to payment"
      pending={busy}
      onConfirm={start}
    />
  );
}
