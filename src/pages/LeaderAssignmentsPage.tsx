import { useEffect, useMemo, useState } from 'react';
import { ClipboardCheck, Menu, Plus, Search } from 'lucide-react';
import LeaderSidebar from '../components/leader/LeaderSidebar';
import LeaderNotificationsBell from '../components/leader/LeaderNotificationsBell';
import CodeCircleLogo from '@/components/common/CodeCircleLogo';
import MobileSidebarDrawer from '@/components/layout/MobileSidebarDrawer';
import { getAuthUser, getLeaderDisplayName } from '@/utils/authUser';
import { showToast } from '@/utils/toast';
import { useGetClubMembersQuery, useGetCreatorClubsQuery } from '@/features/ClubsApi';
import { useGetCoursesByClubIdsQuery } from '@/features/CoursesApi';
import { useGetUsersByIdsQuery } from '@/features/UsersApi';
import {
  useCreateAssignmentMutation,
  useDeleteAssignmentMutation,
  useGetAssignmentSubmissionsQuery,
  useGetAssignmentsByCourseQuery,
  usePublishAssignmentMutation,
  useUpdateAssignmentMutation,
  type Assignment,
  type AssignmentType,
} from '@/features/AssignmentsApi';

type AssignmentForm = {
  title: string;
  description: string;
  instructions: string;
  dueDate: string;
  type: AssignmentType;
};

const initialForm: AssignmentForm = {
  title: '',
  description: '',
  instructions: '',
  dueDate: '',
  type: 'individual',
};

export default function LeaderAssignmentsPage() {
  const leaderName = getLeaderDisplayName();
  const creatorId = getAuthUser()?.id ?? '';
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Assignment | null>(null);
  const [form, setForm] = useState<AssignmentForm>(initialForm);

  const { data: clubs = [] } = useGetCreatorClubsQuery(creatorId, { skip: !creatorId });
  const clubIds = useMemo(() => clubs.map((club) => club.id), [clubs]);
  const { data: courses = [] } = useGetCoursesByClubIdsQuery(clubIds, { skip: clubIds.length === 0 });
  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === selectedCourseId),
    [courses, selectedCourseId]
  );
  const { data: selectedClubMembers = [] } = useGetClubMembersQuery(selectedCourse?.clubId ?? '', {
    skip: !selectedCourse?.clubId,
  });
  const { data: assignments = [], refetch: refetchAssignments } = useGetAssignmentsByCourseQuery(
    selectedCourseId,
    { skip: !selectedCourseId },
  );
  const {
    data: submissions = [],
    isLoading: loadingSubmissions,
    isFetching: fetchingSubmissions,
    isError: isSubmissionsError,
    error: submissionsError,
    refetch: refetchSubmissions,
  } = useGetAssignmentSubmissionsQuery(selectedAssignmentId ?? '', {
    skip: !selectedAssignmentId,
  });

  const [createAssignment] = useCreateAssignmentMutation();
  const [updateAssignment] = useUpdateAssignmentMutation();
  const [publishAssignment] = usePublishAssignmentMutation();
  const [deleteAssignment] = useDeleteAssignmentMutation();

  useEffect(() => {
    if (!selectedCourseId && courses.length > 0) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses, selectedCourseId]);

  const filteredAssignments = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return assignments;
    return assignments.filter((assignment) =>
      [assignment.title, assignment.description, assignment.instructions, assignment.status]
        .filter(Boolean)
        .some((item) => item.toLowerCase().includes(q)),
    );
  }, [assignments, searchTerm]);
  const memberByUserId = useMemo(
    () =>
      selectedClubMembers.reduce<Record<string, { fullName: string; email: string }>>((acc, member) => {
        acc[member.userId] = { fullName: member.fullName, email: member.email };
        return acc;
      }, {}),
    [selectedClubMembers]
  );
  const visibleSubmissions = useMemo(() => {
    const submittedFirst = [...submissions].sort((a, b) => {
      if (a.status === 'submitted' && b.status !== 'submitted') return -1;
      if (a.status !== 'submitted' && b.status === 'submitted') return 1;
      return 0;
    });
    return submittedFirst;
  }, [submissions]);
  const submissionUserIds = useMemo(
    () => Array.from(new Set(visibleSubmissions.map((submission) => submission.userId))),
    [visibleSubmissions]
  );
  const { data: usersById = {} } = useGetUsersByIdsQuery(submissionUserIds, {
    skip: submissionUserIds.length === 0,
  });

  const resetForm = () => setForm(initialForm);

  const openCreate = () => {
    resetForm();
    setEditing(null);
    setCreateOpen(true);
  };

  const openEdit = (assignment: Assignment) => {
    setEditing(assignment);
    setForm({
      title: assignment.title,
      description: assignment.description,
      instructions: assignment.instructions,
      dueDate: assignment.dueDate ? assignment.dueDate.slice(0, 10) : '',
      type: assignment.type,
    });
    setCreateOpen(true);
  };

  const submitForm = async () => {
    if (!selectedCourseId) {
      showToast('Select a course first.');
      return;
    }
    if (form.title.trim().length < 3) {
      showToast('Assignment title must be at least 3 characters.');
      return;
    }
    if (!form.description.trim()) {
      showToast('Assignment description is required.');
      return;
    }

    const payload = {
      courseId: selectedCourseId,
      title: form.title.trim(),
      description: form.description.trim(),
      instructions: form.instructions.trim() || form.description.trim(),
      type: form.type,
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
    };

    try {
      if (editing) {
        await updateAssignment({
          assignmentId: editing.id,
          courseId: selectedCourseId,
          body: payload,
        }).unwrap();
        showToast('Assignment updated.');
      } else {
        await createAssignment(payload).unwrap();
        showToast('Assignment created.');
      }
      setCreateOpen(false);
      setEditing(null);
      resetForm();
      await refetchAssignments();
    } catch (error) {
      const apiError = error as { data?: { message?: string | string[] } };
      const rawMessage = apiError?.data?.message;
      const message = Array.isArray(rawMessage) ? rawMessage.join(', ') : rawMessage || 'Operation failed';
      showToast(message);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-100">
      <div className="flex min-h-screen">
        <LeaderSidebar active="assignments" />
        <MobileSidebarDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Leader Menu">
          <LeaderSidebar active="assignments" variant="mobile" />
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
              <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full outline-none"
                  placeholder="Search assignments..."
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={openCreate}
                disabled={!selectedCourseId}
                className="rounded-lg bg-blue-900 px-3 py-2 text-sm text-white hover:bg-blue-800 disabled:opacity-50"
              >
                <span className="inline-flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  New Assignment
                </span>
              </button>
              <LeaderNotificationsBell />
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2">
                <div className="h-7 w-7 rounded-full bg-slate-200" />
                <div className="text-xs">
                  <p className="font-medium text-slate-700">{leaderName}</p>
                  <p className="text-slate-400">Leader</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Course</p>
            <select
              value={selectedCourseId}
              onChange={(event) => {
                setSelectedCourseId(event.target.value);
                setSelectedAssignmentId(null);
              }}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Select course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
            <section className="space-y-3">
              {filteredAssignments.map((assignment) => (
                <div key={assignment.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{assignment.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{assignment.description}</p>
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">{assignment.status}</span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-slate-200 px-2 py-1 text-[11px] text-slate-600">
                      {assignment.type}
                    </span>
                    {assignment.dueDate && (
                      <span className="rounded-full border border-slate-200 px-2 py-1 text-[11px] text-slate-600">
                        Due {new Date(assignment.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => openEdit(assignment)}
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700"
                    >
                      Edit
                    </button>
                    {assignment.status === 'draft' && (
                      <button
                        onClick={async () => {
                          try {
                            await publishAssignment({ assignmentId: assignment.id, courseId: selectedCourseId }).unwrap();
                            showToast('Assignment published.');
                            await refetchAssignments();
                          } catch {
                            showToast('Failed to publish assignment.');
                          }
                        }}
                        className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700"
                      >
                        Publish
                      </button>
                    )}
                    <button
                      onClick={() => {
                        const nextId = selectedAssignmentId === assignment.id ? null : assignment.id;
                        setSelectedAssignmentId(nextId);
                        if (nextId) {
                          setTimeout(() => {
                            refetchSubmissions();
                          }, 0);
                        }
                      }}
                      className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs text-blue-700"
                    >
                      Submissions
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm('Delete this assignment?')) return;
                        try {
                          await deleteAssignment({ assignmentId: assignment.id, courseId: selectedCourseId }).unwrap();
                          showToast('Assignment deleted.');
                          await refetchAssignments();
                          if (selectedAssignmentId === assignment.id) setSelectedAssignmentId(null);
                        } catch {
                          showToast('Failed to delete assignment.');
                        }
                      }}
                      className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs text-rose-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {filteredAssignments.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
                  {selectedCourseId ? 'No assignments yet for this course.' : 'Select a course to manage assignments.'}
                </div>
              )}
            </section>

            <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Submissions</h3>
                <ClipboardCheck className="h-4 w-4 text-blue-600" />
              </div>
              <div className="mt-3 space-y-2">
                {!selectedAssignmentId && (
                  <p className="text-xs text-slate-500">Select an assignment to view member submissions.</p>
                )}
                {selectedAssignmentId && (loadingSubmissions || fetchingSubmissions) && (
                  <p className="text-xs text-slate-500">Loading submissions from backend...</p>
                )}
                {selectedAssignmentId && isSubmissionsError && (
                  <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                    Failed to load submissions from backend.
                    <p className="mt-1 text-[11px] text-rose-600">
                      {(() => {
                        const err = submissionsError as { status?: number; data?: { message?: string | string[] } };
                        const raw = err?.data?.message;
                        const msg = Array.isArray(raw) ? raw.join(', ') : raw;
                        return msg || (err?.status ? `HTTP ${err.status}` : 'Unknown error');
                      })()}
                    </p>
                    <button
                      onClick={() => refetchSubmissions()}
                      className="mt-2 rounded-full border border-rose-300 px-3 py-1 text-[11px] font-semibold"
                    >
                      Retry
                    </button>
                  </div>
                )}
                {selectedAssignmentId && !isSubmissionsError && !loadingSubmissions && !fetchingSubmissions && visibleSubmissions.length === 0 && (
                  <p className="text-xs text-slate-500">No member submissions yet.</p>
                )}
                {selectedAssignmentId && !isSubmissionsError &&
                  visibleSubmissions.map((submission) => {
                    const member = memberByUserId[submission.userId];
                    const user = usersById[submission.userId];
                    const memberName = user?.name || member?.fullName || submission.userId;
                    const memberEmail = user?.email || member?.email || 'No email';
                    return (
                    <div key={submission.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs font-semibold text-slate-700">
                        Member: {memberName}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-500">{memberEmail}</p>
                      <p className="mt-1 text-xs text-slate-500 line-clamp-2">{submission.content || 'No content'}</p>
                      {submission.repositoryUrl && (
                        <p className="mt-1 text-xs">
                          <a
                            href={submission.repositoryUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-700 underline break-all"
                          >
                            Repository Link
                          </a>
                        </p>
                      )}
                      {submission.attachments && submission.attachments.length > 0 && (
                        <div className="mt-1 space-y-1">
                          {submission.attachments.map((link, index) => (
                            <p key={`${submission.id}-attachment-${index}`} className="text-xs">
                              <a
                                href={link}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-700 underline break-all"
                              >
                                Attachment {index + 1}
                              </a>
                            </p>
                          ))}
                        </div>
                      )}
                      <p className="mt-1 text-[11px] text-slate-400">Status: {submission.status}</p>
                    </div>
                  )})}
              </div>
            </aside>
          </div>
        </main>
      </div>

      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">
              {editing ? 'Edit Assignment' : 'Create Assignment'}
            </h2>
            <div className="mt-4 space-y-3">
              <input
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Title"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <textarea
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Description"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                rows={3}
              />
              <textarea
                value={form.instructions}
                onChange={(event) => setForm((prev) => ({ ...prev, instructions: event.target.value }))}
                placeholder="Instructions"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                rows={3}
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={form.type}
                  onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value as AssignmentType }))}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="individual">Individual</option>
                  <option value="group">Group</option>
                </select>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(event) => setForm((prev) => ({ ...prev, dueDate: event.target.value }))}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  setCreateOpen(false);
                  setEditing(null);
                  resetForm();
                }}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button onClick={submitForm} className="flex-1 rounded-lg bg-blue-900 px-4 py-2 text-sm text-white">
                {editing ? 'Save Changes' : 'Create Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
