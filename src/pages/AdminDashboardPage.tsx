import {
  ArrowUpRight,
  BarChart3,
  FolderKanban,
  Menu,
  ShieldCheck,
  UserCheck2,
  Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import MobileSidebarDrawer from '@/components/layout/MobileSidebarDrawer';
import { useGetActiveClubsQuery } from '@/features/ClubsApi';
import { useGetAdminLeaderApplicationsQuery } from '@/features/LeaderApplicationApi';
import { useGetUsersQuery } from '@/features/UsersApi';

type TrendMode = 'users' | 'clubs';

type TrendPoint = {
  key: string;
  label: string;
  users: number;
  clubs: number;
};

const toMonthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const buildLastMonths = (months: number): TrendPoint[] => {
  const now = new Date();
  return Array.from({ length: months }, (_, index) => {
    const d = new Date(
      now.getFullYear(),
      now.getMonth() - (months - 1 - index),
      1,
    );
    return {
      key: toMonthKey(d),
      label: d.toLocaleString(undefined, { month: 'short' }),
      users: 0,
      clubs: 0,
    };
  });
};

export default function AdminDashboardPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [trendMode, setTrendMode] = useState<TrendMode>('users');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const {
    data: clubs = [],
    isLoading: isLoadingClubs,
    isError: isClubsError,
  } = useGetActiveClubsQuery();
  const {
    data: pendingApplications = [],
    isLoading: isLoadingApplications,
    isError: isApplicationsError,
  } = useGetAdminLeaderApplicationsQuery('PENDING');
  const {
    data: users = [],
    isLoading: isLoadingUsers,
    isError: isUsersError,
  } = useGetUsersQuery({
    page: 1,
    limit: 1000,
    order: 'DESC',
  });

  const dashboardData = useMemo(() => {
    const normalizeRoleName = (value?: string) => String(value ?? '').toUpperCase();

    const isCreator = (roleName?: string) =>
      normalizeRoleName(roleName) === 'CREATOR';
    const isMember = (roleName?: string) =>
      normalizeRoleName(roleName) === 'MEMBER';
    const isAdmin = (roleName?: string) => normalizeRoleName(roleName) === 'ADMIN';

    const approvedLeaders = users.filter((user) => {
      const active = String(user.globalStatus ?? '').toLowerCase() === 'active';
      return active && (user.userRoles ?? []).some((entry) => isCreator(entry.role?.name));
    }).length;

    const studentCount = users.filter((user) =>
      (user.userRoles ?? []).some((entry) => isMember(entry.role?.name)),
    ).length;

    const adminCount = users.filter((user) =>
      (user.userRoles ?? []).some((entry) => isAdmin(entry.role?.name)),
    ).length;

    const statusCounts = users.reduce(
      (acc, user) => {
        const status = String(user.globalStatus ?? '').toLowerCase();
        if (status === 'active') acc.active += 1;
        else if (status === 'pending') acc.pending += 1;
        else if (status === 'rejected') acc.rejected += 1;
        return acc;
      },
      { active: 0, pending: 0, rejected: 0 },
    );

    const roleCounts = {
      admin: adminCount,
      leader: approvedLeaders,
      member: studentCount,
    };

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

    const categoryMap = new Map<string, number>();
    clubs.forEach((club) => {
      const key = club.category?.name?.trim() || 'Uncategorized';
      categoryMap.set(key, (categoryMap.get(key) ?? 0) + 1);
    });

    const topCategories = Array.from(categoryMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const lastMonth = trend.at(-1);
    const previousMonth = trend.at(-2);
    const usersMomentum = (lastMonth?.users ?? 0) - (previousMonth?.users ?? 0);

    return {
      stats: {
        totalClubs: clubs.length,
        pendingApplications: pendingApplications.length,
        approvedLeaders,
        studentCount,
        totalUsers: users.length,
      },
      statusCounts,
      roleCounts,
      trend,
      topCategories,
      usersMomentum,
    };
  }, [clubs, pendingApplications.length, users]);

  const isLoading = isLoadingClubs || isLoadingApplications || isLoadingUsers;
  const hasError = isClubsError || isApplicationsError || isUsersError;

  const trendSeries = dashboardData.trend.map((point) =>
    trendMode === 'users' ? point.users : point.clubs,
  );
  const maxTrendValue = Math.max(1, ...trendSeries);
  const chartWidth = 520;
  const chartHeight = 220;
  const chartPaddingX = 28;
  const chartPaddingY = 28;
  const plotWidth = chartWidth - chartPaddingX * 2;
  const plotHeight = chartHeight - chartPaddingY * 2;
  const pointGap =
    dashboardData.trend.length > 1
      ? plotWidth / (dashboardData.trend.length - 1)
      : 0;

  const points = dashboardData.trend.map((point, index) => {
    const value = trendMode === 'users' ? point.users : point.clubs;
    const x = chartPaddingX + index * pointGap;
    const y = chartPaddingY + plotHeight - (value / maxTrendValue) * plotHeight;
    return { ...point, value, x, y };
  });

  const linePath = points
    .map((p, index) => `${index === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(' ');
  const areaPath = `${linePath} L ${chartPaddingX + plotWidth} ${chartPaddingY + plotHeight} L ${chartPaddingX} ${chartPaddingY + plotHeight} Z`;

  const renderRatio = (count: number, total: number) => {
    if (!total) return 0;
    return Math.round((count / total) * 100);
  };

  const hoveredData =
    hoveredPoint !== null && hoveredPoint >= 0 && hoveredPoint < points.length
      ? points[hoveredPoint]
      : null;

  return (
    <div className="min-h-screen w-full bg-slate-100">
      <div className="flex min-h-screen">
        <AdminSidebar active="dashboard" />
        <MobileSidebarDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title="Admin Menu"
        >
          <AdminSidebar active="dashboard" variant="mobile" />
        </MobileSidebarDrawer>

        <main className="flex-1 px-5 py-6 lg:ml-64 lg:px-8">
          <div className="flex items-center justify-between gap-4 lg:hidden">
            <button
              onClick={() => setDrawerOpen(true)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-600"
            >
              <Menu className="h-5 w-5" />
            </button>
            <p className="text-sm font-semibold text-slate-700">Admin Dashboard</p>
          </div>

          <div className="mt-6">
            <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">
              Admin Overview
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Real-time platform health from backend sources only.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: 'Total Clubs',
                value: dashboardData.stats.totalClubs,
                icon: <FolderKanban className="h-4 w-4" />,
                tone: 'from-cyan-600 to-sky-500',
              },
              {
                label: 'Pending Applications',
                value: dashboardData.stats.pendingApplications,
                icon: <ShieldCheck className="h-4 w-4" />,
                tone: 'from-amber-600 to-orange-500',
              },
              {
                label: 'Approved Leaders',
                value: dashboardData.stats.approvedLeaders,
                icon: <UserCheck2 className="h-4 w-4" />,
                tone: 'from-emerald-600 to-green-500',
              },
              {
                label: 'Student Members',
                value: dashboardData.stats.studentCount,
                icon: <Users className="h-4 w-4" />,
                tone: 'from-indigo-600 to-blue-500',
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    {item.label}
                  </p>
                  <div
                    className={`rounded-lg bg-gradient-to-br ${item.tone} p-2 text-white`}
                  >
                    {item.icon}
                  </div>
                </div>
                <p className="mt-4 text-3xl font-semibold text-slate-900">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {isLoading && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
              Loading dashboard data...
            </div>
          )}

          {hasError && !isLoading && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              Failed to load one or more dashboard metrics from backend.
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr]">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Growth Trend</p>
                  <p className="text-xs text-slate-500">
                    Last 6 months based on backend `createdAt` data
                  </p>
                </div>
                <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setTrendMode('users')}
                    className={`rounded-md px-3 py-1 ${trendMode === 'users' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                  >
                    Users
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrendMode('clubs')}
                    className={`rounded-md px-3 py-1 ${trendMode === 'clubs' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                  >
                    Clubs
                  </button>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-3">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-56 w-full">
                  <defs>
                    <linearGradient id="adminTrendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0284c7" stopOpacity="0.28" />
                      <stop offset="100%" stopColor="#0284c7" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                  <path d={areaPath} fill="url(#adminTrendFill)" />
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#0369a1"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  {points.map((point, index) => (
                    <g key={point.key}>
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r={hoveredPoint === index ? 6 : 4}
                        fill={hoveredPoint === index ? '#0284c7' : '#0ea5e9'}
                        onMouseEnter={() => setHoveredPoint(index)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                      <text
                        x={point.x}
                        y={chartHeight - 6}
                        textAnchor="middle"
                        className="fill-slate-500 text-[10px]"
                      >
                        {point.label}
                      </text>
                    </g>
                  ))}
                </svg>
                <div className="mt-1 flex items-center justify-between text-xs text-slate-600">
                  <span>
                    Current month:{' '}
                    <span className="font-semibold text-slate-900">
                      {points.at(-1)?.value ?? 0}
                    </span>
                  </span>
                  {hoveredData && (
                    <span className="rounded-full bg-cyan-100 px-2 py-1 font-medium text-cyan-800">
                      {hoveredData.label}: {hoveredData.value}
                    </span>
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">Operational Signals</p>
              <div className="mt-4 space-y-3 text-sm">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    User Momentum
                  </p>
                  <p className="mt-2 flex items-center gap-2 text-xl font-semibold text-slate-900">
                    {dashboardData.usersMomentum >= 0 ? '+' : ''}
                    {dashboardData.usersMomentum}
                    <ArrowUpRight
                      className={`h-4 w-4 ${dashboardData.usersMomentum >= 0 ? 'text-emerald-600' : 'rotate-90 text-rose-600'}`}
                    />
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Total Users
                  </p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">
                    {dashboardData.stats.totalUsers}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Pending Reviews
                  </p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">
                    {dashboardData.stats.pendingApplications}
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-slate-700" />
                <p className="text-sm font-semibold text-slate-900">Role Composition</p>
              </div>
              <div className="mt-4 space-y-3">
                {[
                  {
                    label: 'Admins',
                    count: dashboardData.roleCounts.admin,
                    color: 'bg-indigo-500',
                  },
                  {
                    label: 'Leaders',
                    count: dashboardData.roleCounts.leader,
                    color: 'bg-emerald-500',
                  },
                  {
                    label: 'Members',
                    count: dashboardData.roleCounts.member,
                    color: 'bg-cyan-500',
                  },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-slate-700">{row.label}</span>
                      <span className="font-semibold text-slate-900">
                        {row.count} (
                        {renderRatio(row.count, dashboardData.stats.totalUsers)}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div
                        className={`h-2 rounded-full ${row.color} transition-all duration-300`}
                        style={{
                          width: `${renderRatio(row.count, dashboardData.stats.totalUsers)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">
                User Status Breakdown
              </p>
              <div className="mt-4 space-y-3">
                {[
                  {
                    label: 'Active',
                    count: dashboardData.statusCounts.active,
                    color: 'bg-emerald-500',
                  },
                  {
                    label: 'Pending',
                    count: dashboardData.statusCounts.pending,
                    color: 'bg-amber-500',
                  },
                  {
                    label: 'Rejected',
                    count: dashboardData.statusCounts.rejected,
                    color: 'bg-rose-500',
                  },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-slate-700">{row.label}</span>
                      <span className="font-semibold text-slate-900">
                        {row.count} (
                        {renderRatio(row.count, dashboardData.stats.totalUsers)}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div
                        className={`h-2 rounded-full ${row.color} transition-all duration-300`}
                        style={{
                          width: `${renderRatio(row.count, dashboardData.stats.totalUsers)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Top Club Categories</p>
            {dashboardData.topCategories.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">
                No active clubs available yet.
              </p>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {dashboardData.topCategories.map((item) => {
                  const maxCount = Math.max(
                    ...dashboardData.topCategories.map((entry) => entry.count),
                  );
                  const width =
                    maxCount > 0 ? Math.round((item.count / maxCount) * 100) : 0;
                  return (
                    <div
                      key={item.name}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-800">{item.name}</span>
                        <span className="font-semibold text-slate-900">
                          {item.count}
                        </span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-slate-200">
                        <div
                          className="h-2 rounded-full bg-sky-500"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
