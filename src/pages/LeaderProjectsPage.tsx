import { useMemo, useState } from 'react';
import { CalendarCheck, FolderKanban, Plus, Search, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LeaderSidebar from '../components/leader/LeaderSidebar';
import { clubs as baseClubs } from '@/data/clubs';
import LeaderNotificationsBell from '../components/leader/LeaderNotificationsBell';
import { addNotification } from '@/utils/notifications';
import { showToast } from '@/utils/toast';
import CodeCircleLogo from '@/components/common/CodeCircleLogo';

const initialProjects = [
  {
    name: 'AI Chatbot Engine',
    summary: 'Natural language processing backend for real-time customer support automation',
    progress: 78,
    members: 25,
    updated: '3d left'
  },
  {
    name: 'Eco-Track Dashboard',
    summary: 'Real-time carbon footprint monitoring system for supply chain management',
    progress: 92,
    members: 18,
    updated: '2d left'
  },
  {
    name: 'NFT Marketplace VR',
    summary: 'Immersive virtual reality storefront for digital assets with 3D gallery',
    progress: 65,
    members: 14,
    updated: '4d left'
  },
  {
    name: 'DataViz Library',
    summary: 'Lightweight charting library optimized for best performance in analytics',
    progress: 71,
    members: 21,
    updated: '5d left'
  }
];

const reviews = [
  {
    title: 'Review Feed',
    items: [
      { label: 'New commit', detail: 'Oscar, dev pushed to AI Chatbot', time: '5h ago' },
      { label: 'Review Required', detail: 'Alice requested review on Eco-track', time: '2h ago' },
      { label: 'Review Required', detail: 'Kevin requested review on DataViz', time: '1h ago' }
    ]
  }
];

export default function LeaderProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState(() => {
    try {
      const stored = localStorage.getItem('leaderProjects');
      const saved = stored ? JSON.parse(stored) : [];
      return [...saved, ...initialProjects];
    } catch {
      return [...initialProjects];
    }
  });
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const availableClubs = useMemo(() => {
    try {
      const stored = localStorage.getItem('leaderCreatedClubs');
      const created = stored ? JSON.parse(stored) : [];
      return [...created, ...baseClubs];
    } catch {
      return [...baseClubs];
    }
  }, []);
  const [projectForm, setProjectForm] = useState({
    name: '',
    summary: '',
    progress: '0',
    members: '1',
    clubId: ''
  });
  const [editingProject, setEditingProject] = useState<{
    id: number;
    name: string;
    summary: string;
    progress: number;
    members: number;
    clubId: number;
    clubName?: string;
  } | null>(null);
  const [projectErrors, setProjectErrors] = useState<Record<string, string>>({});
  const memberProgressByProject = useMemo(() => {
    try {
      const raw = localStorage.getItem('studentProjectSubmissions');
          const submissions = raw
        ? (JSON.parse(raw) as {
            projectId: number;
            fullName: string;
            email: string;
            progress: number;
            notes: string;
            code: string;
            updatedAt: string;
          }[])
        : [];
      return submissions.reduce((acc: Record<number, typeof submissions>, submission) => {
        if (!acc[submission.projectId]) acc[submission.projectId] = [];
        acc[submission.projectId].push(submission);
        return acc;
      }, {});
    } catch {
      return {};
    }
  }, []);

  const validateProjectForm = () => {
    const errors: Record<string, string> = {};

    if (!projectForm.name.trim()) {
      errors.name = 'Project name is required.';
    }

    if (!projectForm.summary.trim()) {
      errors.summary = 'Project summary is required.';
    }

    if (!projectForm.clubId) {
      errors.clubId = 'Please select a club.';
    }

    const progressValue = Number(projectForm.progress);
    if (Number.isNaN(progressValue) || progressValue < 0 || progressValue > 100) {
      errors.progress = 'Progress must be between 0 and 100.';
    }

    const membersValue = Number(projectForm.members);
    if (!Number.isInteger(membersValue) || membersValue < 1) {
      errors.members = 'Members must be at least 1.';
    }

    setProjectErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateProject = () => {
    if (!validateProjectForm()) return;

    const newProject = {
        id: Date.now(),
        name: projectForm.name.trim(),
        summary: projectForm.summary.trim(),
        progress: Number(projectForm.progress),
        members: Number(projectForm.members),
        clubId: Number(projectForm.clubId),
        clubName:
          availableClubs.find((club: { id: number }) => club.id === Number(projectForm.clubId))?.name ||
          'Unknown Club',
        updated: 'Just now'
      };
    setProjects((prev) => {
      const next = [newProject, ...prev];
      const storedOnly = next.filter((project) => project.clubId);
      localStorage.setItem('leaderProjects', JSON.stringify(storedOnly));
      return next;
    });
    addNotification(`Project created: ${newProject.name}`);
    showToast('Project created successfully.');

    setProjectForm({
      name: '',
      summary: '',
      progress: '0',
      members: '1',
      clubId: ''
    });
    setProjectErrors({});
    setShowNewProjectModal(false);
  };

  const handleDeleteProject = (projectId: number) => {
    if (!confirm('Delete this project? This action cannot be undone.')) return;
    setProjects((prev) => {
      const next = prev.filter((project) => project.id !== projectId);
      const storedOnly = next.filter((project) => project.clubId);
      localStorage.setItem('leaderProjects', JSON.stringify(storedOnly));
      return next;
    });
    addNotification('Project deleted.');
    showToast('Project deleted.');
  };

  const handleUpdateProject = () => {
    if (!editingProject) return;
    const updated = {
      ...editingProject,
      clubName:
        availableClubs.find((club: { id: number }) => club.id === editingProject.clubId)?.name ||
        'Unknown Club'
    };
    setProjects((prev) => {
      const next = prev.map((project) => (project.id === updated.id ? updated : project));
      const storedOnly = next.filter((project) => project.clubId);
      localStorage.setItem('leaderProjects', JSON.stringify(storedOnly));
      return next;
    });
    addNotification(`Project updated: ${updated.name}`);
    showToast('Project updated.');
    setEditingProject(null);
  };

  return (
    <div className="min-h-screen w-full bg-slate-100">
      <div className="flex min-h-screen">
        <LeaderSidebar active="projects" />

        {/* Main */}
        <main className="flex-1 px-5 py-6 lg:px-8 lg:ml-64">
          {/* Top bar */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="lg:hidden">
              <CodeCircleLogo className="text-blue-700" />
            </div>
            <div className="flex-1 md:max-w-xl">
              <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-500">
                <Search className="h-4 w-4 text-slate-400" />
                <input className="w-full outline-none" placeholder="Search project repositories..." />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowNewProjectModal(true)}
                className="rounded-lg bg-blue-900 px-3 py-2 text-sm text-white hover:bg-blue-800"
              >
                <span className="inline-flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  New Project
                </span>
              </button>
              <LeaderNotificationsBell />
              <div className="flex items-center gap-2 rounded-full bg-white border border-slate-200 px-3 py-2">
                <div className="h-7 w-7 rounded-full bg-slate-200"></div>
                <div className="text-xs">
                  <p className="text-slate-700 font-medium">Alex Rivera</p>
                  <p className="text-slate-400">Leader</p>
                </div>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="mt-8 flex flex-col gap-2">
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
              Active club Projects
            </h1>
            <p className="text-sm text-slate-500">
              Managing 12 active development teams across the platform.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-[2.1fr_1fr] gap-4">
            {/* Project cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((project) => (
                <div key={project.name} className="bg-white border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-semibold">
                      {project.name[0]}
                    </div>
                    <span className="text-xs text-slate-400">{project.updated}</span>
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-slate-900">{project.name}</h3>
                  <p className="mt-2 text-xs text-slate-500">{project.summary}</p>
                  {project.clubName && (
                    <p className="mt-2 text-[11px] text-blue-700 font-semibold">
                      {project.clubName}
                    </p>
                  )}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Progress</span>
                      <span className="text-slate-700">{project.progress}%</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-blue-600" style={{ width: `${project.progress}%` }}></div>
                    </div>
                  </div>
                  {project.id && memberProgressByProject[project.id] && (
                    <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-3">
                      <p className="text-xs font-semibold text-slate-700">Member Progress</p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Avg:{' '}
                        {Math.round(
                          memberProgressByProject[project.id].reduce((sum, item) => sum + item.progress, 0) /
                            memberProgressByProject[project.id].length
                        )}
                        %
                      </p>
                      <div className="mt-2 space-y-2">
                        {memberProgressByProject[project.id].slice(0, 3).map((entry) => (
                          <div key={`${entry.email}-${entry.updatedAt}`} className="flex items-center justify-between text-[11px] text-slate-600">
                            <span>{entry.fullName}</span>
                            <span className="text-slate-700 font-semibold">{entry.progress}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                    <span>{project.members} Members</span>
                    {project.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingProject(project)}
                          className="rounded-full border border-slate-200 px-3 py-1 text-slate-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-rose-700"
                        >
                          Delete
                        </button>
                      </div>
                    ) : (
                      <button className="rounded-full border border-blue-200 px-3 py-1 text-blue-700">
                        View
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button
                onClick={() => setShowNewProjectModal(true)}
                className="bg-white border border-dashed border-blue-200 rounded-xl p-4 text-sm text-slate-500 flex items-center justify-center"
              >
                Create New Project
              </button>
            </div>

            {/* Review Feed */}
            <div className="bg-white border border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">Review Feed</p>
                <button className="text-xs text-blue-700">View All Activity</button>
              </div>
              <div className="mt-4 space-y-4">
                {reviews[0].items.map((item) => (
                  <div key={`${item.label}-${item.time}`} className="border border-slate-100 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-900">{item.label}</p>
                      <span className="text-[10px] text-slate-400">{item.time}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">{item.detail}</p>
                    <button className="mt-3 text-xs text-blue-700">Open full request</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Create New Project</h2>
              <button
                onClick={() => setShowNewProjectModal(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Club</label>
                <select
                  value={projectForm.clubId}
                  onChange={(e) => {
                    setProjectForm({ ...projectForm, clubId: e.target.value });
                    if (projectErrors.clubId) setProjectErrors({ ...projectErrors, clubId: '' });
                  }}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                    projectErrors.clubId ? 'border-red-500' : 'border-slate-300'
                  }`}
                >
                  <option value="">Select a club</option>
                  {availableClubs.map((club: { id: number; name: string }) => (
                    <option key={club.id} value={club.id}>
                      {club.name}
                    </option>
                  ))}
                </select>
                {projectErrors.clubId && (
                  <p className="mt-1 text-xs text-red-600">{projectErrors.clubId}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Project Name</label>
                <input
                  type="text"
                  value={projectForm.name}
                  onChange={(e) => {
                    setProjectForm({ ...projectForm, name: e.target.value });
                    if (projectErrors.name) setProjectErrors({ ...projectErrors, name: '' });
                  }}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                    projectErrors.name ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
                {projectErrors.name && <p className="mt-1 text-xs text-red-600">{projectErrors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Summary</label>
                <textarea
                  rows={3}
                  value={projectForm.summary}
                  onChange={(e) => {
                    setProjectForm({ ...projectForm, summary: e.target.value });
                    if (projectErrors.summary) setProjectErrors({ ...projectErrors, summary: '' });
                  }}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                    projectErrors.summary ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
                {projectErrors.summary && <p className="mt-1 text-xs text-red-600">{projectErrors.summary}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Progress (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={projectForm.progress}
                    onChange={(e) => {
                      setProjectForm({ ...projectForm, progress: e.target.value });
                      if (projectErrors.progress) setProjectErrors({ ...projectErrors, progress: '' });
                    }}
                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                      projectErrors.progress ? 'border-red-500' : 'border-slate-300'
                    }`}
                  />
                  {projectErrors.progress && (
                    <p className="mt-1 text-xs text-red-600">{projectErrors.progress}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Members</label>
                  <input
                    type="number"
                    min={1}
                    value={projectForm.members}
                    onChange={(e) => {
                      setProjectForm({ ...projectForm, members: e.target.value });
                      if (projectErrors.members) setProjectErrors({ ...projectErrors, members: '' });
                    }}
                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                      projectErrors.members ? 'border-red-500' : 'border-slate-300'
                    }`}
                  />
                  {projectErrors.members && <p className="mt-1 text-xs text-red-600">{projectErrors.members}</p>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 border-t border-slate-200 px-6 py-4">
              <button
                onClick={() => setShowNewProjectModal(false)}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                className="flex-1 rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Edit Project</h2>
              <button onClick={() => setEditingProject(null)} className="text-slate-500 hover:text-slate-700">
                ✕
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Club</label>
                <select
                  value={editingProject.clubId}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, clubId: Number(e.target.value) })
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
                <label className="block text-sm font-semibold text-slate-700 mb-2">Project Name</label>
                <input
                  type="text"
                  value={editingProject.name}
                  onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Summary</label>
                <textarea
                  rows={3}
                  value={editingProject.summary}
                  onChange={(e) => setEditingProject({ ...editingProject, summary: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Progress (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={editingProject.progress}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, progress: Number(e.target.value) })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Members</label>
                  <input
                    type="number"
                    min={1}
                    value={editingProject.members}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, members: Number(e.target.value) })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 border-t border-slate-200 px-6 py-4">
              <button
                onClick={() => setEditingProject(null)}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProject}
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
