"use client";

import { useState } from "react";
import { Building2, GraduationCap, Loader2, ShieldCheck, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSignIn } from "@/hooks/use-sign-in";
import { getErrorMessage } from "@/lib/api/errors";
import { DEMO_ACCOUNTS } from "@/lib/auth/demo-accounts";
import { cn } from "@/lib/utils";
import type { LoginInput } from "@/lib/validations/auth";
import type { Role } from "@/types/api";

const ROLE_STYLE: Record<Role, { icon: LucideIcon; tint: string }> = {
  ADMIN: { icon: ShieldCheck, tint: "bg-rose-500/10 text-rose-600 dark:text-rose-300" },
  COMPANY: { icon: Building2, tint: "bg-primary/10 text-primary" },
  CANDIDATE: { icon: GraduationCap, tint: "bg-sky-500/10 text-sky-600 dark:text-sky-300" },
};

/** One-click demo sign-in for each of the three roles (seeded evaluation accounts). */
export function DemoLoginPanel() {
  const [activeRole, setActiveRole] = useState<Role | null>(null);
  const signIn = useSignIn<LoginInput>("/api/auth/login");

  const login = (role: Role) => {
    const account = DEMO_ACCOUNTS.find((a) => a.role === role);
    if (!account) return;
    setActiveRole(role);
    signIn.mutate(
      { email: account.email, password: account.password },
      {
        onError: (error) => {
          toast.error(getErrorMessage(error));
          setActiveRole(null);
        },
      },
    );
  };

  return (
    <section aria-labelledby="demo-login-heading" className="space-y-3">
      <div className="text-center">
        <h2 id="demo-login-heading" className="text-sm font-semibold">
          🚀 Quick demo login
        </h2>
        <p className="text-xs text-muted-foreground">Explore each role with seeded data. No typing needed.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {DEMO_ACCOUNTS.map((account) => {
          const { icon: Icon, tint } = ROLE_STYLE[account.role];
          const loading = signIn.isPending && activeRole === account.role;
          return (
            <div
              key={account.role}
              className="flex flex-col items-center gap-2 rounded-xl border bg-card p-3 text-center transition-colors hover:border-primary/40"
            >
              <span className={cn("grid size-9 place-items-center rounded-lg", tint)}>
                <Icon className="size-4.5" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold">{account.title}</p>
                <p className="text-[11px] leading-tight text-muted-foreground">{account.description}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-auto w-full"
                disabled={signIn.isPending}
                onClick={() => login(account.role)}
                aria-label={`Demo login as ${account.title}`}
              >
                {loading ? <Loader2 className="animate-spin" /> : null}
                {loading ? "Signing in…" : "Demo Login"}
              </Button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
