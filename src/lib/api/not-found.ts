import "server-only";
import { notFound } from "next/navigation";
import { ApiError } from "./errors";

/** Maps API 404s (and 403 "not yours" / malformed ids) to the custom not-found page. */
export async function orNotFound<T>(promise: Promise<T>): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    if (error instanceof ApiError && [400, 403, 404].includes(error.status)) notFound();
    throw error;
  }
}
