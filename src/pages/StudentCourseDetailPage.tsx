import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, Layers, Menu } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import StudentSidebar from '@/components/student/StudentSidebar';
import MobileSidebarDrawer from '@/components/layout/MobileSidebarDrawer';
import { useGetCourseByIdQuery } from '@/features/CoursesApi';
import {
  useCreateAssignmentSubmissionMutation,
  useGetAssignmentsByCourseQuery,
  useSubmitAssignmentSubmissionMutation,
} from '@/features/AssignmentsApi';
import {
  useCreateProjectTeamMutation,
  useGetMyProjectTeamsQuery,
  useGetProjectsByCourseQuery,
  useSubmitProjectTeamMutation,
} from '@/features/ProjectsApi';
import { useGetUserMembershipsQuery } from '@/features/UsersApi';
import { showToast } from '@/utils/toast';
import { computeCourseProgress } from '@/utils/courseProgress';

type CourseProgress = {
  completedLessons: string[];
  currentLesson?: string;
  completedAssignmentIds?: string[];
  completedProjectIds?: string[];
  requiredAssignments?: number;
  requiredProjects?: number;
  isCompleted?: boolean;
};

const loadSubmittedIds = (key: string): Set<string> => {
  try {
    const raw = localStorage.getItem(key);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set<string>();
  }
};

export default function StudentCourseDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data: course, isLoading } = useGetCourseByIdQuery(id, { skip: !id });
  const { data: assignments = [] } = useGetAssignmentsByCourseQuery(id, { skip: !id });
  const { data: projects = [] } = useGetProjectsByCourseQuery(id, { skip: !id });
  const { data: myTeams = [], refetch: refetchMyTeams } = useGetMyProjectTeamsQuery();
  const [createAssignmentSubmission] = useCreateAssignmentSubmissionMutation();
  const [submitAssignmentSubmission] = useSubmitAssignmentSubmissionMutation();
  const [createProjectTeam] = useCreateProjectTeamMutation();
  const [submitProjectTeam] = useSubmitProjectTeamMutation();
  const [assignmentDrafts, setAssignmentDrafts] = useState<Record<string, { content: string; link: string }>>({});
  const [projectDrafts, setProjectDrafts] = useState<Record<string, { content: string; link: string }>>({});

  const authUser = useMemo(() => {
    try {
      const raw = localStorage.getItem('authUser');
      return raw ? (JSON.parse(raw) as { id?: string; email?: string }) : {};
    } catch {
      return {};
    }
  }, []);

  const { data: memberships = [] } = useGetUserMembershipsQuery(authUser.id ?? '', {
    skip: !authUser.id,
  });

  const storageKey = useMemo(
    () => `studentCourseProgress:${authUser.email ?? 'anonymous'}`,
    [authUser.email],
  );
  const joinedClubIds = useMemo(() => {
    const fromMemberships = memberships
      .filter((membership) => membership.status === 'active' && membership.clubId)
      .map((membership) => String(membership.clubId));
    if (fromMemberships.length > 0) {
      return Array.from(new Set(fromMemberships));
    }
    try {
      const raw = localStorage.getItem('studentJoinedClubs');
      return raw ? (JSON.parse(raw) as Array<number | string>).map((clubId) => String(clubId)) : [];
    } catch {
      return [];
    }
  }, [memberships]);

  const [progress, setProgress] = useState<CourseProgress>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      const all = raw ? (JSON.parse(raw) as Record<string, CourseProgress>) : {};
      return all[id] ?? { completedLessons: [] };
    } catch {
      return { completedLessons: [] };
    }
  });

  const allLessons = useMemo(() => {
    if (!course) return [] as Array<{ key: string; title: string; moduleTitle: string }>;
    return (course.modules ?? []).flatMap((mod) =>
      (mod.lessons ?? []).map((lesson) => ({
        key: lesson.id,
        title: lesson.title,
        moduleTitle: mod.title,
      })),
    );
  }, [course]);
  const canAccessCourse = useMemo(() => {
    if (!course) return false;
    return course.status === 'published' && joinedClubIds.includes(String(course.clubId));
  }, [course, joinedClubIds]);

  const visibleAssignments = useMemo(
    () => assignments.filter((assignment) => assignment.status === 'published'),
    [assignments],
  );

  const visibleProjects = useMemo(
    () => projects.filter((project) => project.status === 'active'),
    [projects],
  );
  const [submittedAssignmentIds, setSubmittedAssignmentIds] = useState<Set<string>>(() =>
    loadSubmittedIds(`studentSubmittedAssignments:${authUser.email ?? 'anonymous'}`)
  );
  const [submittedProjectIds, setSubmittedProjectIds] = useState<Set<string>>(() =>
    loadSubmittedIds(`studentSubmittedProjects:${authUser.email ?? 'anonymous'}`)
  );
  const submittedAssignmentsForCourse = useMemo(
    () => visibleAssignments.filter((assignment) => submittedAssignmentIds.has(assignment.id)).length,
    [visibleAssignments, submittedAssignmentIds],
  );
  const submittedProjectsForCourse = useMemo(
    () => visibleProjects.filter((project) => submittedProjectIds.has(project.id)).length,
    [visibleProjects, submittedProjectIds],
  );

  const currentLesson = useMemo(() => {
    if (!course) return '';
    if (progress.currentLesson) return progress.currentLesson;
    return allLessons[0]?.key ?? '';
  }, [course, progress.currentLesson, allLessons]);

  const currentLessonData = useMemo(() => {
    if (!course || !currentLesson) return undefined;
    for (const mod of course.modules ?? []) {
      const found = (mod.lessons ?? []).find((lesson) => lesson.id === currentLesson);
      if (found) return found;
    }
    return undefined;
  }, [course, currentLesson]);

  const currentIndex = allLessons.findIndex((lesson) => lesson.key === currentLesson);
  const completedLessonCount = progress.completedLessons.length;
  const progressMetrics = useMemo(
    () =>
      computeCourseProgress({
        lessonTotal: allLessons.length,
        completedLessons: completedLessonCount,
        requiredAssignments: visibleAssignments.length,
        completedAssignments: submittedAssignmentsForCourse,
        requiredProjects: visibleProjects.length,
        completedProjects: submittedProjectsForCourse,
      }),
    [
      allLessons.length,
      completedLessonCount,
      visibleAssignments.length,
      submittedAssignmentsForCourse,
      visibleProjects.length,
      submittedProjectsForCourse,
    ],
  );
  const percent = progressMetrics.percent;
  const isCourseCompleted = progressMetrics.isCompleted;

  const updateProgress = (next: CourseProgress) => {
    setProgress(next);
    try {
      const raw = localStorage.getItem(storageKey);
      const all = raw ? (JSON.parse(raw) as Record<string, CourseProgress>) : {};
      if (id) {
        all[id] = next;
        localStorage.setItem(storageKey, JSON.stringify(all));
      }
    } catch {
      // keep UI responsive if localStorage fails
    }
  };

  useEffect(() => {
    if (!id) return;
    try {
      const raw = localStorage.getItem(storageKey);
      const all = raw ? (JSON.parse(raw) as Record<string, CourseProgress>) : {};
      const existing = all[id] ?? { completedLessons: [] };
      all[id] = {
        ...existing,
        ...progress,
        completedAssignmentIds: visibleAssignments
          .filter((assignment) => submittedAssignmentIds.has(assignment.id))
          .map((assignment) => assignment.id),
        completedProjectIds: visibleProjects
          .filter((project) => submittedProjectIds.has(project.id))
          .map((project) => project.id),
        requiredAssignments: visibleAssignments.length,
        requiredProjects: visibleProjects.length,
        isCompleted: isCourseCompleted,
      };
      localStorage.setItem(storageKey, JSON.stringify(all));
    } catch {
      // keep UI responsive if localStorage fails
    }
  }, [
    id,
    storageKey,
    progress,
    visibleAssignments,
    visibleProjects,
    submittedAssignmentIds,
    submittedProjectIds,
    isCourseCompleted,
  ]);

  const handleMarkComplete = () => {
    if (!currentLesson) return;
    const nextCompleted = Array.from(new Set([...progress.completedLessons, currentLesson]));
    const nextLesson = allLessons[Math.min(allLessons.length - 1, Math.max(0, currentIndex + 1))]?.key ?? currentLesson;
    updateProgress({ ...progress, completedLessons: nextCompleted, currentLesson: nextLesson });
  };

  const goToLesson = (lessonId: string) => {
    updateProgress({ ...progress, currentLesson: lessonId });
  };

  const rememberSubmittedItem = (
    storageKeyName: string,
    itemId: string,
    updateState: Dispatch<SetStateAction<Set<string>>>,
  ) => {
    try {
      const key = `${storageKeyName}:${authUser.email ?? 'anonymous'}`;
      const raw = localStorage.getItem(key);
      const parsed = raw ? (JSON.parse(raw) as string[]) : [];
      const next = parsed.includes(itemId) ? parsed : [...parsed, itemId];
      localStorage.setItem(key, JSON.stringify(next));
      updateState(new Set(next));
    } catch {
      // no-op for local cache
    }
  };

  const submitAssignment = async (assignmentId: string) => {
    const draft = assignmentDrafts[assignmentId];
    const content = draft?.content?.trim() ?? '';
    const link = draft?.link?.trim() ?? '';
    if (!content && !link) {
      showToast('Add submission text or link first.');
      return;
    }
    try {
      const created = await createAssignmentSubmission({
        assignmentId,
        content: content || 'Submitted from member dashboard',
        repositoryUrl: link || undefined,
        attachments: link ? [link] : undefined,
      }).unwrap();
      await submitAssignmentSubmission({
        submissionId: created.id,
        assignmentId,
      }).unwrap();
      rememberSubmittedItem(
        'studentSubmittedAssignments',
        assignmentId,
        setSubmittedAssignmentIds,
      );
      setAssignmentDrafts((prev) => ({ ...prev, [assignmentId]: { content: '', link: '' } }));
      showToast('Assignment submitted successfully.');
    } catch (error) {
      const apiError = error as { data?: { message?: string | string[] } };
      const rawMessage = apiError?.data?.message;
      const message = Array.isArray(rawMessage) ? rawMessage.join(', ') : rawMessage || 'Failed to submit assignment';
      showToast(message);
    }
  };

  const submitProject = async (projectId: string) => {
    const draft = projectDrafts[projectId];
    const content = draft?.content?.trim() ?? '';
    const link = draft?.link?.trim() ?? '';
    if (!content && !link) {
      showToast('Add submission details first.');
      return;
    }
    try {
      const existingTeam = myTeams.find((team) => team.projectId === projectId);
      const team = existingTeam ?? await createProjectTeam({
        projectId,
        name: `${authUser.email?.split('@')[0] ?? 'Member'} Team`,
        description: 'Auto-created team submission',
      }).unwrap();

      await submitProjectTeam({
        teamId: team.id,
        projectId,
        submissionContent: content || 'Project submission',
        submissionAttachments: link ? [link] : undefined,
        repositoryUrl: link || undefined,
      }).unwrap();
      await refetchMyTeams();
      rememberSubmittedItem(
        'studentSubmittedProjects',
        projectId,
        setSubmittedProjectIds,
      );
      setProjectDrafts((prev) => ({ ...prev, [projectId]: { content: '', link: '' } }));
      showToast('Project submitted successfully.');
    } catch (error) {
      const apiError = error as { data?: { message?: string | string[] } };
      const rawMessage = apiError?.data?.message;
      const message = Array.isArray(rawMessage) ? rawMessage.join(', ') : rawMessage || 'Failed to submit project';
      showToast(message);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-slate-100">
        <div className="flex min-h-screen">
          <StudentSidebar />
          <MobileSidebarDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Student Menu">
            <StudentSidebar variant="mobile" />
          </MobileSidebarDrawer>
          <main className="flex-1 px-5 py-12 lg:px-8 lg:ml-64">
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
              Loading course...
            </div>
          </main>
        </div>
      </div>
    );
  }

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
              <p className="text-sm text-slate-600 mt-2">Choose a course from your catalog.</p>
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

  if (!canAccessCourse) {
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
              <h1 className="text-2xl font-semibold text-slate-900">Course unavailable</h1>
              <p className="text-sm text-slate-600 mt-2">
                This course is only visible when it is published and you have joined its club.
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
              <p className="text-slate-500">Course Progress</p>
              <p className="text-lg font-semibold text-slate-900">{percent}%</p>
              <p className={`mt-1 text-[11px] font-semibold ${isCourseCompleted ? 'text-emerald-700' : 'text-slate-500'}`}>
                {isCourseCompleted ? 'Course Completed' : 'In progress'}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Assignments submitted: {submittedAssignmentsForCourse}
              </p>
              <p className="text-[11px] text-slate-500">
                Projects submitted: {submittedProjectsForCourse}
              </p>
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
                  {allLessons.find((lesson) => lesson.key === currentLesson)?.title || 'Select a lesson'}
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  {course.description}
                </p>
                <div className="mt-4 space-y-3">
                  {(currentLessonData?.contents ?? []).map((content, index) => (
                    <div key={`${content.type}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">{content.type}</p>
                      {content.type === 'text' && content.content && (
                        <p className="text-sm text-slate-700 mt-2 whitespace-pre-wrap">{content.content}</p>
                      )}
                      {(content.type === 'video' || content.type === 'file') && content.url && (
                        <a href={content.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-xs font-semibold text-blue-700 underline">
                          {content.type === 'video' ? 'Open video resource' : 'Open file resource'}
                        </a>
                      )}
                      {content.type === 'external_link' && (content.linkUrl || content.url) && (
                        <a
                          href={content.linkUrl || content.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex text-xs font-semibold text-blue-700 underline"
                        >
                          {content.linkTitle || 'Open resource link'}
                        </a>
                      )}
                    </div>
                  ))}
                  {(currentLessonData?.contents ?? []).length === 0 && (
                    <p className="text-xs text-slate-500">No lesson resource attached yet.</p>
                  )}
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={() => goToLesson(allLessons[Math.max(0, currentIndex - 1)]?.key)}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    disabled={currentIndex <= 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </button>
                  <button
                    onClick={() => goToLesson(allLessons[Math.min(allLessons.length - 1, currentIndex + 1)]?.key)}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    disabled={currentIndex < 0 || currentIndex >= allLessons.length - 1}
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
                {(course.modules ?? []).map((mod) => (
                  <div key={mod.id} className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-sm font-semibold text-slate-900">{mod.title}</p>
                    <div className="mt-3 space-y-2">
                      {(mod.lessons ?? []).map((lesson) => {
                        const lessonId = lesson.id;
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
                            {lesson.title}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-3xl bg-white border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900">Published Assignments</h2>
              <div className="mt-4 space-y-3">
                {visibleAssignments.map((assignment) => (
                  <div key={assignment.id} className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-sm font-semibold text-slate-900">{assignment.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{assignment.description}</p>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-blue-600 mt-2">{assignment.type}</p>
                    <textarea
                      value={assignmentDrafts[assignment.id]?.content ?? ''}
                      onChange={(event) =>
                        setAssignmentDrafts((prev) => ({
                          ...prev,
                          [assignment.id]: { ...(prev[assignment.id] ?? { content: '', link: '' }), content: event.target.value },
                        }))
                      }
                      rows={3}
                      placeholder="Write your assignment submission..."
                      className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-700"
                    />
                    <input
                      value={assignmentDrafts[assignment.id]?.link ?? ''}
                      onChange={(event) =>
                        setAssignmentDrafts((prev) => ({
                          ...prev,
                          [assignment.id]: { ...(prev[assignment.id] ?? { content: '', link: '' }), link: event.target.value },
                        }))
                      }
                      placeholder="Repository or file URL"
                      className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-700"
                    />
                    <div className="mt-3 flex items-center justify-between">
                      <button
                        onClick={() => submitAssignment(assignment.id)}
                        disabled={submittedAssignmentIds.has(assignment.id)}
                        className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
                          submittedAssignmentIds.has(assignment.id)
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-blue-900 text-white hover:bg-blue-700'
                        }`}
                      >
                        {submittedAssignmentIds.has(assignment.id) ? 'Submitted' : 'Submit Assignment'}
                      </button>
                      {submittedAssignmentIds.has(assignment.id) && (
                        <span className="text-[11px] font-semibold text-emerald-700">Submitted</span>
                      )}
                    </div>
                  </div>
                ))}
                {visibleAssignments.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                    No published assignments yet.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl bg-white border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900">Active Projects</h2>
              <div className="mt-4 space-y-3">
                {visibleProjects.map((project) => (
                  <div key={project.id} className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-sm font-semibold text-slate-900">{project.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{project.description}</p>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-blue-600 mt-2">{project.type}</p>
                    <textarea
                      value={projectDrafts[project.id]?.content ?? ''}
                      onChange={(event) =>
                        setProjectDrafts((prev) => ({
                          ...prev,
                          [project.id]: { ...(prev[project.id] ?? { content: '', link: '' }), content: event.target.value },
                        }))
                      }
                      rows={3}
                      placeholder="Write your project submission summary..."
                      className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-700"
                    />
                    <input
                      value={projectDrafts[project.id]?.link ?? ''}
                      onChange={(event) =>
                        setProjectDrafts((prev) => ({
                          ...prev,
                          [project.id]: { ...(prev[project.id] ?? { content: '', link: '' }), link: event.target.value },
                        }))
                      }
                      placeholder="Repository/demo/file URL"
                      className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-700"
                    />
                    <div className="mt-3 flex items-center justify-between">
                      <button
                        onClick={() => submitProject(project.id)}
                        disabled={submittedProjectIds.has(project.id)}
                        className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
                          submittedProjectIds.has(project.id)
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-blue-900 text-white hover:bg-blue-700'
                        }`}
                      >
                        {submittedProjectIds.has(project.id) ? 'Submitted' : 'Submit Project'}
                      </button>
                      {submittedProjectIds.has(project.id) && (
                        <span className="text-[11px] font-semibold text-emerald-700">Submitted</span>
                      )}
                    </div>
                  </div>
                ))}
                {visibleProjects.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                    No active projects yet.
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
