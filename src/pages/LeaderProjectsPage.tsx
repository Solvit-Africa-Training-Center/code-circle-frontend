import { useEffect, useMemo, useState } from 'react';
import { FolderKanban, Menu, Plus, Search } from 'lucide-react';
import LeaderSidebar from '../components/leader/LeaderSidebar';
import LeaderNotificationsBell from '../components/leader/LeaderNotificationsBell';
import CodeCircleLogo from '@/components/common/CodeCircleLogo';
import MobileSidebarDrawer from '@/components/layout/MobileSidebarDrawer';
import { getAuthUser, getLeaderDisplayName } from '@/utils/authUser';
import { showToast } from '@/utils/toast';
import { useGetClubMembersQuery, useGetCreatorClubsQuery } from '@/features/ClubsApi';
import { useGetCoursesByClubIdsQuery } from '@/features/CoursesApi';
import {
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useGetProjectTeamsQuery,
  useGetProjectsByCourseQuery,
  usePublishProjectMutation,
  useUpdateProjectMutation,
  type Project,
  type ProjectType,
} from '@/features/ProjectsApi';

type ProjectForm = {
  title: string;
  description: string;
  requirements: string;
  type: ProjectType;
};

const initialForm: ProjectForm = {
  title: '',
  description: '',
  requirements: '',
  type: 'individual',
};

export default function LeaderProjectsPage() {
  const leaderName = getLeaderDisplayName();
  const creatorId = getAuthUser()?.id ?? '';
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState<ProjectForm>(initialForm);

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
  const { data: projects = [], refetch: refetchProjects } = useGetProjectsByCourseQuery(selectedCourseId, {
    skip: !selectedCourseId,
  });
  const {
    data: teams = [],
    isLoading: loadingTeams,
    isFetching: fetchingTeams,
    isError: isTeamsError,
    error: teamsError,
    refetch: refetchTeams,
  } = useGetProjectTeamsQuery(selectedProjectId ?? '', {
    skip: !selectedProjectId,
  });

  const [createProject] = useCreateProjectMutation();
  const [updateProject] = useUpdateProjectMutation();
  const [publishProject] = usePublishProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();

  useEffect(() => {
    if (!selectedCourseId && courses.length > 0) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses, selectedCourseId]);

  const filteredProjects = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((project) =>
      [project.title, project.description, project.requirements, project.status]
        .filter(Boolean)
        .some((item) => item.toLowerCase().includes(q)),
    );
  }, [projects, searchTerm]);
  const memberByUserId = useMemo(
    () =>
      selectedClubMembers.reduce<Record<string, { fullName: string; email: string }>>((acc, member) => {
        acc[member.userId] = { fullName: member.fullName, email: member.email };
        return acc;
      }, {}),
    [selectedClubMembers]
  );
  const visibleTeams = useMemo(() => teams, [teams]);

  const resetForm = () => setForm(initialForm);

  const openCreate = () => {
    setEditing(null);
    resetForm();
    setCreateOpen(true);
  };

  const openEdit = (project: Project) => {
    setEditing(project);
    setForm({
      title: project.title,
      description: project.description,
      requirements: project.requirements,
      type: project.type,
    });
    setCreateOpen(true);
  };

  const submitForm = async () => {
    if (!selectedCourseId) {
      showToast('Select a course first.');
      return;
    }
    if (form.title.trim().length < 3) {
      showToast('Project title must be at least 3 characters.');
      return;
    }
    if (!form.description.trim()) {
      showToast('Project description is required.');
      return;
    }

    const payload = {
      courseId: selectedCourseId,
      title: form.title.trim(),
      description: form.description.trim(),
      requirements: form.requirements.trim() || form.description.trim(),
      type: form.type,
      minTeamSize: form.type === 'group' ? 2 : 1,
      maxTeamSize: form.type === 'group' ? 5 : 1,
    };

    try {
      if (editing) {
        await updateProject({
          projectId: editing.id,
          courseId: selectedCourseId,
          body: payload,
        }).unwrap();
        showToast('Project updated.');
      } else {
        await createProject(payload).unwrap();
        showToast('Project created.');
      }
      setCreateOpen(false);
      setEditing(null);
      resetForm();
      await refetchProjects();
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
        <LeaderSidebar active="projects" />
        <MobileSidebarDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Leader Menu">
          <LeaderSidebar active="projects" variant="mobile" />
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
                  placeholder="Search projects..."
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
                  New Project
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
                setSelectedProjectId(null);
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
              {filteredProjects.map((project) => (
                <div key={project.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{project.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{project.description}</p>
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">{project.status}</span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-slate-200 px-2 py-1 text-[11px] text-slate-600">
                      {project.type}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => openEdit(project)}
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700"
                    >
                      Edit
                    </button>
                    {project.status === 'draft' && (
                      <button
                        onClick={async () => {
                          try {
                            await publishProject({ projectId: project.id, courseId: selectedCourseId }).unwrap();
                            showToast('Project published.');
                            await refetchProjects();
                          } catch {
                            showToast('Failed to publish project.');
                          }
                        }}
                        className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700"
                      >
                        Publish
                      </button>
                    )}
                    <button
                      onClick={() => {
                        const nextId = selectedProjectId === project.id ? null : project.id;
                        setSelectedProjectId(nextId);
                        if (nextId) {
                          setTimeout(() => {
                            refetchTeams();
                          }, 0);
                        }
                      }}
                      className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs text-blue-700"
                    >
                      Submissions
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm('Delete this project?')) return;
                        try {
                          await deleteProject({ projectId: project.id, courseId: selectedCourseId }).unwrap();
                          showToast('Project deleted.');
                          await refetchProjects();
                          if (selectedProjectId === project.id) setSelectedProjectId(null);
                        } catch {
                          showToast('Failed to delete project.');
                        }
                      }}
                      className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs text-rose-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {filteredProjects.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
                  {selectedCourseId ? 'No projects yet for this course.' : 'Select a course to manage projects.'}
                </div>
              )}
            </section>

            <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Submissions</h3>
                <FolderKanban className="h-4 w-4 text-blue-600" />
              </div>
              <div className="mt-3 space-y-2">
                {!selectedProjectId && (
                  <p className="text-xs text-slate-500">Select a project to view member submissions.</p>
                )}
                {selectedProjectId && (loadingTeams || fetchingTeams) && (
                  <p className="text-xs text-slate-500">Loading submissions from backend...</p>
                )}
                {selectedProjectId && isTeamsError && (
                  <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                    Failed to load project submissions from backend.
                    <p className="mt-1 text-[11px] text-rose-600">
                      {(() => {
                        const err = teamsError as { status?: number; data?: { message?: string | string[] } };
                        const raw = err?.data?.message;
                        const msg = Array.isArray(raw) ? raw.join(', ') : raw;
                        return msg || (err?.status ? `HTTP ${err.status}` : 'Unknown error');
                      })()}
                    </p>
                    <button
                      onClick={() => refetchTeams()}
                      className="mt-2 rounded-full border border-rose-300 px-3 py-1 text-[11px] font-semibold"
                    >
                      Retry
                    </button>
                  </div>
                )}
                {selectedProjectId && !isTeamsError && !loadingTeams && !fetchingTeams && visibleTeams.length === 0 && (
                  <p className="text-xs text-slate-500">No member submissions yet.</p>
                )}
                {selectedProjectId && !isTeamsError &&
                  visibleTeams.map((team) => (
                    <div key={team.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs font-semibold text-slate-700">{team.name}</p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        Submitted by:{' '}
                        {team.members
                          .map((member) => memberByUserId[member.userId]?.fullName ?? member.userId)
                          .join(', ') || 'Unknown member'}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        Emails:{' '}
                        {team.members
                          .map((member) => memberByUserId[member.userId]?.email ?? '')
                          .filter(Boolean)
                          .join(', ') || 'No email'}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 line-clamp-2">{team.submissionContent || 'No content'}</p>
                      {team.submissionAttachments && team.submissionAttachments.length > 0 && (
                        <div className="mt-1 space-y-1">
                          {team.submissionAttachments.map((link, index) => (
                            <p key={`${team.id}-attachment-${index}`} className="text-xs">
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
                      <p className="mt-1 text-[11px] text-slate-400">Status: {team.status}</p>
                    </div>
                  ))}
              </div>
            </aside>
          </div>
        </main>
      </div>

      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">
              {editing ? 'Edit Project' : 'Create Project'}
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
                value={form.requirements}
                onChange={(event) => setForm((prev) => ({ ...prev, requirements: event.target.value }))}
                placeholder="Requirements"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                rows={3}
              />
              <select
                value={form.type}
                onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value as ProjectType }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="individual">Individual</option>
                <option value="group">Group</option>
              </select>
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
                {editing ? 'Save Changes' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
