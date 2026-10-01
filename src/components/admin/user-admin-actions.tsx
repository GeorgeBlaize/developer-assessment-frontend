"use client";

import { useRouter } from "next/navigation";
import { Ban, CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useDeleteUser, useSetUserStatus } from "@/hooks/queries/use-admin";

export function UserAdminActions({ id, name, isActive }: { id: string; name: string; isActive: boolean }) {
  const router = useRouter();
  const setStatus = useSetUserStatus();
  const deleteUser = useDeleteUser();

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={isActive ? "outline" : "default"}
        disabled={setStatus.isPending}
        onClick={() => setStatus.mutate({ id, isActive: !isActive }, { onSuccess: () => router.refresh() })}
      >
        {setStatus.isPending ? <Loader2 className="animate-spin" /> : isActive ? <Ban /> : <CheckCircle2 />}
        {isActive ? "Deactivate" : "Activate"}
      </Button>
      <ConfirmDialog
        trigger={
          <Button variant="destructive">
            <Trash2 /> Remove
          </Button>
        }
        title={`Remove ${name}?`}
        description="They will be signed out and can no longer log in. Historical data is kept for reporting."
        confirmLabel="Remove user"
        destructive
        pending={deleteUser.isPending}
        onConfirm={() => deleteUser.mutate(id, { onSuccess: () => router.replace("/admin/users") })}
      />
    </div>
  );
}
