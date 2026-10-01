"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { NAVIGATION, isNavItemActive } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import type { Role } from "@/types/api";

interface SidebarNavProps {
  role: Role;
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function SidebarNav({ role, collapsed, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Dashboard" className="flex flex-col gap-5">
      {NAVIGATION[role].map((section, i) => (
        <div key={section.title ?? i} className="space-y-1">
          {section.title && !collapsed ? (
            <p className="px-3 pb-1 text-[11px] font-semibold tracking-wider text-muted-foreground/80 uppercase">
              {section.title}
            </p>
          ) : null}
          {section.items.map((item) => {
            const active = isNavItemActive(pathname, item);
            const link = (
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                  collapsed && "justify-center px-0",
                )}
              >
                <item.icon
                  className={cn("size-4.5 shrink-0", active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")}
                  aria-hidden
                />
                <span className={cn(collapsed && "sr-only")}>{item.label}</span>
              </Link>
            );
            return collapsed ? (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            ) : (
              <div key={item.href}>{link}</div>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
