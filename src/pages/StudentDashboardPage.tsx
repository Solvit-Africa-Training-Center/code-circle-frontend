import { useMemo, useState } from 'react';
import { BookOpen, Calendar, Flame, Target, Users, CheckCircle2, Menu } from 'lucide-react';
import StudentSidebar from '@/components/student/StudentSidebar';
import { clubs as baseClubs } from '@/data/clubs';
import MobileSidebarDrawer from '@/components/layout/MobileSidebarDrawer';

const upcomingSessions = [
  { title: 'Frontend Sync', time: 'Today · 4:30 PM', club: 'UI Builders' },
  { title: 'Backend Pairing', time: 'Tomorrow · 10:00 AM', club: 'API Guild' },
  { title: 'Design Crit', time: 'Thu · 2:00 PM', club: 'UX Lab' },
];

const tasks = [
  { label: 'Submit sprint demo', status: 'Due today', color: 'bg-rose-100 text-rose-700' },
  { label: 'Review pull request', status: 'Due tomorrow', color: 'bg-amber-100 text-amber-700' },
  { label: 'Publish club summary', status: 'Due Fri', color: 'bg-emerald-100 text-emerald-700' },
];

export default function StudentDashboardPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const authUser = useMemo(() => {
    try {
      const raw = localStorage.getItem('authUser');
      return raw ? (JSON.parse(raw) as { email?: string }) : {};
    } catch {
      return {};
    }
  }, []);

  const studentProfile = useMemo(() => {
    try {
      const raw = localStorage.getItem('studentMembers');
      const members = raw ? (JSON.parse(raw) as { email: string; fullName: string }[]) : [];
      return members.find((member) => member.email === authUser.email);
    } catch {
      return undefined;
    }
  }, [authUser.email]);

  const displayName = studentProfile?.fullName || authUser.email?.split('@')[0] || 'Student';

  const mergedClubs = useMemo(() => {
    try {
      const stored = localStorage.getItem('leaderCreatedClubs');
      const leaderClubs = stored ? JSON.parse(stored) : [];
      return [...leaderClubs, ...baseClubs];
    } catch {
      return baseClubs;
    }
  }, []);

  const joinedClubIds = useMemo(() => {
    try {
      const raw = localStorage.getItem('studentJoinedClubs');
      return raw ? (JSON.parse(raw) as number[]) : [];
    } catch {
      return [];
    }
  }, []);

  const normalizedClubs = useMemo(
    () =>
      mergedClubs.map((club) => ({
        ...club,
        tags: club.tags ?? (club.category ? [club.category, 'Community', 'Projects'] : []),
        stats: club.stats ?? { joinedMembers: 0, projects: club.projectsCount ?? 0, modules: club.modulesCount ?? 0 },
      })),
    [mergedClubs]
  );

  const joinedClubs = useMemo(
    () => normalizedClubs.filter((club) => joinedClubIds.includes(club.id)),
    [joinedClubIds, normalizedClubs]
  );

  const upcomingSessions = useMemo(() => {
    const meetings = (() => {
      try {
        const raw = localStorage.getItem('leaderMeetings');
        const stored = raw ? (JSON.parse(raw) as {
          id: number;
          title: string;
          date: string;
          time: string;
          clubId: number;
          clubName: string;
        }[]) : [];
        return stored.filter((meeting) => joinedClubIds.includes(meeting.clubId));
      } catch {
        return [];
      }
    })();

    const sorted = meetings
      .map((meeting) => ({
        ...meeting,
        timestamp: new Date(`${meeting.date}T${meeting.time || '00:00'}`).getTime()
      }))
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(0, 3);

    return sorted.map((meeting) => ({
      title: meeting.title,
      time: new Date(meeting.timestamp).toLocaleString(),
      club: meeting.clubName
    }));
  }, [joinedClubIds]);

  const tasks = useMemo(() => {
    const assignments = (() => {
      try {
        const raw = localStorage.getItem('leaderAssignments');
        const stored = raw ? (JSON.parse(raw) as {
          id: number;
          title: string;
          dueDate: string;
          clubId: number;
        }[]) : [];
        return stored.filter((assignment) => joinedClubIds.includes(assignment.clubId));
      } catch {
        return [];
      }
    })();

    const mapped = assignments
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 3)
      .map((assignment) => {
        const daysLeft = Math.ceil(
          (new Date(assignment.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        const urgency =
          daysLeft <= 2
            ? 'bg-rose-100 text-rose-700'
            : daysLeft <= 7
              ? 'bg-amber-100 text-amber-700'
              : 'bg-emerald-100 text-emerald-700';
        return {
          label: assignment.title,
          status: `Due ${new Date(assignment.dueDate).toLocaleDateString()}`,
          color: urgency
        };
      });

    if (mapped.length > 0) return mapped;
    return [
      { label: 'Submit sprint demo', status: 'Due today', color: 'bg-rose-100 text-rose-700' },
      { label: 'Review pull request', status: 'Due tomorrow', color: 'bg-amber-100 text-amber-700' },
      { label: 'Publish club summary', status: 'Due Fri', color: 'bg-emerald-100 text-emerald-700' },
    ];
  }, [joinedClubIds]);

  const focusAreas = useMemo(() => {
    const tags = joinedClubs.flatMap((club) => club.tags ?? []);
    const uniqueTags = Array.from(new Set(tags)).slice(0, 4);
    if (uniqueTags.length === 0) {
      return [
        { label: 'Learning Plan', percent: 45 },
        { label: 'Projects', percent: 35 },
        { label: 'Community', percent: 55 },
        { label: 'Practice', percent: 30 },
      ];
    }
    return uniqueTags.map((tag, index) => ({
      label: tag,
      percent: 40 + index * 12,
    }));
  }, [joinedClubs]);

  const clubCards = useMemo(
    () =>
      joinedClubs.map((club, index) => ({
        id: club.id,
        name: club.name,
        description: club.description,
        image: club.image,
        members: club.stats?.joinedMembers ?? 0,
        progress: 60 + index * 10,
      })),
    [joinedClubs]
  );

  const courses = useMemo(() => {
    const tags = joinedClubs.flatMap((club) => club.tags ?? []);
    const uniqueTags = Array.from(new Set(tags)).slice(0, 4);
    return uniqueTags.map((tag, index) => ({
      title: `${tag} Essentials`,
      lessons: 6 + index * 2,
      status: index === 0 ? 'In progress' : 'Next up',
    }));
  }, [joinedClubs]);

  const quickStats = useMemo(
    () => [
      { label: 'Current Streak', value: joinedClubs.length ? '12 days' : '0 days', icon: Flame },
      { label: 'Active Courses', value: String(courses.length), icon: BookOpen },
      { label: 'Club Projects', value: String(joinedClubs.length ? joinedClubs.length * 2 : 0), icon: Target },
    ],
    [courses.length, joinedClubs.length]
  );

  const progressSummary = useMemo(() => {
    const total = focusAreas.reduce((sum, area) => sum + area.percent, 0);
    return Math.round(total / focusAreas.length);
  }, []);

  return (
    <div className="min-h-screen w-full bg-slate-100">
      <div className="flex min-h-screen">
        <StudentSidebar />
        <MobileSidebarDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Student Menu">
          <StudentSidebar variant="mobile" />
        </MobileSidebarDrawer>

        <main className="flex-1 px-5 py-6 lg:px-8 lg:ml-64">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDrawerOpen(true)}
                className="lg:hidden rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-600"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
              <p className="text-xs uppercase tracking-[0.3em] text-blue-600 font-semibold">Student Dashboard</p>
              <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
                Welcome back, {displayName}
              </h1>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-white border border-slate-200 px-3 py-2">
              <div className="h-8 w-8 rounded-full bg-blue-100"></div>
              <div className="text-xs">
                <p className="text-slate-700 font-medium">{displayName}</p>
                <p className="text-slate-400">Student</p>
              </div>
            </div>
          </div>

          <section className="mt-6 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
            <div className="rounded-3xl bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-100">Weekly momentum</p>
                  <h2 className="text-2xl font-semibold mt-2">You are 80% on track</h2>
                  <p className="text-sm text-blue-100 mt-2 max-w-md">
                    Keep your streak alive by completing one lesson and joining a club session today.
                  </p>
                </div>
                <div className="hidden md:flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/40 text-lg font-semibold">
                  {progressSummary}%
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <button className="rounded-full bg-white text-blue-800 px-4 py-2 text-xs font-semibold">
                  Resume Lesson
                </button>
                <button className="rounded-full border border-white/50 px-4 py-2 text-xs font-semibold text-white">
                  Open Study Plan
                </button>
              </div>
            </div>

            <div className="rounded-3xl bg-white border border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Upcoming Sessions</h3>
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <div className="mt-4 space-y-3">
                {upcomingSessions.map((session) => (
                  <div key={session.title} className="rounded-2xl border border-slate-200 p-3">
                    <p className="text-sm font-semibold text-slate-900">{session.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{session.time}</p>
                    <p className="text-xs text-blue-600 mt-2">{session.club}</p>
                  </div>
                ))}
                {upcomingSessions.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-3 text-xs text-slate-500">
                    No meetings scheduled yet.
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="rounded-2xl bg-white border border-slate-200 p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-blue-700" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">{stat.label}</p>
                      <p className="text-lg font-semibold text-slate-900">{stat.value}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>

          <section className="mt-6 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
            <div className="rounded-3xl bg-white border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  <h3 className="text-lg font-semibold text-slate-900">Joined Clubs</h3>
                </div>
                <button className="text-xs font-semibold text-blue-700">View all</button>
              </div>
              <div className="mt-4 overflow-x-auto">
                <div className="flex gap-4 min-w-max pb-2">
                  {clubCards.map((club) => (
                    <div key={club.id} className="w-64 rounded-2xl border border-slate-200 bg-rose-50/50 p-4">
                      <div className="flex items-center justify-between">
                        <div className="h-10 w-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-semibold">
                          {club.name.split(' ').map((word) => word[0]).slice(0, 2).join('')}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {[1, 2].map((item) => (
                              <div key={item} className="h-6 w-6 rounded-full bg-slate-200 border-2 border-white"></div>
                            ))}
                          </div>
                          <span className="text-[10px] font-semibold text-slate-600">+{Math.max(0, club.members - 2)}</span>
                        </div>
                      </div>
                      <h4 className="mt-3 text-sm font-semibold text-slate-900">{club.name}</h4>
                      <p className="mt-1 text-xs text-slate-500 line-clamp-2">{club.description}</p>
                      <button
                        onClick={() => window.location.assign('/student/clubs')}
                        className="mt-4 inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                      >
                        Workspace
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              {clubCards.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                  Join a club to see your progress here.
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl bg-white border border-slate-200 p-5">
                <h3 className="text-sm font-semibold text-slate-900">Focus Areas</h3>
                <div className="mt-4 space-y-3">
                  {focusAreas.map((area) => (
                    <div key={area.label}>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{area.label}</span>
                        <span className="text-slate-700 font-semibold">{area.percent}%</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-blue-700"
                          style={{ width: `${area.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl bg-white border border-slate-200 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">Priority Tasks</h3>
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div className="mt-4 space-y-3">
                  {tasks.map((task) => (
                    <div key={task.label} className="rounded-2xl border border-slate-200 p-3">
                      <p className="text-sm font-semibold text-slate-900">{task.label}</p>
                      <span className={`mt-2 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${task.color}`}>
                        {task.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-3xl bg-white border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">My Courses</h3>
              <BookOpen className="h-4 w-4 text-blue-600" />
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((course) => (
                <div key={course.title} className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-900">{course.title}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {course.lessons} lessons · {course.status}
                  </p>
                  <button
                    onClick={() => window.location.assign('/student/courses')}
                    className="mt-3 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                  >
                    Continue
                  </button>
                </div>
              ))}
              {courses.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                  Courses unlock after you join a club.
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
