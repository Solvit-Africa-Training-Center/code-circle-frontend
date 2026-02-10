import { useMemo, useState } from 'react';
import { Search, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clubs } from '@/data/clubs';
import LeaderSidebar from '../components/leader/LeaderSidebar';
import LeaderNotificationsBell from '../components/leader/LeaderNotificationsBell';
import { addNotification } from '@/utils/notifications';
import { showToast } from '@/utils/toast';
import CodeCircleLogo from '@/components/common/CodeCircleLogo';
import MobileSidebarDrawer from '@/components/layout/MobileSidebarDrawer';
import { getLeaderDisplayName } from '@/utils/authUser';

export default function LeaderClubPage() {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const leaderName = getLeaderDisplayName();
  const leaderClub = clubs[0];
  const [createdClubs, setCreatedClubs] = useState(() => {
    try {
      const stored = localStorage.getItem('leaderCreatedClubs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [editingClub, setEditingClub] = useState<{
    id: number;
    name: string;
    category: string;
    description: string;
    image: string;
  } | null>(null);
  const [editImagePreview, setEditImagePreview] = useState('');
  const projectCounts = useMemo(() => {
    try {
      const stored = localStorage.getItem('leaderProjects');
      const projects = stored ? JSON.parse(stored) : [];
      return projects.reduce((acc: Record<number, number>, project: { clubId: number }) => {
        if (project.clubId) {
          acc[project.clubId] = (acc[project.clubId] || 0) + 1;
        }
        return acc;
      }, {});
    } catch {
      return {};
    }
  }, []);

  const memberCounts = useMemo(() => {
    try {
      const raw = localStorage.getItem('clubMembers');
      const membersByClub = raw ? (JSON.parse(raw) as Record<number, { email: string }[]>) : {};
      return Object.keys(membersByClub).reduce((acc: Record<number, number>, key) => {
        const clubId = Number(key);
        acc[clubId] = membersByClub[clubId]?.length ?? 0;
        return acc;
      }, {});
    } catch {
      return {};
    }
  }, []);

  const handleDeleteClub = (clubId: number) => {
    if (!confirm('Delete this club? This action cannot be undone.')) return;
    const next = createdClubs.filter((club: { id: number }) => club.id !== clubId);
    setCreatedClubs(next);
    localStorage.setItem('leaderCreatedClubs', JSON.stringify(next));
    addNotification('Club deleted.');
    showToast('Club deleted.');
  };

  const handleUpdateClub = () => {
    if (!editingClub) return;
    const next = createdClubs.map((club: { id: number }) =>
      club.id === editingClub.id ? editingClub : club
    );
    setCreatedClubs(next);
    localStorage.setItem('leaderCreatedClubs', JSON.stringify(next));
    setEditingClub(null);
    setEditImagePreview('');
    addNotification(`Club updated: ${editingClub.name}`);
    showToast('Club updated.');
  };

  return (
    <div className="min-h-screen w-full bg-slate-100">
      <div className="flex min-h-screen">
        <LeaderSidebar active="club" />
        <MobileSidebarDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Leader Menu">
          <LeaderSidebar active="club" variant="mobile" />
        </MobileSidebarDrawer>

        {/* Main */}
        <main className="flex-1 px-5 py-6 lg:px-8 lg:ml-64">
          {/* Top bar */}
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
                <input className="w-full outline-none" placeholder="Search club resources..." />
              </div>
            </div>
            <div className="flex items-center gap-3">
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

          {/* Header */}
          <div className="mt-8 flex flex-col gap-2">
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">My Club</h1>
            <p className="text-sm text-slate-500">
              Manage your club profile, members, and resources.
            </p>
          </div>

          {/* Club Card */}
          <div className="mt-6 bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <img
                src={leaderClub.image}
                alt={leaderClub.name}
                className="w-full md:w-40 h-40 rounded-xl object-cover"
              />
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-blue-900">{leaderClub.name}</h2>
                    <p className="text-sm text-slate-600 mt-1">{leaderClub.category}</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => navigate(`/clubs/${leaderClub.id}`)}
                      className="rounded-full bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                    >
                      View Public Page
                    </button>
                    <button
                      onClick={() => navigate('/leader/clubs/new')}
                      className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                    >
                      Create Club
                    </button>
                  </div>
                </div>
                <p className="text-sm text-slate-700 mt-4">{leaderClub.description}</p>
                <div className="mt-5 flex flex-wrap gap-3 text-xs text-slate-600">
                  <span className="rounded-full bg-slate-100 px-3 py-1">Projects: {leaderClub.projectsCount}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">Modules: {leaderClub.modulesCount}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">Members: {leaderClub.stats.joinedMembers}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/leader/members')}
              className="bg-white border border-slate-200 rounded-xl p-4 text-left hover:shadow-sm"
            >
              <p className="text-sm font-semibold text-slate-900">Manage Members</p>
              <p className="text-xs text-slate-500 mt-1">Review requests and roles</p>
            </button>
            <button
              onClick={() => navigate('/leader/projects')}
              className="bg-white border border-slate-200 rounded-xl p-4 text-left hover:shadow-sm"
            >
              <p className="text-sm font-semibold text-slate-900">Manage Projects</p>
              <p className="text-xs text-slate-500 mt-1">Track ongoing work</p>
            </button>
            <button
              onClick={() => navigate('/leader/clubs/new')}
              className="bg-white border border-slate-200 rounded-xl p-4 text-left hover:shadow-sm"
            >
              <p className="text-sm font-semibold text-slate-900">Create New Club</p>
              <p className="text-xs text-slate-500 mt-1">Start another club</p>
            </button>
          </div>

          {/* Created Clubs */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-slate-900">My Created Clubs</h2>
            <p className="text-sm text-slate-500 mt-1">
              Clubs you created from the leader dashboard.
            </p>
            {createdClubs.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
                No created clubs yet. Create your first club to see it here.
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {createdClubs.map((club: { id: number; name: string; category: string; description: string; image: string }) => (
                  <div
                    key={club.id}
                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="relative">
                      {club.image ? (
                        <img src={club.image} alt={club.name} className="h-44 w-full object-cover" />
                      ) : (
                        <div className="h-44 w-full bg-slate-100 flex items-center justify-center text-slate-400 text-sm">
                          No Image
                        </div>
                      )}
                      <span className="absolute top-3 left-3 rounded-full bg-blue-900/90 px-3 py-1 text-[11px] font-semibold text-white">
                        {club.category}
                      </span>
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-base font-semibold text-slate-900">{club.name}</h3>
                          <p className="text-xs text-slate-500 mt-1">Created by you</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/leader/club/${club.id}`)}
                            className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                          >
                            View
                          </button>
                          <button
                            onClick={() => {
                              setEditingClub(club);
                              setEditImagePreview(club.image || '');
                            }}
                            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClub(club.id)}
                            className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 mt-3 line-clamp-2">{club.description}</p>

                      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                        <div className="rounded-lg bg-slate-50 p-3">
                          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Members</p>
                          <p className="text-sm font-semibold text-slate-900">{memberCounts[club.id] || 0}</p>
                        </div>
                        <div className="rounded-lg bg-slate-50 p-3">
                          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Projects</p>
                          <p className="text-sm font-semibold text-slate-900">{projectCounts[club.id] || 0}</p>
                        </div>
                        <div className="rounded-lg bg-slate-50 p-3">
                          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Modules</p>
                          <p className="text-sm font-semibold text-slate-900">0</p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          onClick={() => navigate('/leader/members')}
                          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Manage Members
                        </button>
                        <button
                          onClick={() => navigate('/leader/projects')}
                          className="flex-1 rounded-lg bg-blue-900 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                        >
                          Add Project
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {editingClub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Edit Club</h2>
              <button onClick={() => setEditingClub(null)} className="text-slate-500 hover:text-slate-700">
                ✕
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Club Image</label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-5 bg-slate-50">
                  <input
                    type="file"
                    accept="image/*"
                    id="club-image-edit"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          setEditImagePreview(String(reader.result || ''));
                          setEditingClub({ ...editingClub, image: String(reader.result || '') });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <label htmlFor="club-image-edit" className="cursor-pointer block">
                    <p className="text-sm text-slate-600">Click to upload a new image</p>
                  </label>
                  {editImagePreview && (
                    <img src={editImagePreview} alt="Preview" className="mt-4 h-36 w-full rounded-lg object-cover" />
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Club Name</label>
                <input
                  type="text"
                  value={editingClub.name}
                  onChange={(e) => setEditingClub({ ...editingClub, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                <input
                  type="text"
                  value={editingClub.category}
                  onChange={(e) => setEditingClub({ ...editingClub, category: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                <textarea
                  rows={3}
                  value={editingClub.description}
                  onChange={(e) => setEditingClub({ ...editingClub, description: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 border-t border-slate-200 px-6 py-4">
              <button
                onClick={() => setEditingClub(null)}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateClub}
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
