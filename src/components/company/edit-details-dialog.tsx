"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useUpdateAssessment } from "@/hooks/queries/use-company";
import { toDateTimeLocal } from "@/lib/format";
import type { Assessment } from "@/types/api";
import { AssessmentDetailsForm } from "./assessment-details-form";

export function EditDetailsDialog({ assessment }: { assessment: Assessment }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const update = useUpdateAssessment(assessment.id);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil /> Edit details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit assessment details</DialogTitle>
          <DialogDescription>Only drafts can be edited.</DialogDescription>
        </DialogHeader>
        {open ? (
          <AssessmentDetailsForm
            id="edit-details"
            defaultValues={{
              title: assessment.title,
              description: assessment.description,
              durationMinutes: assessment.durationMinutes,
              passingScore: assessment.passingScore,
              startWindow: toDateTimeLocal(assessment.startWindow),
              endWindow: toDateTimeLocal(assessment.endWindow),
            }}
            onSubmit={(values) =>
              update.mutate(values, {
                onSuccess: () => {
                  setOpen(false);
                  router.refresh();
                },
              })
            }
            footer={
              <div className="flex justify-end gap-2 border-t pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={update.isPending}>
                  {update.isPending ? <Loader2 className="animate-spin" /> : null}
                  Save details
                </Button>
              </div>
            }
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
