"use client";

import type { ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { ProblemInput } from "@/lib/validations/assessment";
import { ProblemForm } from "./problem-form";

interface ProblemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  defaultValues?: ProblemInput;
  onSubmit: (values: ProblemInput) => void;
  pending?: boolean;
  lockType?: boolean;
  trigger?: ReactNode;
}

export function ProblemDialog({ open, onOpenChange, title, defaultValues, onSubmit, pending, lockType, trigger }: ProblemDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Questions are locked once the assessment is published.</DialogDescription>
        </DialogHeader>
        {/* Remount per open so the form always starts from the right values. */}
        {open ? (
          <ProblemForm
            id="problem-dialog-form"
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
            pending={pending}
            lockType={lockType}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
