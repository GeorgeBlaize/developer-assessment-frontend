"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, FilterX, Trash2, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable, TableSkeleton, type Column } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { FilterSelect } from "@/components/shared/filter-select";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { SearchInput } from "@/components/shared/search-input";
import { StatusBadge } from "@/components/shared/status-badge";
import { useAdminUsers, useDeleteUser, useSetUserStatus } from "@/hooks/queries/use-admin";
import { useUrlState } from "@/hooks/use-url-state";
import { ROLE_LABEL } from "@/lib/auth/constants";
import { formatDate, formatRelative, initials } from "@/lib/format";
import { USER_SORTS, userListParams } from "@/lib/list-params";
import type { UserListItem } from "@/types/api";

const ROLE_OPTIONS = [
  { value: "COMPANY", label: "Companies" },
  { value: "CANDIDATE", label: "Candidates" },
  { value: "ADMIN", label: "Admins" },
];

export function UsersManager() {
  const searchParams = useSearchParams();
  const params = userListParams(searchParams);
  const { setParams } = useUrlState();
  const { data, isPending, isError, error, refetch, isPlaceholderData, isFetching } = useAdminUsers(params);
  const setStatus = useSetUserStatus();
  const deleteUser = useDeleteUser();
  const hasFilters = Boolean(params.search || params.role || searchParams.get("sort"));

  const columns: Column<UserListItem>[] = [
    {
      key: "user",
      header: "User",
      cell: (u) => (
        <div className="flex items-center gap-3">
          <Avatar className="size-9">
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">{initials(u.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <Link href={`/admin/users/${u.id}`} className="block truncate font-medium hover:underline">
              {u.name}
            </Link>
            <p className="truncate text-xs text-muted-foreground">{u.email}</p>
          </div>
        </div>
      ),
    },
    { key: "role", header: "Role", cell: (u) => <StatusBadge status={u.role} label={ROLE_LABEL[u.role]} /> },
    { key: "joined", header: "Joined", hideOnMobile: true, cell: (u) => <span className="text-sm">{formatDate(u.createdAt)}</span> },
    {
      key: "lastLogin",
      header: "Last active",
      hideOnMobile: true,
      cell: (u) => <span className="text-sm text-muted-foreground">{formatRelative(u.lastLoginAt, "Never")}</span>,
    },
    {
      key: "status",
      header: "Active",
      cell: (u) =>
        u.role === "ADMIN" ? (
          <span className="text-xs text-muted-foreground">Protected</span>
        ) : (
          <div className="flex items-center gap-2">
            <Switch
              checked={u.isActive}
              onCheckedChange={(checked) => setStatus.mutate({ id: u.id, isActive: checked })}
              aria-label={`${u.isActive ? "Deactivate" : "Activate"} ${u.name}`}
            />
            <span className="hidden text-xs text-muted-foreground sm:inline">{u.isActive ? "Active" : "Inactive"}</span>
          </div>
        ),
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      className: "text-right",
      cell: (u) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" asChild aria-label={`View ${u.name}`}>
            <Link href={`/admin/users/${u.id}`}>
              <Eye />
            </Link>
          </Button>
          {u.role !== "ADMIN" ? (
            <ConfirmDialog
              trigger={
                <Button variant="ghost" size="icon" aria-label={`Delete ${u.name}`} className="text-destructive hover:text-destructive">
                  <Trash2 />
                </Button>
              }
              title={`Remove ${u.name}?`}
              description="The account is deactivated and hidden from the platform. Their past attempts and assessments stay intact for reporting."
              confirmLabel="Remove user"
              destructive
              pending={deleteUser.isPending}
              onConfirm={() => deleteUser.mutate(u.id)}
            />
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <SearchInput placeholder="Search name or email…" />
        <FilterSelect paramKey="role" label="Role" allLabel="All roles" options={ROLE_OPTIONS} />
        <FilterSelect paramKey="sort" label="Sort" options={USER_SORTS} defaultValue="createdAt.desc" />
        {hasFilters ? (
          <Button variant="ghost" onClick={() => setParams({ search: null, role: null, sort: null })}>
            <FilterX /> Clear
          </Button>
        ) : null}
      </div>

      {isPending ? (
        <TableSkeleton rows={8} />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : (
        <>
          <DataTable
            caption="Platform users"
            columns={columns}
            rows={data.data}
            getRowKey={(u) => u.id}
            isFetching={isPlaceholderData && isFetching}
            empty={
              <EmptyState
                icon={Users}
                title="No users match these filters"
                description="Try a different search term or clear the role filter."
                action={
                  hasFilters ? (
                    <Button variant="outline" onClick={() => setParams({ search: null, role: null, sort: null })}>
                      Clear filters
                    </Button>
                  ) : undefined
                }
              />
            }
          />
          {data.meta ? <PaginationBar meta={data.meta} noun="users" /> : null}
        </>
      )}
    </div>
  );
}
