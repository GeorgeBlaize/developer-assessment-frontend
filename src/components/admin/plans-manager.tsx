"use client";

import { useQuery } from "@tanstack/react-query";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PlanCard } from "@/components/shared/plan-card";
import { ErrorState } from "@/components/shared/error-state";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import type { Plan, PlanName } from "@/types/api";
import { PlanFormDialog } from "./plan-form-dialog";

const ALL_TIERS: PlanName[] = ["FREE", "BASIC", "PRO"];

export function PlansManager({ initialPlans }: { initialPlans: Plan[] }) {
  const { data: plans, isError, error, refetch } = useQuery({
    queryKey: queryKeys.plans,
    queryFn: () => api.get<Plan[]>("plans").then((r) => r.data),
    initialData: initialPlans,
  });

  if (isError) return <ErrorState error={error} onRetry={() => refetch()} />;

  const availableNames = ALL_TIERS.filter((tier) => !plans.some((p) => p.name === tier));

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        {availableNames.length ? (
          <PlanFormDialog
            availableNames={availableNames}
            trigger={
              <Button>
                <Plus /> New plan
              </Button>
            }
          />
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <span tabIndex={0}>
                <Button disabled>
                  <Plus /> New plan
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>All three tiers (Free, Basic, Pro) already exist. Edit one instead.</TooltipContent>
          </Tooltip>
        )}
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            action={
              <PlanFormDialog
                plan={plan}
                availableNames={availableNames}
                trigger={
                  <Button variant="outline" className="w-full">
                    <Pencil /> Edit plan
                  </Button>
                }
              />
            }
          />
        ))}
      </div>
    </div>
  );
}
