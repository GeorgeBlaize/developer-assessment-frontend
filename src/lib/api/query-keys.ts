/**
 * Central query-key factory. Hierarchical keys let mutations invalidate exactly what changed
 * (e.g. `queryKeys.assessments.detail(id)` invalidates problems, invitations, analytics...).
 */
export type ListParams = Record<string, string | number | undefined>;

export const queryKeys = {
  me: ["me"] as const,
  plans: ["plans"] as const,

  admin: {
    all: ["admin"] as const,
    stats: () => ["admin", "stats"] as const,
    users: (params: ListParams) => ["admin", "users", params] as const,
    user: (id: string) => ["admin", "user", id] as const,
    auditLogs: (params: ListParams) => ["admin", "audit-logs", params] as const,
  },

  company: {
    dashboard: ["company", "dashboard"] as const,
    payments: (params: ListParams) => ["company", "payments", params] as const,
  },

  assessments: {
    all: ["assessments"] as const,
    list: (params: ListParams) => ["assessments", "list", params] as const,
    detail: (id: string) => ["assessments", "detail", id] as const,
    problems: (id: string) => ["assessments", "detail", id, "problems"] as const,
    invitations: (id: string) => ["assessments", "detail", id, "invitations"] as const,
    attempts: (id: string) => ["assessments", "detail", id, "attempts"] as const,
    submissions: (id: string, status?: string) => ["assessments", "detail", id, "submissions", status ?? "ALL"] as const,
    analytics: (id: string) => ["assessments", "detail", id, "analytics"] as const,
  },

  candidate: {
    invitations: ["candidate", "invitations"] as const,
    attempts: ["candidate", "attempts"] as const,
    attempt: (id: string) => ["candidate", "attempt", id] as const,
  },
};
