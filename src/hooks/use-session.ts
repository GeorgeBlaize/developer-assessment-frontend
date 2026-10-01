"use client";

import { useQuery } from "@tanstack/react-query";
import type { Role } from "@/types/api";

export interface SessionClaims {
  userId: string;
  email: string;
  role: Role;
}

export const sessionQueryKey = ["session"] as const;

/**
 * Lightweight session check for statically rendered public pages (navbar CTA).
 * Dashboard pages get the full user from the server layout instead (see useAuthStore).
 */
export function useSession() {
  return useQuery({
    queryKey: sessionQueryKey,
    queryFn: async (): Promise<SessionClaims | null> => {
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      const json = (await res.json()) as { data: SessionClaims | null };
      return json.data;
    },
    staleTime: 60_000,
  });
}
