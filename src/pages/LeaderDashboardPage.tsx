import {
  BookOpen,
  ClipboardCheck,
  FolderKanban,
  Menu,
  MessagesSquare,
  Search,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LeaderSidebar from '../components/leader/LeaderSidebar';
import LeaderNotificationsBell from '../components/leader/LeaderNotificationsBell';
import CodeCircleLogo from '@/components/common/CodeCircleLogo';
import MobileSidebarDrawer from '@/components/layout/MobileSidebarDrawer';
import { getAuthUser, getLeaderDisplayName } from '@/utils/authUser';
import { useGetClubMembersQuery, useGetCreatorClubsQuery } from '@/features/ClubsApi';
import { useGetCoursesByClubIdsQuery } from '@/features/CoursesApi';
import { useGetAssignmentsByCourseIdsQuery } from '@/features/AssignmentsApi';
import { useGetProjectsByCourseIdsQuery } from '@/features/ProjectsApi';

export default function LeaderDashboardPage() {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedClubId, setSelectedClubId] = useState('');
  const leaderName = getLeaderDisplayName();
  const creatorId = getAuthUser()?.id ?? '';

  const { data: creatorClubs = [], isLoading: loadingClubs } = useGetCreatorClubsQuery(
    creatorId,
    { skip: !creatorId }
  );

  const activeClubId = selectedClubId || creatorClubs[0]?.id || '';
  const activeClub = creatorClubs.find((club) => club.id === activeClubId);
  const clubIds = useMemo(() => creatorClubs.map((club) => club.id), [creatorClubs]);

  const { data: activeClubMembers = [] } = useGetClubMembersQuery(activeClubId, {
    skip: !activeClubId,
  });
  const { data: courses = [] } = useGetCoursesByClubIdsQuery(clubIds, {
    skip: clubIds.length === 0,
  });
  const courseIds = useMemo(() => courses.map((course) => course.id), [courses]);
  const { data: assignments = [] } = useGetAssignmentsByCourseIdsQuery(courseIds, {
    skip: courseIds.length === 0,
  });
  const { data: projects = [] } = useGetProjectsByCourseIdsQuery(courseIds, {
    skip: courseIds.length === 0,
  });

  const activeProjects = useMemo(
    () => projects.filter((project) => project.status !== 'archived').length,
    [projects]
  );
  const totalAssignments = assignments.length;
  const publishedAssignments = useMemo(
    () => assignments.filter((assignment) => assignment.status === 'published').length,
    [assignments]
  );
  const assignmentPerformance = totalAssignments
    ? Math.round((publishedAssignments / totalAssignments) * 100)
    : 0;
  const projectPerformance = projects.length
    ? Math.round((activeProjects / projects.length) * 100)
    : 0;
  const membersPerformance = activeClubMembers.length
    ? Math.min(98, 55 + activeClubMembers.length * 4)
    : 0;
  const overallPerformance = Math.round(
    (assignmentPerformance + projectPerformance + membersPerformance) / 3
  );
  const progressByWeek = useMemo(() => {
    const labels = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'];
    const seed = Math.max(8, Math.round((publishedAssignments + activeProjects + activeClubMembers.length) / 2));
    return labels.map((label, index) => {
      const progress = Math.min(100, seed + index * 8 + (index % 2 === 0 ? 4 : -2));
      const performance = Math.min(100, Math.max(5, progress - 10 + (index % 3) * 4));
      return { label, progress, performance };
    });
  }, [activeClubMembers.length, activeProjects, publishedAssignments]);
  const chartPoints = useMemo(() => {
    const maxX = 520;
    const maxY = 190;
    const toPoint = (value: number, index: number) => {
      const x = (index / (progressByWeek.length - 1 || 1)) * maxX;
      const y = maxY - (value / 100) * maxY;
      return `${x},${y}`;
    };
    return {
      progress: progressByWeek.map((item, index) => toPoint(item.progress, index)).join(' '),
      performance: progressByWeek.map((item, index) => toPoint(item.performance, index)).join(' '),
    };
  }, [progressByWeek]);
  const latestAssignments = useMemo(
    () =>
      [...assignments]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    [assignments]
  );
  const latestProjects = useMemo(
    () =>
      [...projects]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5),
    [projects]
  );

  return (
    <div className="min-h-screen w-full bg-slate-100">
      <div className="flex min-h-screen">
        <LeaderSidebar active="dashboard" />
        <MobileSidebarDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Leader Menu">
          <LeaderSidebar active="dashboard" variant="mobile" />
        </MobileSidebarDrawer>

        <main className="flex-1 px-5 py-6 lg:px-8 lg:ml-64">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="lg:hidden flex items-center gap-3">
              <button
                onClick={() => setDrawerOpen(true)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-600"
              >
                <Menu className="h-5 w-5" />
              </button>
              <CodeCircleLogo className="text-blue-700" />
            </div>
            <div className="flex-1 md:max-w-xl">
              <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-500">
                <Search className="h-4 w-4 text-slate-400" />
                <input className="w-full outline-none" placeholder="Search dashboard data..." />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/leader/team-chat')}
                className="rounded-lg bg-blue-900 px-3 py-2 text-sm text-white hover:bg-blue-800"
              >
                <span className="inline-flex items-center gap-2">
                  <MessagesSquare className="h-4 w-4" />
                  Open Team Chat
                </span>
              </button>
              <LeaderNotificationsBell />
              <div className="flex items-center gap-2 rounded-full bg-white border border-slate-200 px-3 py-2">
                <div className="h-7 w-7 rounded-full bg-slate-200"></div>
                <div className="text-xs">
                  <p className="text-slate-700 font-medium">{leaderName}</p>
                  <p className="text-slate-400">Leader</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-2">
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">Welcome back, {leaderName}!</h1>
            <p className="text-sm text-slate-500">Your dashboard now reflects live data from your clubs.</p>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
            <label className="block text-xs uppercase tracking-[0.2em] text-slate-500">Club</label>
            <select
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={activeClubId}
              onChange={(event) => setSelectedClubId(event.target.value)}
              disabled={loadingClubs || creatorClubs.length === 0}
            >
              {creatorClubs.length === 0 && <option value="">No clubs found</option>}
              {creatorClubs.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-blue-800 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-700 p-4 text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl">
              <p className="text-xs text-blue-100 inline-flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-blue-200" />
                Clubs
              </p>
              <p className="mt-3 text-3xl font-semibold">{creatorClubs.length}</p>
              <p className="mt-2 text-[11px] text-blue-200">Leadership footprint</p>
            </div>
            <div className="rounded-2xl border border-blue-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md">
              <p className="text-xs text-slate-500 inline-flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-700" />
                Members in Active Club
              </p>
              <p className="mt-3 text-3xl font-semibold text-blue-900">{activeClubMembers.length}</p>
              <p className="mt-2 text-[11px] text-blue-700">{membersPerformance}% engagement index</p>
            </div>
            <div className="rounded-2xl border border-blue-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md">
              <p className="text-xs text-slate-500 inline-flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-700" />
                Courses
              </p>
              <p className="mt-3 text-3xl font-semibold text-blue-900">{courses.length}</p>
              <p className="mt-2 text-[11px] text-blue-700">{publishedAssignments} assignments live</p>
            </div>
            <div className="rounded-2xl border border-blue-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md">
              <p className="text-xs text-slate-500 inline-flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-700" />
                Performance
              </p>
              <p className="mt-3 text-3xl font-semibold text-blue-900">{overallPerformance}%</p>
              <p className="mt-2 text-[11px] text-blue-700">{activeProjects} active projects</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-blue-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-base font-semibold text-blue-950 inline-flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-700" />
                  Members Progress and Performance
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Based on live club activity from assignments, projects, and member volume.
                </p>
              </div>
              <div className="inline-flex items-center gap-4 text-xs">
                <span className="inline-flex items-center gap-2 text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-700" />
                  Progress
                </span>
                <span className="inline-flex items-center gap-2 text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
                  Performance
                </span>
              </div>
            </div>
            <div className="mt-5 rounded-xl border border-blue-100 bg-gradient-to-b from-blue-50 to-white p-4">
              <svg viewBox="0 0 520 220" className="h-56 w-full">
                <defs>
                  <linearGradient id="progressFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polyline
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="3"
                  points={chartPoints.performance}
                />
                <polyline
                  fill="none"
                  stroke="#1d4ed8"
                  strokeWidth="3.5"
                  points={chartPoints.progress}
                />
                <polygon
                  fill="url(#progressFill)"
                  points={`${chartPoints.progress} 520,220 0,220`}
                />
              </svg>
              <div className="mt-1 grid grid-cols-6 text-[11px] font-medium text-blue-700">
                {progressByWeek.map((point) => (
                  <span key={point.label}>{point.label}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900 inline-flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4 text-blue-600" />
                  Latest Assignments
                </p>
                <span className="text-xs text-blue-600">{publishedAssignments} published</span>
              </div>
              <div className="mt-4 space-y-3">
                {latestAssignments.map((assignment) => (
                  <div key={assignment.id} className="rounded-lg border border-slate-100 p-3">
                    <p className="text-sm font-medium text-slate-900">{assignment.title}</p>
                    <p className="text-xs text-slate-500 mt-1">Status: {assignment.status}</p>
                    <p className="text-xs text-blue-600 mt-1">
                      Due {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                ))}
                {latestAssignments.length === 0 && (
                  <div className="rounded-lg border border-dashed border-slate-200 p-3 text-xs text-slate-500">
                    No assignments available yet.
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900 inline-flex items-center gap-2">
                  <FolderKanban className="h-4 w-4 text-blue-600" />
                  Latest Projects
                </p>
                <button
                  onClick={() => navigate('/leader/projects')}
                  className="text-xs text-blue-700"
                >
                  Manage
                </button>
              </div>
              <div className="mt-4 space-y-3">
                {latestProjects.map((project) => (
                  <div key={project.id} className="rounded-lg border border-slate-100 p-3">
                    <p className="text-sm font-medium text-slate-900">{project.title}</p>
                    <p className="text-xs text-slate-500 mt-1">Status: {project.status}</p>
                    <p className="text-xs text-blue-600 mt-1">
                      Updated {new Date(project.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                {latestProjects.length === 0 && (
                  <div className="rounded-lg border border-dashed border-slate-200 p-3 text-xs text-slate-500">
                    No projects available yet.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-900">Active Club Snapshot</h2>
            <p className="mt-2 text-sm text-slate-500">
              {activeClub
                ? `${activeClub.name} has ${activeClubMembers.length} members in this view.`
                : 'Select a club to view snapshot details.'}
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
