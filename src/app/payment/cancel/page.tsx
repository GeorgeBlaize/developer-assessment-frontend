import type { Metadata } from "next";
import { Ban } from "lucide-react";
import { PaymentResult } from "@/components/company/payment-result";
import { findPayment } from "../find-payment";

export const metadata: Metadata = { title: "Payment cancelled" };

export default async function PaymentCancelPage({ searchParams }: { searchParams: Promise<{ tranId?: string }> }) {
  const { tranId } = await searchParams;
  const payment = await findPayment(tranId);

  return (
    <PaymentResult
      icon={Ban}
      tone="neutral"
      title="Payment cancelled"
      description="You left the checkout before paying. No charge was made and your current plan is unchanged."
      payment={payment}
      tranId={tranId}
      primary={{ href: "/company/billing", label: "Back to billing" }}
      secondary={{ href: "/pricing", label: "Compare plans" }}
    />
  );
}
