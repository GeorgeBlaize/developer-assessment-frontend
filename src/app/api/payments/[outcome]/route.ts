import { NextResponse, type NextRequest } from "next/server";
import { callBackend } from "@/lib/api/backend";
import type { Payment } from "@/types/api";

/**
 * SSLCommerz browser callback (success_url / fail_url / cancel_url point here).
 *
 * The gateway POSTs form data (tran_id, val_id, status…) from the customer's browser. We forward
 * it to the API, which validates the transaction server-to-server with SSLCommerz and activates
 * the subscription, then redirect the customer to a friendly result page in the app.
 * 303 turns the POST into a GET so a refresh never re-submits the payment.
 */
type Outcome = "success" | "fail" | "cancel";
const OUTCOMES: Outcome[] = ["success", "fail", "cancel"];

async function readParams(request: NextRequest): Promise<Record<string, string>> {
  const params: Record<string, string> = Object.fromEntries(request.nextUrl.searchParams);
  if (request.method === "POST") {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      Object.assign(params, (await request.json().catch(() => ({}))) as Record<string, string>);
    } else {
      const form = await request.formData().catch(() => null);
      form?.forEach((value, key) => {
        if (typeof value === "string") params[key] = value;
      });
    }
  }
  return params;
}

async function handle(request: NextRequest, { params }: { params: Promise<{ outcome: string }> }) {
  const { outcome } = await params;
  if (!OUTCOMES.includes(outcome as Outcome)) {
    return NextResponse.json({ success: false, message: "Unknown payment outcome" }, { status: 404 });
  }

  const data = await readParams(request);
  const tranId = data.tran_id;
  const redirect = (page: Outcome, extra: Record<string, string> = {}) => {
    const url = new URL(`/payment/${page}`, request.url);
    if (tranId) url.searchParams.set("tranId", tranId);
    for (const [k, v] of Object.entries(extra)) url.searchParams.set(k, v);
    return NextResponse.redirect(url, 303);
  };

  if (!tranId) return redirect("fail", { reason: "Missing transaction reference from the payment gateway." });

  const { body } = await callBackend<Payment>(`/payments/${outcome}`, {
    method: "POST",
    body: JSON.stringify({ tran_id: tranId, val_id: data.val_id, status: data.status }),
  });

  if (outcome === "success") {
    return body.success && body.data.status === "PAID"
      ? redirect("success")
      : redirect("fail", { reason: body.success ? "Payment could not be confirmed." : body.message });
  }
  return redirect(outcome as Outcome);
}

export { handle as GET, handle as POST };
