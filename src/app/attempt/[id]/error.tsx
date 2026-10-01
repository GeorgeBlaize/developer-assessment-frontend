"use client";

import Link from "next/link";
import { AlertOctagon, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Keeps candidates calm: their saved answers are safe and the server clock keeps running. */
export default function AttemptError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main" role="alert" className="grid min-h-dvh place-items-center px-4">
      <div className="flex max-w-md flex-col items-center gap-5 text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertOctagon className="size-7" aria-hidden />
        </span>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">We couldn&apos;t load your assessment</h1>
          <p className="text-muted-foreground">
            {error.message || "A network problem interrupted the page."} Answers you&apos;ve already saved are safe, but the timer keeps
            running, so please try again right away.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={reset}>
            <RotateCw /> Retry now
          </Button>
          <Button asChild variant="outline">
            <Link href="/candidate/invitations">My invitations</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
