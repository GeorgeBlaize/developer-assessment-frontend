import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { DemoLoginPanel } from "@/components/auth/demo-login-panel";
import { LoginPanel, LoginPanelSkeleton } from "@/components/auth/login-panel";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to CodeAssess, or try the Admin, Company and Candidate workspaces with one-click demo accounts.",
};

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Welcome back 👋</h1>
        <p className="text-muted-foreground">Log in to your account</p>
      </div>

      <Suspense fallback={<LoginPanelSkeleton />}>
        <LoginPanel />
      </Suspense>

      <div className="relative text-center text-xs font-medium text-muted-foreground uppercase">
        <span className="relative z-10 bg-background px-3">or</span>
        <span aria-hidden className="absolute inset-x-0 top-1/2 border-t" />
      </div>

      <Suspense fallback={<div className="h-56" aria-hidden />}>
        <DemoLoginPanel />
      </Suspense>

      <p className="text-center text-sm text-muted-foreground">
        New to CodeAssess?{" "}
        <Link href="/register" className="font-medium text-primary underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
