import { useMemo } from 'react';
import { BookOpen, Clock, GraduationCap, Search } from 'lucide-react';
import StudentSidebar from '@/components/student/StudentSidebar';
import { clubs as baseClubs } from '@/data/clubs';
import { studentCourses } from '@/data/studentCourses';
import { useNavigate } from 'react-router-dom';

export default function StudentCoursesPage() {
  const navigate = useNavigate();

  const authUser = useMemo(() => {
    try {
      const raw = localStorage.getItem('authUser');
      return raw ? (JSON.parse(raw) as { email?: string }) : {};
    } catch {
      return {};
    }
  }, []);

  const progressByCourse = useMemo(() => {
    try {
      const raw = localStorage.getItem(`studentCourseProgress:${authUser.email ?? 'anonymous'}`);
      const stored = raw ? (JSON.parse(raw) as Record<string, { completedLessons: string[] }>) : {};
      return stored;
    } catch {
      return {};
    }
  }, [authUser.email]);
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

  const joinedClubs = useMemo(
    () => mergedClubs.filter((club) => joinedClubIds.includes(club.id)),
    [mergedClubs, joinedClubIds]
  );

  const courses = useMemo(() => {
    const tags = joinedClubs.flatMap((club) => club.tags ?? []);
    if (tags.length === 0) return studentCourses;
    const lowerTags = tags.map((tag) => tag.toLowerCase());
    const matched = studentCourses.filter((course) =>
      lowerTags.some((tag) => course.title.toLowerCase().includes(tag))
    );
    return matched.length > 0 ? matched : studentCourses;
  }, [joinedClubs]);

  return (
    <div className="min-h-screen w-full bg-slate-100">
      <div className="flex min-h-screen">
        <StudentSidebar />

        <main className="flex-1 px-5 py-6 lg:px-8 lg:ml-64">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-blue-600 font-semibold">My Courses</p>
              <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">Keep learning</h1>
            </div>
            <div className="flex-1 md:max-w-md">
              <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-500">
                <Search className="h-4 w-4 text-slate-400" />
                <input className="w-full outline-none" placeholder="Search lessons, clubs, or topics..." />
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {courses.map((course) => {
                const totalLessons = course.modules.reduce((sum, mod) => sum + mod.lessons.length, 0);
                const completed = progressByCourse[course.id]?.completedLessons?.length ?? 0;
                const progress = totalLessons ? Math.round((completed / totalLessons) * 100) : 0;
                const status = progress >= 100 ? 'Completed' : progress > 0 ? 'In progress' : 'Not started';
                return (
                <div key={course.title} className="rounded-2xl bg-white border border-slate-200 p-4">
                  <div className="h-36 w-full overflow-hidden rounded-xl bg-slate-100">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-blue-600 font-semibold">
                      {status}
                    </span>
                    <span className="text-xs text-slate-400">
                      {totalLessons} lessons
                    </span>
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-slate-900">{course.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{course.level}</p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                    <GraduationCap className="h-4 w-4 text-blue-600" />
                    {course.instructor}
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
              )})}
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl bg-white border border-slate-200 p-4">
                <h3 className="text-sm font-semibold text-slate-900">Learning Summary</h3>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Active courses</span>
                    <span className="text-slate-700 font-semibold">{courses.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Completed</span>
                    <span className="text-slate-700 font-semibold">2</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Hours learned</span>
                    <span className="text-slate-700 font-semibold">142</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Certificates</span>
                    <span className="text-slate-700 font-semibold">3</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 p-4 text-white">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-blue-100">
                  <BookOpen className="h-4 w-4" />
                  Recommended
                </div>
                <p className="mt-3 text-sm font-semibold">
                  Explore new skills tailored to your club focus.
                </p>
                <button className="mt-4 w-full rounded-full bg-white/15 px-4 py-2 text-xs font-semibold text-white hover:bg-white/25">
                  Browse Catalog
                </button>
              </div>

              <div className="rounded-2xl bg-white border border-slate-200 p-4">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Clock className="h-4 w-4 text-blue-600" />
                  Next session in 2 days
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-900">Frontend Sync</p>
                <p className="text-xs text-slate-500 mt-1">Wednesday · 4:30 PM</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
