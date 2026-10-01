"use server";

import { revalidateTag } from "next/cache";
import { getSession } from "@/lib/api/server";

/**
 * Server Action: after an admin edits a plan, purge the cached plan catalogue so the public
 * Home/Pricing pages (statically rendered with ISR) show the change immediately.
 */
export async function revalidatePlans() {
  const session = await getSession();
  if (session?.role !== "ADMIN") return { ok: false as const };
  revalidateTag("plans");
  return { ok: true as const };
}
