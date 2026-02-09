import { useMemo, useState } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, Layers, Menu } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import StudentSidebar from '@/components/student/StudentSidebar';
import { studentCourses } from '@/data/studentCourses';
import MobileSidebarDrawer from '@/components/layout/MobileSidebarDrawer';

type CourseProgress = {
  completedLessons: string[];
  currentLesson?: string;
};

export default function StudentCourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const course = studentCourses.find((item) => item.id === id);

  const authUser = useMemo(() => {
    try {
      const raw = localStorage.getItem('authUser');
      return raw ? (JSON.parse(raw) as { email?: string }) : {};
    } catch {
      return {};
    }
  }, []);

  const storageKey = useMemo(
    () => `studentCourseProgress:${authUser.email ?? 'anonymous'}`,
    [authUser.email]
  );

  const [progress, setProgress] = useState<CourseProgress>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      const all = raw ? (JSON.parse(raw) as Record<string, CourseProgress>) : {};
      return all[course?.id ?? ''] ?? { completedLessons: [] };
    } catch {
      return { completedLessons: [] };
    }
  });

  const allLessons = useMemo(() => {
    if (!course) return [];
    return course.modules.flatMap((mod) =>
      mod.lessons.map((lesson) => `${mod.id}::${lesson}`)
    );
  }, [course]);

  const currentLesson = useMemo(() => {
    if (!course) return '';
    if (progress.currentLesson) return progress.currentLesson;
    return allLessons[0] ?? '';
  }, [course, progress.currentLesson, allLessons]);

  const currentIndex = allLessons.indexOf(currentLesson);
  const completedCount = progress.completedLessons.length;
  const percent = allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0;

  const updateProgress = (next: CourseProgress) => {
    setProgress(next);
    try {
      const raw = localStorage.getItem(storageKey);
      const all = raw ? (JSON.parse(raw) as Record<string, CourseProgress>) : {};
      if (course?.id) {
        all[course.id] = next;
        localStorage.setItem(storageKey, JSON.stringify(all));
      }
    } catch {
      // Ignore storage errors in demo mode
    }
  };

  const handleMarkComplete = () => {
    if (!currentLesson) return;
    const nextCompleted = Array.from(new Set([...progress.completedLessons, currentLesson]));
    const nextLesson =
      allLessons[Math.min(allLessons.length - 1, Math.max(0, currentIndex + 1))] ?? currentLesson;
    updateProgress({ ...progress, completedLessons: nextCompleted, currentLesson: nextLesson });
  };

  const goToLesson = (lessonId: string) => {
    updateProgress({ ...progress, currentLesson: lessonId });
  };

  if (!course) {
    return (
      <div className="min-h-screen w-full bg-slate-100">
        <div className="flex min-h-screen">
          <StudentSidebar />
          <MobileSidebarDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Student Menu">
            <StudentSidebar variant="mobile" />
          </MobileSidebarDrawer>
          <main className="flex-1 px-5 py-12 lg:px-8 lg:ml-64">
            <div className="mb-6 flex items-center">
              <button
                onClick={() => setDrawerOpen(true)}
                className="lg:hidden rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-600"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <h1 className="text-2xl font-semibold text-slate-900">Course not found</h1>
              <p className="text-sm text-slate-600 mt-2">
                Choose a course from your course catalog.
              </p>
              <button
                onClick={() => navigate('/student/courses')}
                className="mt-6 rounded-full bg-blue-900 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Back to Courses
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-100">
      <div className="flex min-h-screen">
        <StudentSidebar />
        <MobileSidebarDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Student Menu">
          <StudentSidebar variant="mobile" />
        </MobileSidebarDrawer>

        <main className="flex-1 px-5 py-6 lg:px-8 lg:ml-64">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <button
                onClick={() => setDrawerOpen(true)}
                className="lg:hidden mt-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-600"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
              <button
                onClick={() => navigate('/student/courses')}
                className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Courses
              </button>
              <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 mt-3">{course.title}</h1>
              <p className="text-sm text-slate-500 mt-1">{course.level}</p>
              </div>
            </div>
            <div className="rounded-2xl bg-white border border-slate-200 px-4 py-3 text-xs">
              <p className="text-slate-500">Progress</p>
              <p className="text-lg font-semibold text-slate-900">{percent}%</p>
            </div>
          </div>

          <section className="mt-6 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
            <div className="rounded-3xl bg-white border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Lesson Viewer</h2>
                <button
                  onClick={handleMarkComplete}
                  className="inline-flex items-center gap-2 rounded-full bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Mark Complete
                </button>
              </div>
              <div className="mt-5 rounded-2xl border border-slate-200 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-blue-600 font-semibold">Current lesson</p>
                <h3 className="text-xl font-semibold text-slate-900 mt-3">
                  {currentLesson.split('::')[1] || 'Select a lesson'}
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Review the lesson, complete the task, and mark it as done to unlock the next one.
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={() => goToLesson(allLessons[Math.max(0, currentIndex - 1)])}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </button>
                  <button
                    onClick={() => goToLesson(allLessons[Math.min(allLessons.length - 1, currentIndex + 1)])}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Modules</h2>
                <Layers className="h-4 w-4 text-blue-600" />
              </div>
              <div className="mt-4 space-y-4">
                {course.modules.map((mod) => (
                  <div key={mod.id} className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-sm font-semibold text-slate-900">{mod.title}</p>
                    <div className="mt-3 space-y-2">
                      {mod.lessons.map((lesson) => {
                        const lessonId = `${mod.id}::${lesson}`;
                        const isDone = progress.completedLessons.includes(lessonId);
                        const isActive = currentLesson === lessonId;
                        return (
                          <button
                            key={lessonId}
                            onClick={() => goToLesson(lessonId)}
                            className={`w-full text-left rounded-xl px-3 py-2 text-xs font-semibold transition ${
                              isActive
                                ? 'bg-blue-900 text-white'
                                : isDone
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {lesson}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
