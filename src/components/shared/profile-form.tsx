"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormField, fieldA11y } from "@/components/shared/form-field";
import { TagInput } from "@/components/shared/tag-input";
import { useCurrentUser } from "@/hooks/use-current-user";
import { api } from "@/lib/api/client";
import { profileSchema, toProfilePayload, type ProfileInput } from "@/lib/validations/profile";
import { useAuthStore } from "@/stores/auth-store";
import type { Me } from "@/types/api";

export function ProfileForm() {
  const user = useCurrentUser();
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();
  const company = user.companyProfile;
  const candidate = user.candidateProfile;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    mode: "onTouched",
    defaultValues: {
      name: user.name,
      companyName: company?.companyName ?? "",
      website: company?.website ?? "",
      industry: company?.industry ?? "",
      phone: candidate?.phone ?? "",
      resumeUrl: candidate?.resumeUrl ?? "",
      skills: candidate?.skills ?? [],
    },
  });

  const save = useMutation({
    mutationFn: (values: ProfileInput) => api.patch<Me>("users/me", toProfilePayload(values, user.role)),
    meta: { successMessage: "Profile updated" },
    onSuccess: ({ data }, values) => {
      setUser(data); // topbar & menus update instantly via the global store
      reset(values);
      router.refresh();
    },
  });

  return (
    <Card>
      <form onSubmit={handleSubmit((v) => save.mutate(v))} noValidate>
        <CardHeader>
          <CardTitle>{user.role === "COMPANY" ? "Company profile" : "Personal details"}</CardTitle>
          <CardDescription>
            {user.role === "COMPANY"
              ? "Shown to candidates you invite."
              : user.role === "CANDIDATE"
                ? "Companies see this when reviewing your results."
                : "Your administrator display name."}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <FormField label="Full name" htmlFor="profile-name" error={errors.name?.message} required>
            <Input {...fieldA11y("profile-name", errors.name?.message)} autoComplete="name" {...register("name")} />
          </FormField>
          <FormField label="Email" htmlFor="profile-email" description="Contact support to change your email.">
            <Input id="profile-email" value={user.email} disabled readOnly />
          </FormField>

          {user.role === "COMPANY" ? (
            <>
              <FormField label="Company name" htmlFor="profile-company" error={errors.companyName?.message}>
                <Input {...fieldA11y("profile-company", errors.companyName?.message)} {...register("companyName")} />
              </FormField>
              <FormField label="Industry" htmlFor="profile-industry" error={errors.industry?.message}>
                <Input
                  {...fieldA11y("profile-industry", errors.industry?.message)}
                  placeholder="e.g. Fintech"
                  {...register("industry")}
                />
              </FormField>
              <FormField label="Website" htmlFor="profile-website" error={errors.website?.message} className="sm:col-span-2">
                <Input
                  {...fieldA11y("profile-website", errors.website?.message)}
                  type="url"
                  placeholder="https://example.com"
                  {...register("website")}
                />
              </FormField>
            </>
          ) : null}

          {user.role === "CANDIDATE" ? (
            <>
              <FormField label="Phone" htmlFor="profile-phone" error={errors.phone?.message}>
                <Input {...fieldA11y("profile-phone", errors.phone?.message)} type="tel" autoComplete="tel" {...register("phone")} />
              </FormField>
              <FormField label="Résumé URL" htmlFor="profile-resume" error={errors.resumeUrl?.message}>
                <Input
                  {...fieldA11y("profile-resume", errors.resumeUrl?.message)}
                  type="url"
                  placeholder="https://drive.google.com/…"
                  {...register("resumeUrl")}
                />
              </FormField>
              <FormField
                label="Skills"
                htmlFor="profile-skills"
                error={errors.skills?.message ?? errors.skills?.root?.message}
                description="Press Enter after each skill."
                className="sm:col-span-2"
              >
                <Controller
                  control={control}
                  name="skills"
                  render={({ field }) => (
                    <TagInput
                      id="profile-skills"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="e.g. TypeScript"
                      invalid={Boolean(errors.skills)}
                      describedBy="profile-skills-description"
                    />
                  )}
                />
              </FormField>
            </>
          ) : null}
        </CardContent>
        <CardFooter className="mt-6 justify-end border-t pt-4">
          <Button type="submit" disabled={!isDirty || save.isPending}>
            {save.isPending ? <Loader2 className="animate-spin" /> : <Save />}
            Save changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
