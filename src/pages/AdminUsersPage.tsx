import {
  Eye,
  Menu,
  Search,
  ShieldCheck,
  UserCheck2,
  Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import MobileSidebarDrawer from '@/components/layout/MobileSidebarDrawer';
import {
  type UserListItem,
  useActivateUserMutation,
  useGetUserMembershipsQuery,
  useGetUsersQuery,
} from '@/features/UsersApi';

type RoleFilter = 'ALL' | 'ADMIN' | 'CREATOR' | 'MEMBER';
type StatusFilter = 'ALL' | 'active' | 'pending' | 'rejected';

type EnrichedUser = UserListItem & {
  roleNames: string[];
};

const PAGE_SIZE = 10;

const toRoleNames = (user: UserListItem) =>
  Array.from(
    new Set(
      (user.userRoles ?? [])
        .map((entry) => String(entry.role?.name ?? '').toUpperCase().trim())
        .filter(Boolean),
    ),
  );

const toStatus = (status: string | undefined) =>
  String(status ?? '').toLowerCase() as 'active' | 'pending' | 'rejected' | '';

export default function AdminUsersPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<EnrichedUser | null>(null);

  const {
    data: users = [],
    isLoading,
    isError,
    refetch,
  } = useGetUsersQuery({
    page: 1,
    limit: 1000,
    order: 'DESC',
  });
  const [activateUser, { isLoading: isUpdatingStatus }] = useActivateUserMutation();

  const {
    data: selectedUserMemberships = [],
    isLoading: isLoadingMemberships,
  } = useGetUserMembershipsQuery(selectedUser?.id ?? '', {
    skip: !selectedUser?.id,
  });

  const enrichedUsers = useMemo<EnrichedUser[]>(
    () => users.map((user) => ({ ...user, roleNames: toRoleNames(user) })),
    [users],
  );

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return enrichedUsers.filter((user) => {
      const status = toStatus(user.globalStatus);

      const matchesSearch =
        !query ||
        String(user.name ?? '')
          .toLowerCase()
          .includes(query) ||
        String(user.email ?? '')
          .toLowerCase()
          .includes(query) ||
        user.roleNames.some((role) => role.toLowerCase().includes(query));

      const matchesRole =
        roleFilter === 'ALL' || user.roleNames.includes(roleFilter);
      const matchesStatus = statusFilter === 'ALL' || status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [enrichedUsers, roleFilter, searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const pagedUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredUsers]);

  const stats = useMemo(() => {
    const active = enrichedUsers.filter((user) => toStatus(user.globalStatus) === 'active').length;
    const pending = enrichedUsers.filter((user) => toStatus(user.globalStatus) === 'pending').length;
    const leaders = enrichedUsers.filter((user) => user.roleNames.includes('CREATOR')).length;
    return {
      total: enrichedUsers.length,
      active,
      pending,
      leaders,
    };
  }, [enrichedUsers]);

  const getStatusBadge = (status: string | undefined) => {
    const normalized = toStatus(status);
    if (normalized === 'active') {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (normalized === 'pending') {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  const handleToggleUserStatus = async (user: EnrichedUser) => {
    const isCurrentlyActive = toStatus(user.globalStatus) === 'active';
    try {
      await activateUser({
        userId: user.id,
        isActive: !isCurrentlyActive,
      }).unwrap();
      await refetch();
    } catch {
      // keep UI simple; global fetch banner still reflects failures
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-100">
      <div className="flex min-h-screen">
        <AdminSidebar active="users" />
        <MobileSidebarDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title="Admin Menu"
        >
          <AdminSidebar active="users" variant="mobile" />
        </MobileSidebarDrawer>

        <main className="flex-1 px-5 py-6 lg:ml-64 lg:px-8">
          <div className="flex items-center justify-between gap-4 lg:hidden">
            <button
              onClick={() => setDrawerOpen(true)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-600"
            >
              <Menu className="h-5 w-5" />
            </button>
            <p className="text-sm font-semibold text-slate-700">User Management</p>
          </div>

          <div className="mt-6">
            <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">
              User Management
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Interactive user controls backed by database records.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: 'Total Users',
                value: stats.total,
                icon: <Users className="h-4 w-4" />,
                tone: 'from-sky-600 to-cyan-500',
              },
              {
                label: 'Active',
                value: stats.active,
                icon: <UserCheck2 className="h-4 w-4" />,
                tone: 'from-emerald-600 to-green-500',
              },
              {
                label: 'Pending',
                value: stats.pending,
                icon: <ShieldCheck className="h-4 w-4" />,
                tone: 'from-amber-600 to-orange-500',
              },
              {
                label: 'Leaders',
                value: stats.leaders,
                icon: <ShieldCheck className="h-4 w-4" />,
                tone: 'from-indigo-600 to-blue-500',
              },
            ].map((card) => (
              <div
                key={card.label}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    {card.label}
                  </p>
                  <div
                    className={`rounded-lg bg-gradient-to-br ${card.tone} p-2 text-white`}
                  >
                    {card.icon}
                  </div>
                </div>
                <p className="mt-4 text-3xl font-semibold text-slate-900">{card.value}</p>
              </div>
            ))}
          </div>

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.5fr_1fr_1fr_auto]">
              <div className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full outline-none"
                  placeholder="Search by name, email, or role..."
                />
              </div>
              <select
                value={roleFilter}
                onChange={(event) => {
                  setRoleFilter(event.target.value as RoleFilter);
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="ALL">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="CREATOR">Creator</option>
                <option value="MEMBER">Member</option>
              </select>
              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value as StatusFilter);
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="ALL">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
              <button
                type="button"
                onClick={() => void refetch()}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Refresh
              </button>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.14em] text-slate-500">
                    <th className="px-2 py-3">Name</th>
                    <th className="px-2 py-3">Email</th>
                    <th className="px-2 py-3">Roles</th>
                    <th className="px-2 py-3">Status</th>
                    <th className="px-2 py-3">Created</th>
                    <th className="px-2 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedUsers.map((user) => {
                    const status = toStatus(user.globalStatus);
                    const isActive = status === 'active';
                    return (
                      <tr key={user.id} className="border-b border-slate-100 text-slate-700">
                        <td className="px-2 py-3 font-medium text-slate-900">
                          {user.name || 'Unnamed User'}
                        </td>
                        <td className="px-2 py-3">{user.email}</td>
                        <td className="px-2 py-3">
                          <div className="flex flex-wrap gap-1">
                            {(user.roleNames.length ? user.roleNames : ['-']).map((role) => (
                              <span
                                key={`${user.id}-${role}`}
                                className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700"
                              >
                                {role}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-2 py-3">
                          <span
                            className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getStatusBadge(
                              user.globalStatus,
                            )}`}
                          >
                            {status || 'unknown'}
                          </span>
                        </td>
                        <td className="px-2 py-3">
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : '-'}
                        </td>
                        <td className="px-2 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedUser(user)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Details
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleToggleUserStatus(user)}
                              disabled={isUpdatingStatus}
                              className={`rounded-lg px-2 py-1 text-xs font-semibold text-white disabled:opacity-60 ${
                                isActive
                                  ? 'bg-rose-600 hover:bg-rose-700'
                                  : 'bg-emerald-600 hover:bg-emerald-700'
                              }`}
                            >
                              {isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {!isLoading && pagedUsers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-2 py-8 text-center text-slate-500">
                        No users match your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {isLoading && (
              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
                Loading users...
              </div>
            )}
            {isError && !isLoading && (
              <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                Failed to load users from backend.
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-slate-500">
                Showing {(currentPage - 1) * PAGE_SIZE + (pagedUsers.length ? 1 : 0)}-
                {(currentPage - 1) * PAGE_SIZE + pagedUsers.length} of{' '}
                {filteredUsers.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-700 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-xs text-slate-600">
                  Page {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-lg font-semibold text-slate-900">
                  {selectedUser.name || 'Unnamed User'}
                </p>
                <p className="text-sm text-slate-500">{selectedUser.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 px-5 py-4 md:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Status</p>
                <p className="mt-2 font-semibold text-slate-900">
                  {toStatus(selectedUser.globalStatus) || 'unknown'}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Roles</p>
                <p className="mt-2 font-semibold text-slate-900">
                  {selectedUser.roleNames.join(', ') || '-'}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Joined</p>
                <p className="mt-2 font-semibold text-slate-900">
                  {selectedUser.createdAt
                    ? new Date(selectedUser.createdAt).toLocaleString()
                    : '-'}
                </p>
              </div>
            </div>

            <div className="border-t border-slate-200 px-5 py-4">
              <p className="text-sm font-semibold text-slate-900">Memberships</p>
              <div className="mt-3 space-y-2">
                {isLoadingMemberships && (
                  <p className="text-sm text-slate-500">Loading memberships...</p>
                )}
                {!isLoadingMemberships && selectedUserMemberships.length === 0 && (
                  <p className="text-sm text-slate-500">No memberships found.</p>
                )}
                {!isLoadingMemberships &&
                  selectedUserMemberships.map((membership) => (
                    <div
                      key={membership.membershipId}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-slate-800">
                          Club: {membership.clubId ?? '-'}
                        </span>
                        <span className="text-xs uppercase text-slate-600">
                          {membership.role}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        Status: {membership.status} | Joined:{' '}
                        {membership.joinedAt
                          ? new Date(membership.joinedAt).toLocaleDateString()
                          : '-'}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
