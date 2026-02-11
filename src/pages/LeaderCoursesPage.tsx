import { useMemo, useState } from 'react';
import { BookOpen, Layers, Menu, Plus, Search, Trash2, Pencil } from 'lucide-react';
import LeaderSidebar from '../components/leader/LeaderSidebar';
import LeaderNotificationsBell from '../components/leader/LeaderNotificationsBell';
import CodeCircleLogo from '@/components/common/CodeCircleLogo';
import MobileSidebarDrawer from '@/components/layout/MobileSidebarDrawer';
import { getAuthUser, getLeaderDisplayName } from '@/utils/authUser';
import { clubs as baseClubs } from '@/data/clubs';
import { studentCourses, type StudentCourse } from '@/data/studentCourses';
import { addNotification } from '@/utils/notifications';
import { showToast } from '@/utils/toast';

type LeaderCourse = StudentCourse & {
  clubId: number;
  clubName: string;
  createdAt: string;
};

const defaultImage = studentCourses[0]?.image ?? '/assets/c1image.jpg';

export default function LeaderCoursesPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const leaderName = getLeaderDisplayName();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<LeaderCourse | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formState, setFormState] = useState({
    title: '',
    level: '',
    instructor: '',
    lessons: '',
    clubId: ''
  });

  const availableClubs = useMemo(() => {
    const authUser = getAuthUser();
    try {
      const stored = localStorage.getItem('leaderCreatedClubs');
      const created = stored ? JSON.parse(stored) : [];
      if (!authUser?.email) return created;
      return created.filter((club: { leaderEmail?: string }) => club.leaderEmail === authUser.email);
    } catch {
      return [];
    }
  }, []);

  const [courses, setCourses] = useState<LeaderCourse[]>(() => {
    try {
      const raw = localStorage.getItem('leaderCourses');
      return raw ? (JSON.parse(raw) as LeaderCourse[]) : [];
    } catch {
      return [];
    }
  });

  const filteredCourses = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return courses;
    return courses.filter((course) =>
      [course.title, course.level, course.instructor, course.clubName]
        .filter(Boolean)
        .some((item) => item.toLowerCase().includes(search))
    );
  }, [courses, searchTerm]);

  const resetForm = () => {
    setFormState({ title: '', level: '', instructor: '', lessons: '', clubId: '' });
    setFormErrors({});
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};
    if (!formState.title.trim()) nextErrors.title = 'Course title is required.';
    if (!formState.level.trim()) nextErrors.level = 'Course level is required.';
    if (!formState.instructor.trim()) nextErrors.instructor = 'Instructor name is required.';
    if (!formState.clubId) nextErrors.clubId = 'Please select a club.';
    if (!formState.lessons.trim()) nextErrors.lessons = 'Add at least one lesson.';
    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const buildModules = (lessonsInput: string) => {
    const lessons = lessonsInput
      .split('\n')
      .map((lesson) => lesson.trim())
      .filter(Boolean);
    return [
      {
        id: `module-${Date.now()}`,
        title: 'Core Lessons',
        lessons
      }
    ];
  };

  const handleCreateCourse = () => {
    if (availableClubs.length === 0) {
      showToast('Create a club first to add courses.');
      return;
    }
    if (!validateForm()) return;
    const club = availableClubs.find((item: { id: number }) => item.id === Number(formState.clubId));
    const newCourse: LeaderCourse = {
      id: `leader-${Date.now()}`,
      title: formState.title.trim(),
      level: formState.level.trim(),
      instructor: formState.instructor.trim(),
      image: defaultImage,
      modules: buildModules(formState.lessons),
      clubId: Number(formState.clubId),
      clubName: club?.name ?? 'Unknown Club',
      createdAt: new Date().toISOString()
    };
    setCourses((prev) => {
      const next = [newCourse, ...prev];
      localStorage.setItem('leaderCourses', JSON.stringify(next));
      return next;
    });
    addNotification(`Course created: ${newCourse.title}`);
    showToast('Course created.');
    resetForm();
    setShowCreateModal(false);
  };

  const handleDeleteCourse = (courseId: string) => {
    if (!confirm('Delete this course? This cannot be undone.')) return;
    setCourses((prev) => {
      const next = prev.filter((course) => course.id !== courseId);
      localStorage.setItem('leaderCourses', JSON.stringify(next));
      return next;
    });
    addNotification('Course deleted.');
    showToast('Course deleted.');
  };

  const handleUpdateCourse = () => {
    if (!editingCourse) return;
    const club = availableClubs.find((item: { id: number }) => item.id === editingCourse.clubId);
    const updated = {
      ...editingCourse,
      clubName: club?.name ?? editingCourse.clubName
    };
    setCourses((prev) => {
      const next = prev.map((course) => (course.id === updated.id ? updated : course));
      localStorage.setItem('leaderCourses', JSON.stringify(next));
      return next;
    });
    addNotification(`Course updated: ${updated.title}`);
    showToast('Course updated.');
    setEditingCourse(null);
  };

  return (
    <div className="min-h-screen w-full bg-slate-100">
      <div className="flex min-h-screen">
        <LeaderSidebar active="courses" />
        <MobileSidebarDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Leader Menu">
          <LeaderSidebar active="courses" variant="mobile" />
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
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full outline-none"
                  placeholder="Search courses, levels, or clubs..."
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="rounded-lg bg-blue-900 px-3 py-2 text-sm text-white hover:bg-blue-800"
              >
                <span className="inline-flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  New Course
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
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">Courses</h1>
            <p className="text-sm text-slate-500">
              Create and manage courses that your club members can access.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredCourses.map((course) => (
              <div key={course.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-xs text-slate-500">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                    {course.level}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(course.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="mt-3 text-sm font-semibold text-slate-900">{course.title}</h3>
                <p className="mt-1 text-xs text-slate-500">{course.instructor}</p>
                <p className="mt-2 text-xs text-blue-700 font-semibold">{course.clubName}</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                  <Layers className="h-4 w-4 text-blue-600" />
                  {course.modules.reduce((sum, mod) => sum + mod.lessons.length, 0)} lessons
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => setEditingCourse(course)}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600"
                  >
                    <Pencil className="h-3 w-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course.id)}
                    className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs text-rose-700"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {filteredCourses.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
                No courses yet. Create one to get started.
              </div>
            )}
          </div>
        </main>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Create Course</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="text-slate-500 hover:text-slate-700"
              >
                ×
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Club</label>
                <select
                  value={formState.clubId}
                  onChange={(event) => {
                    setFormState({ ...formState, clubId: event.target.value });
                    if (formErrors.clubId) setFormErrors({ ...formErrors, clubId: '' });
                  }}
                  disabled={availableClubs.length === 0}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                    formErrors.clubId ? 'border-red-500' : 'border-slate-300'
                  }`}
                >
                  <option value="">
                    {availableClubs.length === 0 ? 'No clubs created yet' : 'Select a club'}
                  </option>
                  {availableClubs.map((club: { id: number; name: string }) => (
                    <option key={club.id} value={club.id}>
                      {club.name}
                    </option>
                  ))}
                </select>
                {formErrors.clubId && <p className="mt-1 text-xs text-red-600">{formErrors.clubId}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Course Title</label>
                <input
                  type="text"
                  value={formState.title}
                  onChange={(event) => {
                    setFormState({ ...formState, title: event.target.value });
                    if (formErrors.title) setFormErrors({ ...formErrors, title: '' });
                  }}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                    formErrors.title ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
                {formErrors.title && <p className="mt-1 text-xs text-red-600">{formErrors.title}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Course Level</label>
                <input
                  type="text"
                  value={formState.level}
                  onChange={(event) => {
                    setFormState({ ...formState, level: event.target.value });
                    if (formErrors.level) setFormErrors({ ...formErrors, level: '' });
                  }}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                    formErrors.level ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
                {formErrors.level && <p className="mt-1 text-xs text-red-600">{formErrors.level}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Instructor</label>
                <input
                  type="text"
                  value={formState.instructor}
                  onChange={(event) => {
                    setFormState({ ...formState, instructor: event.target.value });
                    if (formErrors.instructor) setFormErrors({ ...formErrors, instructor: '' });
                  }}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                    formErrors.instructor ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
                {formErrors.instructor && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.instructor}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Lessons (one per line)</label>
                <textarea
                  rows={4}
                  value={formState.lessons}
                  onChange={(event) => {
                    setFormState({ ...formState, lessons: event.target.value });
                    if (formErrors.lessons) setFormErrors({ ...formErrors, lessons: '' });
                  }}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                    formErrors.lessons ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
                {formErrors.lessons && <p className="mt-1 text-xs text-red-600">{formErrors.lessons}</p>}
              </div>
            </div>
            <div className="flex items-center gap-3 border-t border-slate-200 px-6 py-4">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCourse}
                className="flex-1 rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Create Course
              </button>
            </div>
          </div>
        </div>
      )}

      {editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Edit Course</h2>
              <button onClick={() => setEditingCourse(null)} className="text-slate-500 hover:text-slate-700">
                ×
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Club</label>
                <select
                  value={editingCourse.clubId}
                  onChange={(event) =>
                    setEditingCourse({ ...editingCourse, clubId: Number(event.target.value) })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                >
                  {availableClubs.map((club: { id: number; name: string }) => (
                    <option key={club.id} value={club.id}>
                      {club.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Course Title</label>
                <input
                  type="text"
                  value={editingCourse.title}
                  onChange={(event) => setEditingCourse({ ...editingCourse, title: event.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Course Level</label>
                <input
                  type="text"
                  value={editingCourse.level}
                  onChange={(event) => setEditingCourse({ ...editingCourse, level: event.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Instructor</label>
                <input
                  type="text"
                  value={editingCourse.instructor}
                  onChange={(event) => setEditingCourse({ ...editingCourse, instructor: event.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Lessons (one per line)</label>
                <textarea
                  rows={4}
                  value={editingCourse.modules[0]?.lessons.join('\n') ?? ''}
                  onChange={(event) =>
                    setEditingCourse({
                      ...editingCourse,
                      modules: buildModules(event.target.value)
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 border-t border-slate-200 px-6 py-4">
              <button
                onClick={() => setEditingCourse(null)}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateCourse}
                className="flex-1 rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
