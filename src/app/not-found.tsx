import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main id="main" className="relative grid min-h-dvh place-items-center overflow-hidden px-4">
      <div aria-hidden className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
      <div className="relative flex max-w-md flex-col items-center gap-6 text-center">
        <Logo />
        <p className="font-mono text-7xl font-bold tracking-tighter text-primary/80">404</p>
        <SearchX className="size-8 text-muted-foreground" aria-hidden />
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">We couldn&apos;t find that page</h1>
          <p className="text-muted-foreground">
            The link may be broken, or the assessment, user or result may have been removed.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Button asChild size="lg">
            <Link href="/">
              <ArrowLeft /> Back to home
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/login">Go to dashboard</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
