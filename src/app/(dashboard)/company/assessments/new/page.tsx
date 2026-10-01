import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { CreateAssessmentWizard } from "@/components/company/wizard/create-assessment-wizard";

export const metadata: Metadata = { title: "New assessment" };

export default function NewAssessmentPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/company/assessments">
          <ArrowLeft /> Assessments
        </Link>
      </Button>
      <PageHeader
        title="Create an assessment"
        description="Three quick steps. Your progress is saved in this browser, so you can leave and come back."
      />
      <CreateAssessmentWizard />
    </div>
  );
}
