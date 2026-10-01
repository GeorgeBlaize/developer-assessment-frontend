import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create account",
  description: "Join CodeAssess as a hiring company or as a candidate.",
};

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ role?: string; plan?: string }> }) {
  const { role, plan } = await searchParams;
  const defaultRole = role === "CANDIDATE" ? "CANDIDATE" : "COMPANY";

  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Create your account</h1>
        <p className="text-muted-foreground">Free to start. Companies begin on the Free plan.</p>
      </div>
      <Card className="p-6">
        <RegisterForm defaultRole={defaultRole} plan={plan} />
      </Card>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
