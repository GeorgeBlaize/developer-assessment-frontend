import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PaymentLoading() {
  return (
    <Card className="items-center gap-6 px-6 py-10" aria-busy aria-label="Confirming payment">
      <Skeleton className="size-16 rounded-full" />
      <Skeleton className="h-7 w-56" />
      <Skeleton className="h-4 w-72" />
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-10 w-48" />
    </Card>
  );
}
