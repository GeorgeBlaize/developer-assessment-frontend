import { CalendarClock, CalendarPlus, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditDetailsDialog } from "@/components/company/edit-details-dialog";
import { QuestionsManager } from "@/components/company/questions-manager";
import { formatDateTime } from "@/lib/format";
import { getCompanyAssessment } from "./data";

export default async function AssessmentOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: assessment } = await getCompanyAssessment(id);
  const problems = assessment.problems.filter((p) => !p.deletedAt);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <QuestionsManager assessmentId={assessment.id} status={assessment.status} initialProblems={problems} />

      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle>About</CardTitle>
            {assessment.status === "DRAFT" ? <EditDetailsDialog assessment={assessment} /> : null}
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p className="whitespace-pre-line text-muted-foreground">{assessment.description}</p>
            <dl className="space-y-3 border-t pt-4">
              <div className="flex items-start gap-2.5">
                <CalendarClock className="mt-0.5 size-4 text-muted-foreground" aria-hidden />
                <div>
                  <dt className="text-xs text-muted-foreground">Availability</dt>
                  <dd className="font-medium">
                    {assessment.startWindow || assessment.endWindow
                      ? `${formatDateTime(assessment.startWindow, "Now")} → ${formatDateTime(assessment.endWindow, "No deadline")}`
                      : "Open while published"}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Users className="mt-0.5 size-4 text-muted-foreground" aria-hidden />
                <div>
                  <dt className="text-xs text-muted-foreground">Pipeline</dt>
                  <dd className="font-medium">
                    {assessment._count.invitations} invited · {assessment._count.attempts} attempted
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CalendarPlus className="mt-0.5 size-4 text-muted-foreground" aria-hidden />
                <div>
                  <dt className="text-xs text-muted-foreground">Created</dt>
                  <dd className="font-medium">{formatDateTime(assessment.createdAt)}</dd>
                </div>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
