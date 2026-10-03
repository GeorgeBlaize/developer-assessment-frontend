"use client";

import { useEffect, useState } from "react";
import { onlineManager } from "@tanstack/react-query";
import { WifiOff } from "lucide-react";
import { toast } from "sonner";

/**
 * TanStack Query pauses mutations while the browser is offline and replays them on reconnect.
 * This banner explains that state so a spinning button never looks like a hang.
 */
export function OfflineBanner() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(onlineManager.isOnline());
    let wasOffline = !onlineManager.isOnline();
    return onlineManager.subscribe((isOnline) => {
      setOnline(isOnline);
      if (isOnline && wasOffline) toast.success("Back online. Pending changes are being sent.");
      wasOffline = !isOnline;
    });
  }, []);

  if (online) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 bottom-4 z-[60] mx-auto flex w-fit max-w-[calc(100%-2rem)] items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background shadow-lg"
    >
      <WifiOff className="size-4 shrink-0" aria-hidden />
      You&apos;re offline. Changes will be sent when your connection returns.
    </div>
  );
}
