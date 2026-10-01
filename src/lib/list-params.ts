/**
 * Normalises URL search params into the exact query object sent to the API. Used by both the
 * server page (to prefetch) and the client component (to query), so their query keys match and
 * the server-rendered data hydrates the client cache without a second request.
 */
type SearchParamsLike = URLSearchParams | Record<string, string | string[] | undefined>;

function read(params: SearchParamsLike, key: string): string | undefined {
  const value = params instanceof URLSearchParams ? params.get(key) : params[key];
  const single = Array.isArray(value) ? value[0] : value;
  return single && single.trim() ? single.trim() : undefined;
}

function readPage(params: SearchParamsLike) {
  const page = Number(read(params, "page"));
  return Number.isInteger(page) && page > 1 ? page : undefined;
}

function readEnum<T extends string>(params: SearchParamsLike, key: string, allowed: readonly T[]): T | undefined {
  const value = read(params, key);
  return allowed.includes(value as T) ? (value as T) : undefined;
}

/** `?sort=name.asc` -> { sortBy: "name", sortOrder: "asc" } (only whitelisted fields). */
function readSort(params: SearchParamsLike, allowedFields: readonly string[]) {
  const [field, order] = (read(params, "sort") ?? "").split(".");
  if (!allowedFields.includes(field)) return {};
  return { sortBy: field, sortOrder: order === "asc" ? "asc" : "desc" } as const;
}

export const USER_SORTS = [
  { value: "createdAt.desc", label: "Newest first" },
  { value: "createdAt.asc", label: "Oldest first" },
  { value: "name.asc", label: "Name A–Z" },
  { value: "lastLoginAt.desc", label: "Recently active" },
] as const;

export function userListParams(params: SearchParamsLike) {
  return {
    page: readPage(params),
    limit: 10,
    search: read(params, "search"),
    role: readEnum(params, "role", ["ADMIN", "COMPANY", "CANDIDATE"] as const),
    ...readSort(params, ["createdAt", "name", "lastLoginAt"]),
  };
}

export const ASSESSMENT_SORTS = [
  { value: "createdAt.desc", label: "Newest first" },
  { value: "createdAt.asc", label: "Oldest first" },
  { value: "title.asc", label: "Title A–Z" },
  { value: "updatedAt.desc", label: "Recently updated" },
] as const;

export function assessmentListParams(params: SearchParamsLike) {
  return {
    page: readPage(params),
    limit: 9,
    search: read(params, "search"),
    status: readEnum(params, "status", ["DRAFT", "PUBLISHED", "ARCHIVED"] as const),
    ...readSort(params, ["createdAt", "title", "updatedAt"]),
  };
}

export const AUDIT_ENTITY_TYPES = ["User", "Assessment", "Attempt", "Submission", "Payment"] as const;
export const AUDIT_ACTIONS = [
  "LOGIN",
  "LOGIN_GOOGLE",
  "REGISTER",
  "CHANGE_PASSWORD",
  "UPDATE_USER_STATUS",
  "DELETE_USER",
  "CREATE_ASSESSMENT",
  "PUBLISH_ASSESSMENT",
  "INVITE_CANDIDATES",
  "START_ATTEMPT",
  "FINISH_ATTEMPT",
  "GRADE_SUBMISSION",
  "SUBSCRIBE_INITIATE",
  "PAYMENT_SUCCESS",
  "PAYMENT_FAILED",
  "PAYMENT_CANCELLED",
  "PAYMENT_IPN",
] as const;

export function auditLogParams(params: SearchParamsLike) {
  return {
    page: readPage(params),
    limit: 15,
    entityType: readEnum(params, "entityType", AUDIT_ENTITY_TYPES),
    action: readEnum(params, "action", AUDIT_ACTIONS),
    sortBy: "createdAt",
    sortOrder: read(params, "order") === "asc" ? "asc" : "desc",
  };
}

export function paymentListParams(params: SearchParamsLike) {
  return { page: readPage(params), limit: 8 };
}
