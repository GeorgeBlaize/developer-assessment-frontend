import type { Metadata } from "next";
import Link from "next/link";
import { Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { DemoLoginPanel } from "@/components/auth/demo-login-panel";
import { LazyGoogleSignIn } from "@/components/auth/lazy-google-sign-in";
import { GOOGLE_ENABLED } from "@/lib/config";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to CodeAssess, or try the Admin, Company and Candidate workspaces with one-click demo accounts.",
};

const REASONS: Record<string, string> = {
  session: "Your session has expired. Please log in again.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; reason?: string }> }) {
  const { next, reason } = await searchParams;

  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Welcome back 👋</h1>
        <p className="text-muted-foreground">Log in to your account</p>
      </div>

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

      <div className="relative text-center text-xs font-medium text-muted-foreground uppercase">
        <span className="relative z-10 bg-background px-3">or</span>
        <span aria-hidden className="absolute inset-x-0 top-1/2 border-t" />
      </div>

      <DemoLoginPanel />

      <p className="text-center text-sm text-muted-foreground">
        New to CodeAssess?{" "}
        <Link href="/register" className="font-medium text-primary underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
