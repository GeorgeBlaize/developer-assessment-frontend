"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { GOOGLE_CLIENT_ID } from "@/lib/config";

const GoogleSignIn = dynamic(() => import("./google-sign-in"), {
  ssr: false,
  loading: () => <Skeleton className="h-10 w-full" />,
});

export function LazyGoogleSignIn(props: React.ComponentProps<typeof GoogleSignIn>) {
  if (!GOOGLE_CLIENT_ID) return null;
  return <GoogleSignIn {...props} />;
}

export const googleEnabled = Boolean(GOOGLE_CLIENT_ID);
