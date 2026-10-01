"use client";

import { Suspense, useEffect, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen, Menu } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Logo } from "@/components/shared/logo";
import { StatusBadge } from "@/components/shared/status-badge";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { ROLE_HOME, ROLE_LABEL } from "@/lib/auth/constants";
import { cn } from "@/lib/utils";
import { ServerUserContext } from "@/hooks/use-current-user";
import { useAuthStore } from "@/stores/auth-store";
import { useUIStore } from "@/stores/ui-store";
import type { Me } from "@/types/api";
import { SidebarNav } from "./sidebar-nav";
import { UserMenu } from "./user-menu";

/** Shows a toast when middleware bounced the user away from another role's area. */
function DeniedNotice() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const denied = searchParams.get("denied");

  useEffect(() => {
    if (!denied) return;
    toast.warning("You don't have access to that area", {
      description: `${denied} belongs to a different role, so we brought you to your dashboard.`,
    });
    const params = new URLSearchParams(searchParams.toString());
    params.delete("denied");
    router.replace(params.size ? `${pathname}?${params}` : pathname, { scroll: false });
  }, [denied, pathname, router, searchParams]);

  return null;
}

export function DashboardShell({ user, children }: { user: Me; children: ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);
  const { mobileNavOpen, setMobileNavOpen, sidebarCollapsed, toggleSidebar } = useUIStore();

  // Sync the global auth store with the server-fetched profile (also after router.refresh()).
  useEffect(() => setUser(user), [setUser, user]);

  const pathname = usePathname();
  useEffect(() => setMobileNavOpen(false), [pathname, setMobileNavOpen]);

  const roleBadge = <StatusBadge status={user.role} label={`${ROLE_LABEL[user.role]} workspace`} />;

  return (
    <ServerUserContext.Provider value={user}>
    <div className="flex min-h-dvh">
      <Suspense fallback={null}>
        <DeniedNotice />
      </Suspense>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "sticky top-0 hidden h-dvh shrink-0 flex-col border-r bg-sidebar transition-[width] duration-200 lg:flex",
          sidebarCollapsed ? "w-[72px]" : "w-64",
        )}
      >
        <div className={cn("flex h-16 items-center border-b px-4", sidebarCollapsed && "justify-center px-0")}>
          <Logo href={ROLE_HOME[user.role]} compact={sidebarCollapsed} />
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-5">
          <SidebarNav role={user.role} collapsed={sidebarCollapsed} />
        </div>
        <div className={cn("border-t p-3", sidebarCollapsed && "flex justify-center")}>
          {sidebarCollapsed ? null : <div className="mb-3 px-1">{roleBadge}</div>}
          <Button
            variant="ghost"
            size={sidebarCollapsed ? "icon" : "sm"}
            onClick={toggleSidebar}
            className={cn(!sidebarCollapsed && "w-full justify-start")}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
            {sidebarCollapsed ? null : "Collapse"}
          </Button>
        </div>
      </aside>

      {/* Mobile drawer */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-72 bg-sidebar p-0">
          <SheetHeader className="border-b">
            <SheetTitle asChild>
              <div>
                <Logo href={ROLE_HOME[user.role]} />
              </div>
            </SheetTitle>
            <SheetDescription asChild>
              <div>{roleBadge}</div>
            </SheetDescription>
          </SheetHeader>
          <div className="overflow-y-auto px-3 py-4">
            <SidebarNav role={user.role} onNavigate={() => setMobileNavOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b bg-background/80 px-4 backdrop-blur-lg sm:px-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileNavOpen(true)} aria-label="Open navigation">
              <Menu />
            </Button>
            <Logo href={ROLE_HOME[user.role]} className="lg:hidden" compact />
            <div className="hidden lg:block">{roleBadge}</div>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <UserMenu />
          </div>
        </header>
        <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
    </ServerUserContext.Provider>
  );
}
