import type { ApiErrorItem } from "@/types/api";

export class ApiError extends Error {
  readonly status: number;
  readonly errors: ApiErrorItem[];
  readonly code?: string;

  constructor(message: string, status: number, errors: ApiErrorItem[] = [], code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
    this.code = code;
  }
}

/** Human-readable message for toasts. Surfaces the first field error for validation failures. */
export function getErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (error instanceof ApiError) {
    const firstField = error.errors.find((e) => e.message);
    return error.message === "Validation error" && firstField ? firstField.message : error.message;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
