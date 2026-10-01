"use client";

import { useEffect, useState } from "react";

/**
 * Seconds remaining until `deadline` (ISO string), ticking every second. Derived from the
 * server's expiresAt, so refreshing the page never resets the clock.
 */
export function useCountdown(deadline: string | null | undefined) {
  const target = deadline ? new Date(deadline).getTime() : null;
  const compute = () => (target ? Math.max(Math.floor((target - Date.now()) / 1000), 0) : 0);
  const [secondsLeft, setSecondsLeft] = useState(compute);

  useEffect(() => {
    if (!target) return;
    setSecondsLeft(Math.max(Math.floor((target - Date.now()) / 1000), 0));
    const id = setInterval(() => {
      const next = Math.max(Math.floor((target - Date.now()) / 1000), 0);
      setSecondsLeft(next);
      if (next === 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [target]);

  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;
  const label = `${hours > 0 ? `${String(hours).padStart(2, "0")}:` : ""}${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return { secondsLeft, label, isExpired: target !== null && secondsLeft === 0 };
}
