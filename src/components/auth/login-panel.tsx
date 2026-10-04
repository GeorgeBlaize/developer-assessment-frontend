"use client";

import { useSearchParams } from "next/navigation";
import { Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { GOOGLE_ENABLED } from "@/lib/config";
import { LazyGoogleSignIn } from "./lazy-google-sign-in";
import { LoginForm } from "./login-form";

const REASONS: Record<string, string> = {
  session: "Your session has expired. Please log in again.",
};

/**
 * Reads ?next= and ?reason= on the client so the /login page itself can be statically
 * prerendered (instant load, metadata in <head>).
 */
export function LoginPanel() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const reason = searchParams.get("reason");

  return (
    <>
      {reason && REASONS[reason] ? (
        <Alert>
          <Info />
          <AlertDescription>{REASONS[reason]}</AlertDescription>
        </Alert>
      ) : null}

      <Card className="gap-4 p-6">
        <LoginForm next={next} />
        {GOOGLE_ENABLED ? (
          <>
            <div className="relative text-center text-xs text-muted-foreground uppercase">
              <span className="relative z-10 bg-card px-2">or</span>
              <span aria-hidden className="absolute inset-x-0 top-1/2 border-t" />
            </div>
            <LazyGoogleSignIn next={next} text="signin_with" />
          </>
        ) : null}
      </Card>
    </>
  );
}

export function LoginPanelSkeleton() {
  return (
    <Card className="gap-4 p-6" aria-hidden>
      <Skeleton className="h-4 w-12" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </Card>
  );
}
