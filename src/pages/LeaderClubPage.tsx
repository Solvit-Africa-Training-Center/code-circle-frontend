import { useState } from 'react';
import { Search, Menu, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LeaderSidebar from '../components/leader/LeaderSidebar';
import LeaderNotificationsBell from '../components/leader/LeaderNotificationsBell';
import { addNotification } from '@/utils/notifications';
import { showToast } from '@/utils/toast';
import CodeCircleLogo from '@/components/common/CodeCircleLogo';
import MobileSidebarDrawer from '@/components/layout/MobileSidebarDrawer';
import { getAuthUser, getLeaderDisplayName } from '@/utils/authUser';
import {
  useDeleteClubMutation,
  useGetClubMembersQuery,
  useGetCreatorClubsQuery,
  useUpdateClubMutation,
} from '@/features/ClubsApi';
import type { Club } from '@/types/club';
import { useGeneratePoolMutation } from '@/features/QuestionPoolApi';

function ClubMembersPreview({ clubId }: { clubId: string }) {
  const { data: members = [], isLoading } = useGetClubMembersQuery(clubId, {
    skip: !clubId,
  });

  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
          <Users className="h-3.5 w-3.5" />
          Members
        </p>
        <span className="text-xs font-semibold text-slate-700">{members.length}</span>
      </div>
      <div className="mt-2 max-h-28 overflow-y-auto">
        {isLoading && <p className="text-xs text-slate-500">Loading members...</p>}
        {!isLoading && members.length === 0 && (
          <p className="text-xs text-slate-500">No members yet.</p>
        )}
        {!isLoading && members.length > 0 && (
          <ul className="space-y-1.5">
            {members.map((member) => (
              <li key={member.membershipId} className="text-xs text-slate-700">
                <span className="font-medium text-slate-800">{member.fullName}</span>{' '}
                <span className="text-slate-500">({member.email})</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function LeaderClubPage() {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const leaderName = getLeaderDisplayName();
  const authUser = getAuthUser();
  const creatorId = authUser?.id ?? '';
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [submitError, setSubmitError] = useState('');
  const [poolStatus, setPoolStatus] = useState('');

  const {
    data: creatorClubs = [],
    isLoading,
    refetch,
  } = useGetCreatorClubsQuery(creatorId, { skip: !creatorId });
  const [updateClub, { isLoading: isUpdating }] = useUpdateClubMutation();
  const [deleteClub, { isLoading: isDeleting }] = useDeleteClubMutation();
  const [generatePool, { isLoading: isGeneratingPool }] = useGeneratePoolMutation();

  const handleDeleteClub = async (clubId: string, clubName: string) => {
    if (!confirm('Delete this club? This action cannot be undone.')) return;
    try {
      await deleteClub(clubId).unwrap();
      addNotification(`Club deleted: ${clubName}`);
      showToast('Club deleted.');
      await refetch();
    } catch (err) {
      const apiMessage = (err as { data?: { message?: string } })?.data?.message;
      showToast(
        typeof apiMessage === 'string' && apiMessage.trim()
          ? apiMessage
          : 'Failed to delete club.',
      );
    }
  };

  const handleUpdateClub = async () => {
    if (!editingClub) return;
    setSubmitError('');
    try {
      await updateClub({
        id: editingClub.id,
        body: {
          name: editingClub.name.trim(),
          description: editingClub.description?.trim(),
          imageUrl: editingClub.imageUrl?.trim(),
          categoryId: editingClub.categoryId,
        },
      }).unwrap();
      addNotification(`Club updated: ${editingClub.name}`);
      showToast('Club updated.');
      setEditingClub(null);
      await refetch();
    } catch (err) {
      const apiMessage = (err as { data?: { message?: string } })?.data?.message;
      setSubmitError(
        typeof apiMessage === 'string' && apiMessage.trim()
          ? apiMessage
          : 'Failed to update club.',
      );
    }
  };

  const handleGenerateClubQuestions = async (club: Club) => {
    setPoolStatus('');
    try {
      const generated = await generatePool({
        poolType: 'CLUB',
        clubId: club.id,
        difficulty: 'INTERMEDIATE',
      }).unwrap();

      setPoolStatus(
        `Generated ${generated.count} member-test questions for "${club.name}".`,
      );
      showToast(`Questions generated for ${club.name}.`);
    } catch (err) {
      const apiMessage = (err as { data?: { message?: string } })?.data?.message;
      const message =
        typeof apiMessage === 'string' && apiMessage.trim()
          ? apiMessage
          : `Failed to generate questions for ${club.name}.`;
      setPoolStatus(message);
      showToast(message);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-100">
      <div className="flex min-h-screen">
        <LeaderSidebar active="club" />
        <MobileSidebarDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Leader Menu">
          <LeaderSidebar active="club" variant="mobile" />
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

          <div className="mt-8 flex flex-col gap-2">
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">My Clubs</h1>
            <p className="text-sm text-slate-500">Manage clubs you created from backend data.</p>
            {poolStatus && (
              <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
                {poolStatus}
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/leader/clubs/new')}
              className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
            >
              Create Club
            </button>
            <button
              onClick={() => refetch()}
              className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Refresh
            </button>
          </div>

          {!creatorId && (
            <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
              Missing authenticated user id. Please sign in again.
            </div>
          )}

          {creatorId && isLoading && (
            <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
              Loading your clubs...
            </div>
          )}

          {creatorId && !isLoading && creatorClubs.length === 0 && (
            <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
              No clubs found for your account yet.
            </div>
          )}

          {creatorClubs.length > 0 && (
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {creatorClubs.map((club) => (
                <div
                  key={club.id}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {club.imageUrl ? (
                    <img src={club.imageUrl} alt={club.name} className="h-44 w-full object-cover" />
                  ) : (
                    <div className="h-44 w-full bg-slate-100 flex items-center justify-center text-slate-400 text-sm">
                      No Image
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-base font-semibold text-slate-900">{club.name}</h3>
                        <p className="text-xs text-slate-500 mt-1">{club.category?.name ?? 'Unknown category'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/leader/club/${club.id}`)}
                          className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleGenerateClubQuestions(club)}
                          disabled={isGeneratingPool}
                          className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 disabled:opacity-60"
                        >
                          Generate Qs
                        </button>
                        <button
                          onClick={() => {
                            setEditingClub(club);
                            setSubmitError('');
                          }}
                          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClub(club.id, club.name)}
                          disabled={isDeleting}
                          className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mt-3 line-clamp-2">
                      {club.description || 'No description'}
                    </p>
                    <ClubMembersPreview clubId={club.id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {editingClub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Edit Club</h2>
              <button onClick={() => setEditingClub(null)} className="text-slate-500 hover:text-slate-700">
                x
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
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
                  value={editingClub.category?.name ?? ''}
                  disabled
                  className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Club Image URL</label>
                <input
                  type="text"
                  value={editingClub.imageUrl ?? ''}
                  onChange={(e) =>
                    setEditingClub({
                      ...editingClub,
                      imageUrl: e.target.value,
                    })
                  }
                  placeholder="https://example.com/club-image.jpg"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
                <div className="mt-2 h-24 w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                  {editingClub.imageUrl ? (
                    <img
                      src={editingClub.imageUrl}
                      alt={editingClub.name}
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        (event.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-slate-500">
                      No image preview
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                <textarea
                  rows={3}
                  value={editingClub.description ?? ''}
                  onChange={(e) =>
                    setEditingClub({
                      ...editingClub,
                      description: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>
              {submitError && <p className="text-sm text-red-600">{submitError}</p>}
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
                disabled={isUpdating}
                className="flex-1 rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
