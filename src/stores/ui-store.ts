import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  /** Mobile navigation drawer. */
  mobileNavOpen: boolean;
  /** Desktop sidebar collapsed to icons (remembered across visits). */
  sidebarCollapsed: boolean;
  setMobileNavOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      mobileNavOpen: false,
      sidebarCollapsed: false,
      setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    }),
    {
      name: "codeassess-ui",
      partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed }),
      // Rehydrated after mount (DashboardShell) so server and first client render match.
      skipHydration: true,
    },
  ),
);
