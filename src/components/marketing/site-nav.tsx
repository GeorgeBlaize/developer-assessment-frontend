"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowRight, LayoutDashboard, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Logo } from "@/components/shared/logo";
import { useSession } from "@/hooks/use-session";
import { ROLE_HOME } from "@/lib/auth/constants";
import { cn } from "@/lib/utils";

export const MARKETING_LINKS = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

function AuthActions({ stacked }: { stacked?: boolean }) {
  const { data: session, isPending } = useSession();

  if (isPending) return <Skeleton className={cn("h-9", stacked ? "w-full" : "w-40")} />;

  if (session) {
    return (
      <Button asChild size="lg" className={cn(stacked && "w-full")}>
        <Link href={ROLE_HOME[session.role]}>
          <LayoutDashboard /> Dashboard
        </Link>
      </Button>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", stacked && "flex-col-reverse items-stretch")}>
      <Button asChild variant="ghost" size="lg">
        <Link href="/login">Log in</Link>
      </Button>
      <Button asChild size="lg">
        <Link href="/register">
          Get started <ArrowRight />
        </Link>
      </Button>
    </div>
  );
}

/** Interactive part of the (otherwise static) marketing header: active link, auth CTA, mobile drawer. */
export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
        {MARKETING_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={pathname === link.href ? "page" : undefined}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
              pathname === link.href && "text-foreground",
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="hidden md:block">
        <AuthActions />
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[85vw] max-w-sm">
          <SheetHeader>
            <SheetTitle asChild>
              <div>
                <Logo />
              </div>
            </SheetTitle>
          </SheetHeader>
          <nav aria-label="Mobile" className="flex flex-col gap-1 px-4">
            {MARKETING_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={pathname === link.href ? "page" : undefined}
                className={cn(
                  "rounded-lg px-3 py-2.5 font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
                  pathname === link.href && "bg-muted text-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto p-4" onClick={() => setOpen(false)}>
            <AuthActions stacked />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
