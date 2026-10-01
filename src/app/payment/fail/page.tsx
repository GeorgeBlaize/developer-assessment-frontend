import type { Metadata } from "next";
import { XCircle } from "lucide-react";
import { PaymentResult } from "@/components/company/payment-result";
import { findPayment } from "../find-payment";

export const metadata: Metadata = { title: "Payment failed" };

export default async function PaymentFailPage({ searchParams }: { searchParams: Promise<{ tranId?: string; reason?: string }> }) {
  const { tranId, reason } = await searchParams;
  const payment = await findPayment(tranId);

  return (
    <PaymentResult
      icon={XCircle}
      tone="danger"
      title="Payment failed"
      description={
        <>
          {reason ?? "The payment was declined or couldn't be verified."} You haven&apos;t been charged for a plan change, and your current
          plan is unchanged.
        </>
      }
      payment={payment}
      tranId={tranId}
      primary={{ href: "/company/billing", label: "Try again" }}
      secondary={{ href: "/company", label: "Back to dashboard" }}
    />
  );
}
