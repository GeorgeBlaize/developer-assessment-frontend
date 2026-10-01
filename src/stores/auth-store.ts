import { create } from "zustand";
import type { Me } from "@/types/api";

interface AuthState {
  user: Me | null;
  setUser: (user: Me | null) => void;
  patchUser: (patch: Partial<Me>) => void;
  clear: () => void;
}

/**
 * Signed-in user, hydrated once from the dashboard's server layout (see SessionHydrator).
 * Lets deep client components (topbar, profile forms, role-gated buttons) read the user
 * without prop drilling or extra requests.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  patchUser: (patch) => set((state) => (state.user ? { user: { ...state.user, ...patch } } : state)),
  clear: () => set({ user: null }),
}));
