"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertOctagon, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Catches render/data errors in any dashboard page while keeping the sidebar & topbar usable. */
export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="mx-auto flex max-w-lg flex-col items-center gap-5 py-16 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertOctagon className="size-7" aria-hidden />
      </span>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">This page hit a snag</h1>
        <p className="text-muted-foreground">
          {error.message || "We couldn't load this page."} Your data is safe. Try again, or head back to your dashboard.
        </p>
        {error.digest ? <p className="font-mono text-xs text-muted-foreground">Ref: {error.digest}</p> : null}
      </div>
      <div className="flex gap-2">
        <Button onClick={reset}>
          <RotateCw /> Try again
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
}
