"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, fieldA11y } from "@/components/shared/form-field";
import { useSignIn } from "@/hooks/use-sign-in";
import { getErrorMessage } from "@/lib/api/errors";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

export function LoginForm({ next }: { next?: string | null }) {
  const [showPassword, setShowPassword] = useState(false);
  const signIn = useSignIn<LoginInput>("/api/auth/login", { next });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema), mode: "onTouched" });

  return (
    <form onSubmit={handleSubmit((values) => signIn.mutate(values))} noValidate className="space-y-4">
      {signIn.isError ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{getErrorMessage(signIn.error)}</AlertDescription>
        </Alert>
      ) : null}

      <FormField label="Email" htmlFor="login-email" error={errors.email?.message}>
        <Input
          {...fieldA11y("login-email", errors.email?.message)}
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          className="h-10"
          {...register("email")}
        />
      </FormField>

      <FormField label="Password" htmlFor="login-password" error={errors.password?.message}>
        <div className="relative">
          <Input
            {...fieldA11y("login-password", errors.password?.message)}
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            className="h-10 pr-10"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:text-foreground"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </FormField>

      <Button type="submit" size="lg" className="h-10 w-full" disabled={signIn.isPending}>
        {signIn.isPending ? <Loader2 className="animate-spin" /> : <LogIn />}
        {signIn.isPending ? "Signing in…" : "Log in"}
      </Button>
    </form>
  );
}
