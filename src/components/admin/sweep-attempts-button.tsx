"use client";

import { useRouter } from "next/navigation";
import { Loader2, TimerReset } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSweepExpiredAttempts } from "@/hooks/queries/use-admin";

export function SweepAttemptsButton() {
  const router = useRouter();
  const sweep = useSweepExpiredAttempts();
  return (
    <Button variant="outline" disabled={sweep.isPending} onClick={() => sweep.mutate(undefined, { onSuccess: () => router.refresh() })}>
      {sweep.isPending ? <Loader2 className="animate-spin" /> : <TimerReset />}
      Finalise expired attempts
    </Button>
  );
}
