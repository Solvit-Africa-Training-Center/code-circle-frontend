import { useMemo, useState } from 'react';
import { BookOpen, Clock, GraduationCap, Search, Menu } from 'lucide-react';
import StudentSidebar from '@/components/student/StudentSidebar';
import { useNavigate } from 'react-router-dom';
import MobileSidebarDrawer from '@/components/layout/MobileSidebarDrawer';
import { useGetActiveClubsQuery } from '@/features/ClubsApi';
import { useGetCoursesByClubIdsQuery } from '@/features/CoursesApi';
import { useGetUserMembershipsQuery } from '@/features/UsersApi';
import {
  computeCourseProgress,
  type StoredCourseProgress,
} from '@/utils/courseProgress';

export default function StudentCoursesPage() {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const authUser = useMemo(() => {
    try {
      const raw = localStorage.getItem('authUser');
      return raw ? (JSON.parse(raw) as { id?: string; email?: string }) : {};
    } catch {
      return {};
    }
  }, []);

  const { data: clubs = [] } = useGetActiveClubsQuery();
  const { data: memberships = [] } = useGetUserMembershipsQuery(authUser.id ?? '', {
    skip: !authUser.id,
  });
  const joinedClubIds = useMemo(() => {
    const fromMemberships = memberships
      .filter((membership) => membership.status === 'active' && membership.clubId)
      .map((membership) => String(membership.clubId));
    if (fromMemberships.length > 0) {
      return Array.from(new Set(fromMemberships));
    }
    try {
      const raw = localStorage.getItem('studentJoinedClubs');
      return raw ? (JSON.parse(raw) as Array<number | string>).map((id) => String(id)) : [];
    } catch {
      return [];
    }
  }, [memberships]);

  const clubIds = useMemo(
    () => clubs.map((club) => String(club.id)).filter((clubId) => joinedClubIds.includes(clubId)),
    [clubs, joinedClubIds],
  );
  const { data: allCourses = [], isLoading } = useGetCoursesByClubIdsQuery(clubIds, {
    skip: clubIds.length === 0,
  });

  const courses = useMemo(
    () => allCourses.filter((course) => course.status === 'published'),
    [allCourses],
  );

  const filteredCourses = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return courses;
    return courses.filter((course) =>
      [course.title, course.description, course.level]
        .filter(Boolean)
        .some((item) => item.toLowerCase().includes(search)),
    );
  }, [courses, searchTerm]);

  const progressByCourse = useMemo(() => {
    try {
      const raw = localStorage.getItem(`studentCourseProgress:${authUser.email ?? 'anonymous'}`);
      const stored = raw ? (JSON.parse(raw) as Record<string, StoredCourseProgress>) : {};
      return stored;
    } catch {
      return {};
    }
  }, [authUser.email]);
  const submittedAssignmentsCount = useMemo(() => {
    try {
      const raw = localStorage.getItem(`studentSubmittedAssignments:${authUser.email ?? 'anonymous'}`);
      return raw ? (JSON.parse(raw) as string[]).length : 0;
    } catch {
      return 0;
    }
  }, [authUser.email]);
  const submittedProjectsCount = useMemo(() => {
    try {
      const raw = localStorage.getItem(`studentSubmittedProjects:${authUser.email ?? 'anonymous'}`);
      return raw ? (JSON.parse(raw) as string[]).length : 0;
    } catch {
      return 0;
    }
  }, [authUser.email]);

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
                <p className="text-xs uppercase tracking-[0.3em] text-blue-600 font-semibold">My Courses</p>
                <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">Keep learning</h1>
              </div>
            </div>
            <div className="flex-1 md:max-w-md">
              <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-500">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full outline-none"
                  placeholder="Search courses..."
                />
              </div>
            </div>
          </div>

          {isLoading && (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
              Loading courses...
            </div>
          )}

          {!isLoading && (
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredCourses.map((course) => {
                  const totalLessons = course.modules?.reduce(
                    (sum, mod) => sum + (mod.lessons?.length ?? 0),
                    0,
                  ) ?? 0;
                  const storedProgress = progressByCourse[course.id];
                  const completedLessons = storedProgress?.completedLessons?.length ?? 0;
                  const completedAssignments = storedProgress?.completedAssignmentIds?.length ?? 0;
                  const requiredAssignments = storedProgress?.requiredAssignments ?? 0;
                  const completedProjects = storedProgress?.completedProjectIds?.length ?? 0;
                  const requiredProjects = storedProgress?.requiredProjects ?? 0;
                  const metrics = computeCourseProgress({
                    lessonTotal: totalLessons,
                    completedLessons,
                    requiredAssignments,
                    completedAssignments,
                    requiredProjects,
                    completedProjects,
                  });
                  const progress = metrics.percent;
                  const status = metrics.isCompleted
                    ? 'Completed'
                    : progress > 0
                      ? 'In progress'
                      : 'Not started';
                  return (
                    <div key={course.id} className="rounded-2xl bg-white border border-slate-200 p-4">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="h-36 w-full rounded-xl object-cover"
                        />
                      ) : (
                        <div className="h-36 w-full rounded-xl bg-slate-100 flex items-center justify-center text-xs text-slate-500">
                          No Thumbnail
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-blue-600 font-semibold">
                          {status}
                        </span>
                        <span className="text-xs text-slate-400">{totalLessons} lessons</span>
                      </div>
                      <h3 className="mt-3 text-sm font-semibold text-slate-900">{course.title}</h3>
                      <p className="text-xs text-slate-500 mt-1">{course.level}</p>
                      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                        <GraduationCap className="h-4 w-4 text-blue-600" />
                        {course.duration || 0}h duration
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>Progress</span>
                          <span className="text-slate-700 font-semibold">{progress}%</span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-slate-100">
                          <div className="h-2 rounded-full bg-blue-700" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                      {status === 'Completed' ? (
                        <button
                          className="mt-4 w-full rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700"
                          disabled
                        >
                          Completed
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate(`/student/courses/${course.id}`)}
                          className="mt-4 w-full rounded-full bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                        >
                          {status === 'In progress' ? 'Resume Course' : 'Learn Course'}
                        </button>
                      )}
                    </div>
                  );
                })}
                {filteredCourses.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
                    No published courses available in your joined clubs.
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl bg-white border border-slate-200 p-4">
                  <h3 className="text-sm font-semibold text-slate-900">Learning Summary</h3>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Active courses</span>
                      <span className="text-slate-700 font-semibold">{filteredCourses.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Completed</span>
                      <span className="text-slate-700 font-semibold">
                        {filteredCourses.filter((course) => {
                          const totalLessons = course.modules?.reduce(
                            (sum, mod) => sum + (mod.lessons?.length ?? 0),
                            0,
                          ) ?? 0;
                          const storedProgress = progressByCourse[course.id];
                          const metrics = computeCourseProgress({
                            lessonTotal: totalLessons,
                            completedLessons: storedProgress?.completedLessons?.length ?? 0,
                            requiredAssignments: storedProgress?.requiredAssignments ?? 0,
                            completedAssignments: storedProgress?.completedAssignmentIds?.length ?? 0,
                            requiredProjects: storedProgress?.requiredProjects ?? 0,
                            completedProjects: storedProgress?.completedProjectIds?.length ?? 0,
                          });
                          return metrics.isCompleted;
                        }).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Assignments submitted</span>
                      <span className="text-slate-700 font-semibold">{submittedAssignmentsCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Projects submitted</span>
                      <span className="text-slate-700 font-semibold">{submittedProjectsCount}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 p-4 text-white">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-blue-100">
                    <BookOpen className="h-4 w-4" />
                    Recommended
                  </div>
                  <p className="mt-3 text-sm font-semibold">
                    Explore new courses from active clubs.
                  </p>
                  <button className="mt-4 w-full rounded-full bg-white/15 px-4 py-2 text-xs font-semibold text-white hover:bg-white/25">
                    Browse Catalog
                  </button>
                </div>

                <div className="rounded-2xl bg-white border border-slate-200 p-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="h-4 w-4 text-blue-600" />
                    Keep your streak active
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-900">Continue your learning today</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
