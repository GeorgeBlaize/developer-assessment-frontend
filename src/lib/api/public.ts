import "server-only";
import type { Plan } from "@/types/api";
import { serverFetch } from "./server";

/** Public plan catalogue — cached in Next's data cache and revalidated every 10 minutes. */
export async function getPublicPlans(): Promise<Plan[]> {
  const { data } = await serverFetch<Plan[]>("/plans", { public: true, revalidate: 600, tags: ["plans"] });
  return data;
}
