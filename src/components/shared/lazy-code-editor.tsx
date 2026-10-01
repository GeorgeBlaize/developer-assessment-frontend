"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * CodeMirror and its language packs are only needed for coding questions, so they're split
 * into a separate chunk that loads on demand.
 */
export const LazyCodeEditor = dynamic(() => import("./code-editor"), {
  ssr: false,
  loading: () => <Skeleton className="h-[220px] w-full rounded-lg" />,
});
