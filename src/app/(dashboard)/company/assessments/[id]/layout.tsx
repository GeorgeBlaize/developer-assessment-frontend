import type { Metadata } from "next";
import { AssessmentHeader } from "@/components/company/assessment-header";
import { orNotFound } from "@/lib/api/not-found";
import { getCompanyAssessment } from "./data";

type Props = { params: Promise<{ id: string }>; children: React.ReactNode };

export async function generateMetadata({ params }: Omit<Props, "children">): Promise<Metadata> {
  const { id } = await params;
  try {
    const { data } = await getCompanyAssessment(id);
    return { title: data.title };
  } catch {
    return { title: "Assessment" };
  }
}

/**
 * Nested layout shared by Overview / Candidates / Results / Grading. The header and tab bar
 * persist while switching tabs; only the tab content below re-renders (with its own loading.tsx).
 */
export default async function AssessmentLayout({ params, children }: Props) {
  const { id } = await params;
  const { data: assessment } = await orNotFound(getCompanyAssessment(id));

  return (
    <div className="space-y-6">
      <AssessmentHeader initial={assessment} />
      {children}
    </div>
  );
}
