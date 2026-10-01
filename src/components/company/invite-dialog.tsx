"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, MailPlus, UserX } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField, fieldA11y } from "@/components/shared/form-field";
import { useInviteCandidates } from "@/hooks/queries/use-company";
import { inviteSchema, parseEmails, type InviteInput } from "@/lib/validations/assessment";
import type { InviteResult } from "@/types/api";

interface InviteDialogProps {
  assessmentId: string;
  /** Remaining invitations on the current plan (null = unknown/unlimited). */
  remaining: number | null;
  disabled?: boolean;
}

export function InviteDialog({ assessmentId, remaining, disabled }: InviteDialogProps) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<InviteResult | null>(null);
  const invite = useInviteCandidates(assessmentId);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<InviteInput>({
    resolver: zodResolver(inviteSchema),
    mode: "onTouched",
    defaultValues: { emailsText: "", expiresInDays: 7 },
  });
  const count = parseEmails(watch("emailsText") ?? "").length;
  const overLimit = remaining !== null && count > remaining;

  const onSubmit = ({ emailsText, expiresInDays }: InviteInput) => {
    const emails = parseEmails(emailsText);
    if (remaining !== null && emails.length > remaining) {
      setError("emailsText", { message: `Your plan allows ${remaining} more invitation${remaining === 1 ? "" : "s"} here.` });
      return;
    }
    invite.mutate(
      { emails, expiresInDays },
      {
        onSuccess: ({ data }) => {
          setResult(data);
          reset();
          if (data.invited.length) toast.success(`${data.invited.length} candidate${data.invited.length === 1 ? "" : "s"} invited`);
        },
      },
    );
  };

  const close = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setResult(null);
      reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogTrigger asChild>
        <Button disabled={disabled}>
          <MailPlus /> Invite candidates
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Invite candidates</DialogTitle>
          <DialogDescription>
            Candidates must already have a CodeAssess account. They&apos;ll see the invitation in their dashboard.
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="space-y-3">
            {result.invited.length ? (
              <Alert>
                <CheckCircle2 className="text-success" />
                <AlertTitle>{result.invited.length} invited</AlertTitle>
                <AlertDescription>{result.invited.map((i) => i.email).join(", ")}</AlertDescription>
              </Alert>
            ) : null}
            {result.notFound.length ? (
              <Alert variant="destructive">
                <UserX />
                <AlertTitle>No candidate account for {result.notFound.length} email{result.notFound.length === 1 ? "" : "s"}</AlertTitle>
                <AlertDescription>
                  {result.notFound.join(", ")}. Ask them to register as a candidate, then invite again.
                </AlertDescription>
              </Alert>
            ) : null}
            <DialogFooter>
              <Button variant="outline" onClick={() => setResult(null)}>
                Invite more
              </Button>
              <Button onClick={() => close(false)}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <FormField
              label="Candidate emails"
              htmlFor="invite-emails"
              error={errors.emailsText?.message}
              description={
                <>
                  Separate with commas, spaces or new lines.{" "}
                  <span className={overLimit ? "font-medium text-destructive" : undefined}>
                    {count} entered{remaining !== null ? ` · ${remaining} remaining on your plan` : ""}
                  </span>
                </>
              }
              required
            >
              <Textarea
                {...fieldA11y("invite-emails", errors.emailsText?.message)}
                rows={5}
                placeholder={"candidate@demo.dev\njane@example.com"}
                className="font-mono text-sm"
                {...register("emailsText")}
              />
            </FormField>
            <FormField label="Invitation expires after (days)" htmlFor="invite-expiry" error={errors.expiresInDays?.message} required>
              <Input
                {...fieldA11y("invite-expiry", errors.expiresInDays?.message)}
                type="number"
                min={1}
                max={90}
                className="w-32"
                {...register("expiresInDays", { valueAsNumber: true })}
              />
            </FormField>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => close(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={invite.isPending || overLimit}>
                {invite.isPending ? <Loader2 className="animate-spin" /> : <MailPlus />}
                Send {count > 0 ? count : ""} invitation{count === 1 ? "" : "s"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
