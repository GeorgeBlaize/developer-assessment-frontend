"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Building2, GraduationCap, Loader2, UserPlus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, fieldA11y } from "@/components/shared/form-field";
import { LazyGoogleSignIn, googleEnabled } from "./lazy-google-sign-in";
import { useSignIn } from "@/hooks/use-sign-in";
import { getErrorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";

const ROLE_OPTIONS = [
  { value: "COMPANY", title: "I'm hiring", body: "Create assessments and evaluate candidates", icon: Building2 },
  { value: "CANDIDATE", title: "I'm a candidate", body: "Take assessments you're invited to", icon: GraduationCap },
] as const;

interface RegisterFormProps {
  defaultRole: RegisterInput["role"];
  /** Paid plan chosen on the pricing page — company is sent to billing after sign-up. */
  plan?: string;
}

export function RegisterForm({ defaultRole, plan }: RegisterFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: { role: defaultRole, name: "", email: "", password: "", confirmPassword: "", companyName: "", phone: "" },
  });
  const role = watch("role");
  const redirectTo = role === "COMPANY" && plan && plan !== "FREE" ? `/company/billing?plan=${plan}` : undefined;
  const signUp = useSignIn<RegisterInput>("/api/auth/register", { redirectTo });

  return (
    <form onSubmit={handleSubmit((values) => signUp.mutate(values))} noValidate className="space-y-5">
      {signUp.isError ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{getErrorMessage(signUp.error)}</AlertDescription>
        </Alert>
      ) : null}

      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-medium">How will you use CodeAssess?</legend>
        <div role="radiogroup" className="grid gap-3 sm:grid-cols-2">
          {ROLE_OPTIONS.map(({ value, title, body, icon: Icon }) => {
            const selected = role === value;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setValue("role", value, { shouldValidate: true })}
                className={cn(
                  "flex gap-3 rounded-xl border p-3.5 text-left transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  selected ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:border-primary/40",
                )}
              >
                <Icon className={cn("mt-0.5 size-5 shrink-0", selected ? "text-primary" : "text-muted-foreground")} aria-hidden />
                <span>
                  <span className="block text-sm font-semibold">{title}</span>
                  <span className="block text-xs text-muted-foreground">{body}</span>
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <FormField label="Full name" htmlFor="reg-name" error={errors.name?.message} required>
        <Input {...fieldA11y("reg-name", errors.name?.message)} autoComplete="name" className="h-10" {...register("name")} />
      </FormField>

      {role === "COMPANY" ? (
        <FormField label="Company name" htmlFor="reg-company" error={errors.companyName?.message} required>
          <Input
            {...fieldA11y("reg-company", errors.companyName?.message)}
            autoComplete="organization"
            className="h-10"
            {...register("companyName")}
          />
        </FormField>
      ) : (
        <FormField label="Phone" htmlFor="reg-phone" error={errors.phone?.message} description="Optional">
          <Input
            {...fieldA11y("reg-phone", errors.phone?.message)}
            type="tel"
            autoComplete="tel"
            placeholder="+8801XXXXXXXXX"
            className="h-10"
            {...register("phone")}
          />
        </FormField>
      )}

      <FormField label="Email" htmlFor="reg-email" error={errors.email?.message} required>
        <Input
          {...fieldA11y("reg-email", errors.email?.message)}
          type="email"
          autoComplete="email"
          className="h-10"
          {...register("email")}
        />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Password" htmlFor="reg-password" error={errors.password?.message} required description="At least 6 characters">
          <Input
            {...fieldA11y("reg-password", errors.password?.message)}
            type="password"
            autoComplete="new-password"
            className="h-10"
            {...register("password")}
          />
        </FormField>
        <FormField label="Confirm password" htmlFor="reg-confirm" error={errors.confirmPassword?.message} required>
          <Input
            {...fieldA11y("reg-confirm", errors.confirmPassword?.message)}
            type="password"
            autoComplete="new-password"
            className="h-10"
            {...register("confirmPassword")}
          />
        </FormField>
      </div>

      <Button type="submit" size="lg" className="h-10 w-full" disabled={signUp.isPending}>
        {signUp.isPending ? <Loader2 className="animate-spin" /> : <UserPlus />}
        {signUp.isPending ? "Creating account…" : "Create account"}
      </Button>

      {googleEnabled ? (
        <>
          <div className="relative text-center text-xs text-muted-foreground uppercase">
            <span className="relative z-10 bg-card px-2">or</span>
            <span aria-hidden className="absolute inset-x-0 top-1/2 border-t" />
          </div>
          <LazyGoogleSignIn role={role} text="signup_with" />
        </>
      ) : null}
    </form>
  );
}
