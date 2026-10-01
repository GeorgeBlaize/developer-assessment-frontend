"use client";

import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { FormField, fieldA11y } from "@/components/shared/form-field";
import { revalidatePlans } from "@/app/actions/revalidate";
import { useSavePlan } from "@/hooks/queries/use-admin";
import { planSchema } from "@/lib/validations/plan";
import type { Plan, PlanName } from "@/types/api";

// The form edits features as one-per-line text, then converts to the API's string[].
const formSchema = planSchema.omit({ features: true }).extend({
  featuresText: z
    .string()
    .refine((t) => t.split("\n").filter((l) => l.trim()).length <= 12, "Keep it to 12 features or fewer"),
});
type FormValues = z.infer<typeof formSchema>;

interface PlanFormDialogProps {
  plan?: Plan;
  availableNames: PlanName[];
  trigger: ReactNode;
}

export function PlanFormDialog({ plan, availableNames, trigger }: PlanFormDialogProps) {
  const [open, setOpen] = useState(false);
  const save = useSavePlan();
  const isEdit = Boolean(plan);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
    values: {
      name: plan?.name ?? availableNames[0] ?? "BASIC",
      price: plan ? Number(plan.price) : 0,
      durationDays: plan?.durationDays ?? 30,
      maxActiveAssessments: plan?.maxActiveAssessments ?? 5,
      maxInvitesPerAssessment: plan?.maxInvitesPerAssessment ?? 50,
      featuresText: plan?.features.join("\n") ?? "",
      isActive: plan?.isActive ?? true,
    },
  });

  const onSubmit = ({ featuresText, ...values }: FormValues) => {
    const features = featuresText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    save.mutate(
      { id: plan?.id, values: { ...values, features } },
      {
        onSuccess: async () => {
          await revalidatePlans();
          setOpen(false);
          reset();
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? `Edit ${plan?.name} plan` : "Create plan"}</DialogTitle>
          <DialogDescription>
            Limits are enforced by the API when companies publish assessments and send invitations.
          </DialogDescription>
        </DialogHeader>
        <form id="plan-form" onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 sm:grid-cols-2">
          {!isEdit ? (
            <FormField label="Tier" htmlFor="plan-name" error={errors.name?.message} className="sm:col-span-2" required>
              <Select value={watch("name")} onValueChange={(v) => setValue("name", v as PlanName, { shouldValidate: true })}>
                <SelectTrigger {...fieldA11y("plan-name", errors.name?.message)} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableNames.map((n) => (
                    <SelectItem key={n} value={n}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          ) : null}
          <FormField label="Price (BDT)" htmlFor="plan-price" error={errors.price?.message} required>
            <Input
              {...fieldA11y("plan-price", errors.price?.message)}
              type="number"
              min={0}
              step="1"
              {...register("price", { valueAsNumber: true })}
            />
          </FormField>
          <FormField label="Duration (days)" htmlFor="plan-duration" error={errors.durationDays?.message} required>
            <Input
              {...fieldA11y("plan-duration", errors.durationDays?.message)}
              type="number"
              min={1}
              {...register("durationDays", { valueAsNumber: true })}
            />
          </FormField>
          <FormField label="Active assessments" htmlFor="plan-max-assessments" error={errors.maxActiveAssessments?.message} required>
            <Input
              {...fieldA11y("plan-max-assessments", errors.maxActiveAssessments?.message)}
              type="number"
              min={1}
              {...register("maxActiveAssessments", { valueAsNumber: true })}
            />
          </FormField>
          <FormField label="Invites / assessment" htmlFor="plan-max-invites" error={errors.maxInvitesPerAssessment?.message} required>
            <Input
              {...fieldA11y("plan-max-invites", errors.maxInvitesPerAssessment?.message)}
              type="number"
              min={1}
              {...register("maxInvitesPerAssessment", { valueAsNumber: true })}
            />
          </FormField>
          <FormField
            label="Features"
            htmlFor="plan-features"
            error={errors.featuresText?.message}
            description="One per line. Shown on the pricing page."
            className="sm:col-span-2"
          >
            <Textarea {...fieldA11y("plan-features", errors.featuresText?.message)} rows={4} {...register("featuresText")} />
          </FormField>
          {isEdit ? (
            <label className="flex items-start justify-between gap-4 rounded-lg border p-3 sm:col-span-2">
              <span>
                <span className="block text-sm font-medium">Available for purchase</span>
                <span className="block text-xs text-muted-foreground">
                  Inactive plans are hidden from pricing and can&apos;t be subscribed to.
                </span>
              </span>
              <Switch checked={watch("isActive")} onCheckedChange={(v) => setValue("isActive", v, { shouldDirty: true })} />
            </label>
          ) : null}
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" form="plan-form" disabled={save.isPending || (isEdit && !isDirty)}>
            {save.isPending ? <Loader2 className="animate-spin" /> : null}
            {isEdit ? "Save changes" : "Create plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
