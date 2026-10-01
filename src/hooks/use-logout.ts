"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { callAppRoute } from "@/lib/api/client";
import { useAuthStore } from "@/stores/auth-store";

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearUser = useAuthStore((s) => s.clear);

  return useMutation({
    mutationFn: () => callAppRoute<null>("/api/auth/logout"),
    onSettled: () => {
      clearUser();
      // Drop every cached query so the next user never sees the previous user's data.
      queryClient.clear();
      toast.success("Signed out. See you soon!");
      router.replace("/login");
      router.refresh();
    },
  });
}
