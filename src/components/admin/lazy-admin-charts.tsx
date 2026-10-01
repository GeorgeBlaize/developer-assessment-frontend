"use client";

import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function ChartSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("gap-4 p-6", className)}>
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-3 w-56" />
      <Skeleton className="h-56 w-full" />
    </Card>
  );
}

// Recharts is ~100 kB: split it out so it only loads on the analytics view, after first paint.
export const ActivityChart = dynamic(() => import("./admin-charts").then((m) => m.ActivityChart), {
  ssr: false,
  loading: () => <ChartSkeleton className="lg:col-span-2" />,
});
export const UsersByRoleChart = dynamic(() => import("./admin-charts").then((m) => m.UsersByRoleChart), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});
export const ActionBreakdownChart = dynamic(() => import("./admin-charts").then((m) => m.ActionBreakdownChart), {
  ssr: false,
  loading: () => <ChartSkeleton className="h-full" />,
});
