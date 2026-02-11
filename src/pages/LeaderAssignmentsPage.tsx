import { useMemo, useState } from 'react';
import { Calendar, ClipboardCheck, Menu, Plus, Search, Trash2, Pencil } from 'lucide-react';
import LeaderSidebar from '../components/leader/LeaderSidebar';
import LeaderNotificationsBell from '../components/leader/LeaderNotificationsBell';
import CodeCircleLogo from '@/components/common/CodeCircleLogo';
import MobileSidebarDrawer from '@/components/layout/MobileSidebarDrawer';
import { getAuthUser, getLeaderDisplayName } from '@/utils/authUser';
import { clubs as baseClubs } from '@/data/clubs';
import { addNotification } from '@/utils/notifications';
import { showToast } from '@/utils/toast';

type LeaderAssignment = {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  clubId: number;
  clubName: string;
  createdAt: string;
};

export default function LeaderAssignmentsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const leaderName = getLeaderDisplayName();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<LeaderAssignment | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formState, setFormState] = useState({
    title: '',
    description: '',
    dueDate: '',
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

  const [assignments, setAssignments] = useState<LeaderAssignment[]>(() => {
    try {
      const raw = localStorage.getItem('leaderAssignments');
      return raw ? (JSON.parse(raw) as LeaderAssignment[]) : [];
    } catch {
      return [];
    }
  });

  const filteredAssignments = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return assignments;
    return assignments.filter((assignment) =>
      [assignment.title, assignment.description, assignment.clubName]
        .filter(Boolean)
        .some((item) => item.toLowerCase().includes(search))
    );
  }, [assignments, searchTerm]);

  const resetForm = () => {
    setFormState({ title: '', description: '', dueDate: '', clubId: '' });
    setFormErrors({});
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};
    if (!formState.title.trim()) nextErrors.title = 'Assignment title is required.';
    if (!formState.description.trim()) nextErrors.description = 'Assignment details are required.';
    if (!formState.dueDate) nextErrors.dueDate = 'Select a due date.';
    if (!formState.clubId) nextErrors.clubId = 'Select a club.';
    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleCreateAssignment = () => {
    if (availableClubs.length === 0) {
      showToast('Create a club first to add assignments.');
      return;
    }
    if (!validateForm()) return;
    const club = availableClubs.find((item: { id: number }) => item.id === Number(formState.clubId));
    const newAssignment: LeaderAssignment = {
      id: Date.now(),
      title: formState.title.trim(),
      description: formState.description.trim(),
      dueDate: formState.dueDate,
      clubId: Number(formState.clubId),
      clubName: club?.name ?? 'Unknown Club',
      createdAt: new Date().toISOString()
    };
    setAssignments((prev) => {
      const next = [newAssignment, ...prev];
      localStorage.setItem('leaderAssignments', JSON.stringify(next));
      return next;
    });
    addNotification(`Assignment created: ${newAssignment.title}`);
    showToast('Assignment created.');
    resetForm();
    setShowCreateModal(false);
  };

  const handleDeleteAssignment = (assignmentId: number) => {
    if (!confirm('Delete this assignment?')) return;
    setAssignments((prev) => {
      const next = prev.filter((assignment) => assignment.id !== assignmentId);
      localStorage.setItem('leaderAssignments', JSON.stringify(next));
      return next;
    });
    addNotification('Assignment deleted.');
    showToast('Assignment deleted.');
  };

  const handleUpdateAssignment = () => {
    if (!editingAssignment) return;
    const club = availableClubs.find((item: { id: number }) => item.id === editingAssignment.clubId);
    const updated = { ...editingAssignment, clubName: club?.name ?? editingAssignment.clubName };
    setAssignments((prev) => {
      const next = prev.map((assignment) => (assignment.id === updated.id ? updated : assignment));
      localStorage.setItem('leaderAssignments', JSON.stringify(next));
      return next;
    });
    addNotification(`Assignment updated: ${updated.title}`);
    showToast('Assignment updated.');
    setEditingAssignment(null);
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
              <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-500">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full outline-none"
                  placeholder="Search assignments or clubs..."
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
                  New Assignment
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
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">Assignments</h1>
            <p className="text-sm text-slate-500">
              Schedule assignments and track club responsibilities.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredAssignments.map((assignment) => (
              <div key={assignment.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="inline-flex items-center gap-2">
                    <ClipboardCheck className="h-4 w-4 text-blue-600" />
                    {assignment.clubName}
                  </span>
                  <span>{new Date(assignment.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="mt-3 text-sm font-semibold text-slate-900">{assignment.title}</h3>
                <p className="mt-2 text-xs text-slate-500">{assignment.description}</p>
                <div className="mt-3 inline-flex items-center gap-2 text-xs text-slate-500">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  Due {new Date(assignment.dueDate).toLocaleDateString()}
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => setEditingAssignment(assignment)}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600"
                  >
                    <Pencil className="h-3 w-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteAssignment(assignment.id)}
                    className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs text-rose-700"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {filteredAssignments.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
                No assignments created yet.
              </div>
            )}
          </div>
        </main>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Create Assignment</h2>
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
                <label className="block text-sm font-semibold text-slate-700 mb-2">Assignment Title</label>
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
                <label className="block text-sm font-semibold text-slate-700 mb-2">Assignment Details</label>
                <textarea
                  rows={3}
                  value={formState.description}
                  onChange={(event) => {
                    setFormState({ ...formState, description: event.target.value });
                    if (formErrors.description) setFormErrors({ ...formErrors, description: '' });
                  }}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                    formErrors.description ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
                {formErrors.description && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.description}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Due Date</label>
                <input
                  type="date"
                  value={formState.dueDate}
                  onChange={(event) => {
                    setFormState({ ...formState, dueDate: event.target.value });
                    if (formErrors.dueDate) setFormErrors({ ...formErrors, dueDate: '' });
                  }}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                    formErrors.dueDate ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
                {formErrors.dueDate && <p className="mt-1 text-xs text-red-600">{formErrors.dueDate}</p>}
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
                onClick={handleCreateAssignment}
                className="flex-1 rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Create Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {editingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Edit Assignment</h2>
              <button onClick={() => setEditingAssignment(null)} className="text-slate-500 hover:text-slate-700">
                ×
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Club</label>
                <select
                  value={editingAssignment.clubId}
                  onChange={(event) =>
                    setEditingAssignment({ ...editingAssignment, clubId: Number(event.target.value) })
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
                <label className="block text-sm font-semibold text-slate-700 mb-2">Assignment Title</label>
                <input
                  type="text"
                  value={editingAssignment.title}
                  onChange={(event) => setEditingAssignment({ ...editingAssignment, title: event.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Assignment Details</label>
                <textarea
                  rows={3}
                  value={editingAssignment.description}
                  onChange={(event) => setEditingAssignment({ ...editingAssignment, description: event.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Due Date</label>
                <input
                  type="date"
                  value={editingAssignment.dueDate}
                  onChange={(event) => setEditingAssignment({ ...editingAssignment, dueDate: event.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 border-t border-slate-200 px-6 py-4">
              <button
                onClick={() => setEditingAssignment(null)}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateAssignment}
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
