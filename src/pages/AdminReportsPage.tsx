import {
  Activity,
  BarChart3,
  CheckCircle2,
  Clock3,
  FolderKanban,
  Menu,
  Users,
  XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import MobileSidebarDrawer from '@/components/layout/MobileSidebarDrawer';
import { useGetActiveClubsQuery } from '@/features/ClubsApi';
import { useGetAdminLeaderApplicationsQuery } from '@/features/LeaderApplicationApi';
import { useGetUsersQuery } from '@/features/UsersApi';

type TrendPoint = {
  key: string;
  label: string;
  users: number;
  clubs: number;
};

type PieSlice = {
  label: string;
  value: number;
  color: string;
};

const toMonthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const sanitizeId = (value: string | undefined | null) =>
  String(value ?? '').replace(/^["']|["']$/g, '').trim();

const buildLastMonths = (months: number): TrendPoint[] => {
  const now = new Date();
  return Array.from({ length: months }, (_, index) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - index), 1);
    return {
      key: toMonthKey(d),
      label: d.toLocaleString(undefined, { month: 'short' }),
      users: 0,
      clubs: 0,
    };
  });
};

function DonutChart({
  title,
  slices,
}: {
  title: string;
  slices: PieSlice[];
}) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  let acc = 0;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative h-36 w-36">
          <svg viewBox="0 0 140 140" className="h-36 w-36">
            <circle cx="70" cy="70" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="18" />
            {total > 0 &&
              slices.map((slice) => {
                const portion = (slice.value / total) * circumference;
                const circle = (
                  <circle
                    key={slice.label}
                    cx="70"
                    cy="70"
                    r={radius}
                    fill="none"
                    stroke={slice.color}
                    strokeWidth="18"
                    strokeLinecap="butt"
                    strokeDasharray={`${portion} ${circumference - portion}`}
                    strokeDashoffset={-acc}
                    transform="rotate(-90 70 70)"
                  />
                );
                acc += portion;
                return circle;
              })}
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Total</p>
            <p className="text-2xl font-semibold text-slate-900">{total}</p>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          {slices.map((slice) => {
            const percent = total ? Math.round((slice.value / total) * 100) : 0;
            return (
              <div
                key={slice.label}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              >
                <span className="inline-flex items-center gap-2 text-slate-700">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: slice.color }}
                  />
                  {slice.label}
                </span>
                <span className="font-semibold text-slate-900">
                  {slice.value} ({percent}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function AdminReportsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const {
    data: clubs = [],
    isLoading: isLoadingClubs,
    isError: isClubsError,
  } = useGetActiveClubsQuery();
  const {
    data: users = [],
    isLoading: isLoadingUsers,
    isError: isUsersError,
  } = useGetUsersQuery({
    page: 1,
    limit: 1000,
    order: 'DESC',
  });
  const {
    data: pendingApplications = [],
    isLoading: isLoadingPending,
    isError: isPendingError,
  } = useGetAdminLeaderApplicationsQuery('PENDING');
  const {
    data: approvedApplications = [],
    isLoading: isLoadingApproved,
    isError: isApprovedError,
  } = useGetAdminLeaderApplicationsQuery('APPROVED');
  const {
    data: rejectedApplications = [],
    isLoading: isLoadingRejected,
    isError: isRejectedError,
  } = useGetAdminLeaderApplicationsQuery('REJECTED');

  const reportData = useMemo(() => {
    const roleCounts = users.reduce(
      (acc, user) => {
        const roles = new Set(
          (user.userRoles ?? []).map((entry) =>
            String(entry.role?.name ?? '').toUpperCase(),
          ),
        );
        if (roles.has('ADMIN')) acc.admin += 1;
        if (roles.has('CREATOR')) acc.creator += 1;
        if (roles.has('MEMBER')) acc.member += 1;
        return acc;
      },
      { admin: 0, creator: 0, member: 0 },
    );

    const userStatusCounts = users.reduce(
      (acc, user) => {
        const status = String(user.globalStatus ?? '').toLowerCase();
        if (status === 'active') acc.active += 1;
        else if (status === 'pending') acc.pending += 1;
        else if (status === 'rejected') acc.rejected += 1;
        return acc;
      },
      { active: 0, pending: 0, rejected: 0 },
    );

    const categoryMap = new Map<string, number>();
    clubs.forEach((club) => {
      const key = club.category?.name?.trim() || 'Uncategorized';
      categoryMap.set(key, (categoryMap.get(key) ?? 0) + 1);
    });
    const clubsByCategory = Array.from(categoryMap.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    const userById = new Map(users.map((user) => [sanitizeId(user.id), user]));
    const clubInsights = clubs
      .map((club) => ({
        id: club.id,
        name: club.name,
        category: club.category?.name ?? 'Uncategorized',
        creatorName:
          userById.get(sanitizeId(club.creatorId))?.name ?? 'Unknown creator',
        createdAt: club.createdAt,
        status: club.isActive ? 'active' : 'inactive',
        membersCount: Number(club.membersCount ?? 0),
        projectsCount: Number(club.projectsCount ?? 0),
      }))
      .sort((a, b) => {
        if (b.membersCount !== a.membersCount) return b.membersCount - a.membersCount;
        return (
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
        );
      });

    const trend = buildLastMonths(6);
    const trendIndex = new Map(trend.map((entry, index) => [entry.key, index]));

    users.forEach((user) => {
      if (!user.createdAt) return;
      const date = new Date(user.createdAt);
      if (Number.isNaN(date.getTime())) return;
      const idx = trendIndex.get(toMonthKey(date));
      if (idx !== undefined) trend[idx].users += 1;
    });

    clubs.forEach((club) => {
      if (!club.createdAt) return;
      const date = new Date(club.createdAt);
      if (Number.isNaN(date.getTime())) return;
      const idx = trendIndex.get(toMonthKey(date));
      if (idx !== undefined) trend[idx].clubs += 1;
    });

    const totalApplications =
      pendingApplications.length + approvedApplications.length + rejectedApplications.length;
    const approvalRate = totalApplications
      ? Math.round((approvedApplications.length / totalApplications) * 100)
      : 0;

    return {
      stats: {
        totalUsers: users.length,
        totalClubs: clubs.length,
        totalApplications,
        approvalRate,
      },
      roleCounts,
      userStatusCounts,
      applicationCounts: {
        pending: pendingApplications.length,
        approved: approvedApplications.length,
        rejected: rejectedApplications.length,
      },
      clubsByCategory: clubsByCategory.slice(0, 8),
      trend,
      clubInsights: clubInsights.slice(0, 10),
    };
  }, [
    approvedApplications.length,
    clubs,
    pendingApplications.length,
    rejectedApplications.length,
    users,
  ]);

  const isLoading =
    isLoadingClubs ||
    isLoadingUsers ||
    isLoadingPending ||
    isLoadingApproved ||
    isLoadingRejected;
  const hasError =
    isClubsError ||
    isUsersError ||
    isPendingError ||
    isApprovedError ||
    isRejectedError;

  const exportReportCsv = () => {
    const summaryRows = [
      ['Metric', 'Value'],
      ['Total Users', String(reportData.stats.totalUsers)],
      ['Active Clubs', String(reportData.stats.totalClubs)],
      ['Leader Applications', String(reportData.stats.totalApplications)],
      ['Approval Rate (%)', String(reportData.stats.approvalRate)],
      ['Pending Applications', String(reportData.applicationCounts.pending)],
      ['Approved Applications', String(reportData.applicationCounts.approved)],
      ['Rejected Applications', String(reportData.applicationCounts.rejected)],
      ['Admins', String(reportData.roleCounts.admin)],
      ['Creators', String(reportData.roleCounts.creator)],
      ['Members', String(reportData.roleCounts.member)],
    ];

    const clubsHeader = [
      'Club Name',
      'Category',
      'Creator',
      'Created',
      'Status',
      'Members',
      'Projects',
    ];
    const clubsRows = reportData.clubInsights.map((club) => [
      club.name,
      club.category,
      club.creatorName,
      club.createdAt ? new Date(club.createdAt).toISOString() : '',
      club.status,
      String(club.membersCount),
      String(club.projectsCount),
    ]);

    const escapeCell = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const toCsv = (rows: string[][]) =>
      rows.map((row) => row.map((cell) => escapeCell(String(cell))).join(',')).join('\n');

    const csv = [
      'Report Summary',
      toCsv(summaryRows),
      '',
      'Club Insights',
      toCsv([clubsHeader, ...clubsRows]),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `admin-report-${stamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const trendMax = Math.max(
    1,
    ...reportData.trend.flatMap((point) => [point.users, point.clubs]),
  );
  const chartWidth = 520;
  const chartHeight = 240;
  const chartPaddingX = 30;
  const chartPaddingY = 30;
  const plotWidth = chartWidth - chartPaddingX * 2;
  const plotHeight = chartHeight - chartPaddingY * 2;
  const pointGap =
    reportData.trend.length > 1 ? plotWidth / (reportData.trend.length - 1) : 0;

  const userPoints = reportData.trend.map((point, index) => ({
    ...point,
    x: chartPaddingX + index * pointGap,
    y: chartPaddingY + plotHeight - (point.users / trendMax) * plotHeight,
  }));
  const clubPoints = reportData.trend.map((point, index) => ({
    ...point,
    x: chartPaddingX + index * pointGap,
    y: chartPaddingY + plotHeight - (point.clubs / trendMax) * plotHeight,
  }));

  const userPath = userPoints
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');
  const clubPath = clubPoints
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  return (
    <div className="min-h-screen w-full bg-slate-100">
      <div className="flex min-h-screen">
        <AdminSidebar active="reports" />
        <MobileSidebarDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Admin Menu">
          <AdminSidebar active="reports" variant="mobile" />
        </MobileSidebarDrawer>

        <main className="flex-1 px-5 py-6 lg:px-8 lg:ml-64">
          <div className="flex items-center justify-between gap-4 lg:hidden">
            <button
              onClick={() => setDrawerOpen(true)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-600"
            >
              <Menu className="h-5 w-5" />
            </button>
            <p className="text-sm font-semibold text-slate-700">Reports</p>
          </div>

          <div className="mt-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">Reports</h1>
                <p className="text-sm text-slate-500 mt-2">
                  Full platform analytics with charts, pie breakdowns, and club insights.
                </p>
              </div>
              <button
                type="button"
                onClick={exportReportCsv}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
              >
                Export CSV
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: 'Total Users',
                value: reportData.stats.totalUsers,
                icon: <Users className="h-4 w-4" />,
                tone: 'from-indigo-600 to-blue-500',
              },
              {
                label: 'Active Clubs',
                value: reportData.stats.totalClubs,
                icon: <FolderKanban className="h-4 w-4" />,
                tone: 'from-cyan-600 to-sky-500',
              },
              {
                label: 'Leader Applications',
                value: reportData.stats.totalApplications,
                icon: <Activity className="h-4 w-4" />,
                tone: 'from-amber-600 to-orange-500',
              },
              {
                label: 'Approval Rate',
                value: `${reportData.stats.approvalRate}%`,
                icon: <CheckCircle2 className="h-4 w-4" />,
                tone: 'from-emerald-600 to-green-500',
              },
            ].map((card) => (
              <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{card.label}</p>
                  <div className={`rounded-lg bg-gradient-to-br ${card.tone} p-2 text-white`}>
                    {card.icon}
                  </div>
                </div>
                <p className="mt-4 text-3xl font-semibold text-slate-900">{card.value}</p>
              </div>
            ))}
          </div>

          {isLoading && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
              Loading report data...
            </div>
          )}

          {hasError && !isLoading && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              Failed to load one or more report datasets from backend.
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <DonutChart
              title="User Role Composition"
              slices={[
                { label: 'Admins', value: reportData.roleCounts.admin, color: '#4f46e5' },
                { label: 'Creators', value: reportData.roleCounts.creator, color: '#0ea5e9' },
                { label: 'Members', value: reportData.roleCounts.member, color: '#10b981' },
              ]}
            />
            <DonutChart
              title="Leader Application Status"
              slices={[
                {
                  label: 'Pending',
                  value: reportData.applicationCounts.pending,
                  color: '#f59e0b',
                },
                {
                  label: 'Approved',
                  value: reportData.applicationCounts.approved,
                  color: '#16a34a',
                },
                {
                  label: 'Rejected',
                  value: reportData.applicationCounts.rejected,
                  color: '#ef4444',
                },
              ]}
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_1fr]">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-slate-700" />
                <p className="text-sm font-semibold text-slate-900">Users vs Clubs Trend</p>
              </div>
              <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-60 w-full">
                  <path d={userPath} fill="none" stroke="#0f172a" strokeWidth="3" />
                  <path d={clubPath} fill="none" stroke="#0891b2" strokeWidth="3" />
                  {userPoints.map((point) => (
                    <g key={point.key}>
                      <circle cx={point.x} cy={point.y} r="4" fill="#0f172a" />
                      <circle
                        cx={clubPoints.find((clubPoint) => clubPoint.key === point.key)?.x ?? point.x}
                        cy={clubPoints.find((clubPoint) => clubPoint.key === point.key)?.y ?? point.y}
                        r="4"
                        fill="#0891b2"
                      />
                      <text
                        x={point.x}
                        y={chartHeight - 8}
                        textAnchor="middle"
                        className="fill-slate-500 text-[10px]"
                      >
                        {point.label}
                      </text>
                    </g>
                  ))}
                </svg>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-slate-900" />
                    Users
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-cyan-600" />
                    Clubs
                  </span>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">Clubs by Category</p>
              <div className="mt-4 space-y-3">
                {reportData.clubsByCategory.length === 0 && (
                  <p className="text-sm text-slate-500">No club categories available.</p>
                )}
                {reportData.clubsByCategory.map((row) => {
                  const max = Math.max(
                    1,
                    ...reportData.clubsByCategory.map((entry) => entry.count),
                  );
                  const width = Math.round((row.count / max) * 100);
                  return (
                    <div key={row.category}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="text-slate-700">{row.category}</span>
                        <span className="font-semibold text-slate-900">{row.count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-cyan-500"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-900">Club Insights</p>
              <span className="text-xs text-slate-500">Top 10 clubs</span>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.12em] text-slate-500">
                    <th className="px-2 py-3">Club</th>
                    <th className="px-2 py-3">Category</th>
                    <th className="px-2 py-3">Creator</th>
                    <th className="px-2 py-3">Created</th>
                    <th className="px-2 py-3">Status</th>
                    <th className="px-2 py-3 text-right">Members</th>
                    <th className="px-2 py-3 text-right">Projects</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.clubInsights.map((club) => (
                    <tr key={club.id} className="border-b border-slate-100 text-slate-700">
                      <td className="px-2 py-3 font-medium text-slate-900">{club.name}</td>
                      <td className="px-2 py-3">{club.category}</td>
                      <td className="px-2 py-3">{club.creatorName}</td>
                      <td className="px-2 py-3">
                        {club.createdAt ? new Date(club.createdAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-2 py-3">
                        {club.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-1 text-xs text-rose-700">
                            <XCircle className="h-3.5 w-3.5" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-3 text-right">{club.membersCount}</td>
                      <td className="px-2 py-3 text-right">{club.projectsCount}</td>
                    </tr>
                  ))}
                  {reportData.clubInsights.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-2 py-6 text-center text-slate-500">
                        No club data available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                <Clock3 className="h-4 w-4" />
                Pending Applications
              </p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">
                {reportData.applicationCounts.pending}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                <CheckCircle2 className="h-4 w-4" />
                Approved Applications
              </p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">
                {reportData.applicationCounts.approved}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                <XCircle className="h-4 w-4" />
                Rejected Applications
              </p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">
                {reportData.applicationCounts.rejected}
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
