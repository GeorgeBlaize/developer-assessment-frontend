// Types mirror the backend Prisma schema and the shapes returned by each service.
// Dates arrive as ISO strings over JSON; Prisma Decimal fields arrive as strings.

export type Role = "ADMIN" | "COMPANY" | "CANDIDATE";
export type AuthProvider = "LOCAL" | "GOOGLE";
export type ProblemType = "CODING" | "MCQ" | "WRITTEN";
export type AssessmentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type InvitationStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED";
export type AttemptStatus = "NOT_STARTED" | "IN_PROGRESS" | "SUBMITTED" | "EVALUATED" | "EXPIRED";
export type SubmissionStatus = "PENDING" | "AUTO_GRADED" | "MANUALLY_GRADED";
export type PlanName = "FREE" | "BASIC" | "PRO";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "CANCELLED";
export type SubscriptionStatus = "INACTIVE" | "ACTIVE" | "EXPIRED";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiErrorItem {
  path: string;
  message: string;
}

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiFailure {
  success: false;
  message: string;
  errors?: ApiErrorItem[];
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

// ---------------------------------------------------------------------------
// Identity
// ---------------------------------------------------------------------------

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResult {
  user: SessionUser;
  accessToken: string;
  refreshToken: string;
}

export interface Plan {
  id: string;
  name: PlanName;
  price: string;
  currency: string;
  durationDays: number;
  maxActiveAssessments: number;
  maxInvitesPerAssessment: number;
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyProfile {
  id: string;
  userId: string;
  companyName: string;
  website: string | null;
  industry: string | null;
  planId: string | null;
  subscriptionStatus: SubscriptionStatus;
  subscriptionStartAt: string | null;
  subscriptionEndsAt: string | null;
  plan: Plan | null;
}

export interface CandidateProfile {
  id: string;
  userId: string;
  phone: string | null;
  resumeUrl: string | null;
  skills: string[];
}

export interface Me {
  id: string;
  name: string;
  email: string;
  provider: AuthProvider;
  role: Role;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  companyProfile: CompanyProfile | null;
  candidateProfile: CandidateProfile | null;
}

export interface UserListItem {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

// ---------------------------------------------------------------------------
// Assessments & problems
// ---------------------------------------------------------------------------

export interface McqOption {
  id: string;
  problemId?: string;
  text: string;
  isCorrect?: boolean;
  order: number;
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  hidden?: boolean;
}

export interface Problem {
  id: string;
  assessmentId: string;
  type: ProblemType;
  title: string;
  description: string;
  marks: number;
  order: number;
  languageHint: string | null;
  starterCode: string | null;
  testCases: TestCase[] | null;
  correctAnswerText?: string | null;
  deletedAt: string | null;
  options: McqOption[];
}

export interface Assessment {
  id: string;
  companyId: string;
  title: string;
  description: string;
  status: AssessmentStatus;
  durationMinutes: number;
  passingScore: number;
  totalMarks: number;
  startWindow: string | null;
  endWindow: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentListItem extends Assessment {
  _count: { problems: number; invitations: number };
}

export interface AssessmentDetail extends Assessment {
  problems: Problem[];
  company: Omit<CompanyProfile, "plan">;
  _count: { invitations: number; attempts: number };
}

export interface AssessmentAnalytics {
  totalMarks: number;
  passingScore: number;
  invitations: Partial<Record<InvitationStatus, number>>;
  attempts: {
    total: number;
    evaluated: number;
    averageScore: number;
    passCount: number;
    passRate: number;
  };
}

// ---------------------------------------------------------------------------
// Invitations, attempts & submissions
// ---------------------------------------------------------------------------

export interface Attempt {
  id: string;
  invitationId: string;
  candidateId: string;
  assessmentId: string;
  status: AttemptStatus;
  startedAt: string | null;
  submittedAt: string | null;
  expiresAt: string | null;
  totalScore: number | null;
  isPassed: boolean | null;
  createdAt: string;
  updatedAt: string;
}

export interface CandidateRef {
  id: string;
  user: { name: string; email: string };
}

export interface Invitation {
  id: string;
  assessmentId: string;
  candidateId: string;
  email: string;
  status: InvitationStatus;
  invitedAt: string;
  expiresAt: string;
}

export interface CompanyInvitation extends Invitation {
  candidate: CandidateRef;
  attempt: Attempt | null;
}

export interface MyInvitation extends Invitation {
  assessment: Pick<Assessment, "id" | "title" | "durationMinutes" | "totalMarks" | "status">;
  attempt: Attempt | null;
}

export interface InviteResult {
  invited: Invitation[];
  notFound: string[];
}

export interface Submission {
  id: string;
  attemptId: string;
  problemId: string;
  answerText: string | null;
  selectedOptionId: string | null;
  isCorrect: boolean | null;
  awardedMarks: number | null;
  status: SubmissionStatus;
  gradedById: string | null;
  gradedAt: string | null;
  feedback: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CompanySubmission extends Submission {
  problem: Pick<Problem, "id" | "title" | "type" | "marks" | "correctAnswerText">;
  attempt: Attempt & { candidate: CandidateRef };
  selectedOption: McqOption | null;
}

export interface CompanyAttempt extends Attempt {
  candidate: CandidateRef;
  _count: { submissions: number };
}

export interface MyAttempt extends Attempt {
  assessment: Pick<Assessment, "id" | "title" | "totalMarks" | "passingScore">;
}

export interface AttemptDetail extends Attempt {
  assessment: Assessment & { problems: Problem[] };
  submissions: Submission[];
}

// ---------------------------------------------------------------------------
// Billing, dashboards & admin
// ---------------------------------------------------------------------------

export interface Payment {
  id: string;
  companyId: string;
  planId: string;
  amount: string;
  currency: string;
  status: PaymentStatus;
  tranId: string;
  validatedAt: string | null;
  createdAt: string;
  plan: Plan;
}

export type SubscribeResult =
  | { freePlan: true; payment: Omit<Payment, "plan"> }
  | { freePlan: false; gatewayPageURL: string; tranId: string };

export interface CompanyDashboard {
  plan: Plan | null;
  subscriptionStatus: SubscriptionStatus;
  subscriptionEndsAt: string | null;
  totalAssessments: number;
  publishedAssessments: number;
  totalInvitations: number;
  totalAttempts: number;
}

export interface PlatformStats {
  totalUsers: number;
  totalCompanies: number;
  totalCandidates: number;
  totalAssessments: number;
  publishedAssessments: number;
  totalPayments: number;
  totalRevenue: string | number;
}

export interface AuditLog {
  id: string;
  actorId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
  actor: { id: string; name: string; email: string; role: Role } | null;
}
