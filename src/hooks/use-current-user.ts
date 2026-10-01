"use client";

import { createContext, useContext } from "react";
import { useAuthStore } from "@/stores/auth-store";
import type { Me } from "@/types/api";

/** Server-fetched user supplied by the dashboard layout — available on the very first render. */
export const ServerUserContext = createContext<Me | null>(null);

/**
 * The signed-in user inside the dashboard. Prefers the global store (which reflects optimistic
 * profile edits) and falls back to the server-provided snapshot before hydration.
 */
export function useCurrentUser(): Me {
  const serverUser = useContext(ServerUserContext);
  const storeUser = useAuthStore((s) => s.user);
  const user = storeUser && storeUser.id === serverUser?.id ? storeUser : serverUser;
  if (!user) throw new Error("useCurrentUser must be used inside the dashboard layout");
  return user;
}
