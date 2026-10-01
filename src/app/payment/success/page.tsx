import type { Metadata } from "next";
import { CheckCircle2, Clock } from "lucide-react";
import { PaymentResult } from "@/components/company/payment-result";
import { findPayment } from "../find-payment";

export const metadata: Metadata = { title: "Payment successful" };

export default async function PaymentSuccessPage({ searchParams }: { searchParams: Promise<{ tranId?: string }> }) {
  const { tranId } = await searchParams;
  const payment = await findPayment(tranId);
  const confirmed = payment?.status === "PAID";

  return confirmed ? (
    <PaymentResult
      icon={CheckCircle2}
      tone="success"
      title="Payment successful"
      description={`Your ${payment.plan.name} plan is active. You can now publish up to ${payment.plan.maxActiveAssessments} assessments and invite up to ${payment.plan.maxInvitesPerAssessment} candidates each.`}
      payment={payment}
      primary={{ href: "/company/assessments/new", label: "Create an assessment" }}
      secondary={{ href: "/company/billing", label: "View billing" }}
    />
  ) : (
    <PaymentResult
      icon={Clock}
      tone="neutral"
      title="Confirming your payment"
      description="We haven't received confirmation from the gateway yet. This usually takes a few seconds. Check Billing shortly."
      payment={payment}
      tranId={tranId}
      primary={{ href: "/company/billing", label: "Go to billing" }}
    />
  );
}
