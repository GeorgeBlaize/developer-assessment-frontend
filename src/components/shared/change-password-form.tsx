"use client";

import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormField, fieldA11y } from "@/components/shared/form-field";
import { useCurrentUser } from "@/hooks/use-current-user";
import { api } from "@/lib/api/client";
import { changePasswordSchema, type ChangePasswordInput } from "@/lib/validations/auth";

export function ChangePasswordForm() {
  const user = useCurrentUser();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onTouched",
    defaultValues: { oldPassword: "", newPassword: "", confirmPassword: "" },
  });

  const change = useMutation({
    mutationFn: ({ oldPassword, newPassword }: ChangePasswordInput) =>
      api.patch<null>("auth/change-password", { oldPassword, newPassword }),
    meta: { successMessage: "Password changed", skipErrorToast: true },
    onSuccess: () => reset(),
    // Map the API's "Old password is incorrect" onto the field itself.
    onError: (error) => setError("oldPassword", { message: error.message }),
  });

  if (user.provider === "GOOGLE") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>Security settings for your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <KeyRound />
            <AlertDescription>You sign in with Google, so there&apos;s no CodeAssess password to change.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <form onSubmit={handleSubmit((v) => change.mutate(v))} noValidate>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
          <CardDescription>Use at least 6 characters. You&apos;ll stay signed in on this device.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-3">
          <FormField label="Current password" htmlFor="pw-old" error={errors.oldPassword?.message} required>
            <Input
              {...fieldA11y("pw-old", errors.oldPassword?.message)}
              type="password"
              autoComplete="current-password"
              {...register("oldPassword")}
            />
          </FormField>
          <FormField label="New password" htmlFor="pw-new" error={errors.newPassword?.message} required>
            <Input
              {...fieldA11y("pw-new", errors.newPassword?.message)}
              type="password"
              autoComplete="new-password"
              {...register("newPassword")}
            />
          </FormField>
          <FormField label="Confirm new password" htmlFor="pw-confirm" error={errors.confirmPassword?.message} required>
            <Input
              {...fieldA11y("pw-confirm", errors.confirmPassword?.message)}
              type="password"
              autoComplete="new-password"
              {...register("confirmPassword")}
            />
          </FormField>
        </CardContent>
        <CardFooter className="mt-6 justify-end border-t pt-4">
          <Button type="submit" variant="outline" disabled={change.isPending}>
            {change.isPending ? <Loader2 className="animate-spin" /> : <KeyRound />}
            Update password
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
