import "server-only";
import { serverFetch } from "@/lib/api/server";
import type { Payment } from "@/types/api";

/** Looks the transaction up in the company's own payment history (the API's source of truth). */
export async function findPayment(tranId: string | undefined): Promise<Payment | undefined> {
  if (!tranId) return undefined;
  try {
    const { data } = await serverFetch<Payment[]>("/payments", { query: { limit: 20 } });
    return data.find((p) => p.tranId === tranId);
  } catch {
    return undefined;
  }
}
