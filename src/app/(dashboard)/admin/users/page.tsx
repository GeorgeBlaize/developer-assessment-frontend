import type { Metadata } from "next";
import { HydrationBoundary } from "@tanstack/react-query";
import { UsersManager } from "@/components/admin/users-manager";
import { PageHeader } from "@/components/shared/page-header";
import { prefetch } from "@/lib/api/prefetch";
import { queryKeys } from "@/lib/api/query-keys";
import { serverFetch } from "@/lib/api/server";
import { userListParams } from "@/lib/list-params";
import type { UserListItem } from "@/types/api";

export const metadata: Metadata = { title: "Users" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = userListParams(await searchParams);
  const state = await prefetch([
    { queryKey: queryKeys.admin.users(params), queryFn: () => serverFetch<UserListItem[]>("/users", { query: params }) },
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Search, filter and manage every company, candidate and admin account. Deactivated users can't sign in."
      />
      <HydrationBoundary state={state}>
        <UsersManager />
      </HydrationBoundary>
    </div>
  );
}
