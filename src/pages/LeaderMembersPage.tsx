import { Search, Menu } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import LeaderSidebar from '../components/leader/LeaderSidebar';
import LeaderNotificationsBell from '../components/leader/LeaderNotificationsBell';
import CodeCircleLogo from '@/components/common/CodeCircleLogo';
import MobileSidebarDrawer from '@/components/layout/MobileSidebarDrawer';
import { getAuthUser, getLeaderDisplayName } from '@/utils/authUser';
import { useGetCreatorClubsQuery, useGetClubMembersQuery } from '@/features/ClubsApi';

export default function LeaderMembersPage() {
  const [searchParams] = useSearchParams();
  const leaderName = getLeaderDisplayName();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const creatorId = getAuthUser()?.id ?? '';
  const { data: creatorClubs = [], isLoading: isClubsLoading } = useGetCreatorClubsQuery(creatorId, {
    skip: !creatorId,
  });

  const initialClubId = searchParams.get('clubId') ?? '';
  const [selectedClubId, setSelectedClubId] = useState(initialClubId);

  const activeClubId = selectedClubId || creatorClubs[0]?.id || '';

  const { data: members = [], isLoading: isMembersLoading } = useGetClubMembersQuery(activeClubId, {
    skip: !activeClubId,
  });

  const filteredMembers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return members;
    return members.filter((member) => {
      const name = member.fullName.toLowerCase();
      const email = member.email.toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [members, searchTerm]);

  const selectedClubName =
    creatorClubs.find((club) => club.id === activeClubId)?.name ?? 'Unknown club';

  return (
    <div className="min-h-screen w-full bg-slate-100">
      <div className="flex min-h-screen">
        <LeaderSidebar active="members" />
        <MobileSidebarDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Leader Menu">
          <LeaderSidebar active="members" variant="mobile" />
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
                  className="w-full outline-none"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search members by name or email"
                />
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
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
              Member Management
            </h1>
            <p className="text-sm text-slate-500">
              View all active members in your club.
            </p>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
            <label className="block text-xs uppercase tracking-[0.2em] text-slate-500">Club</label>
            <select
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={activeClubId}
              onChange={(event) => setSelectedClubId(event.target.value)}
              disabled={isClubsLoading || creatorClubs.length === 0}
            >
              {creatorClubs.length === 0 && <option value="">No clubs found</option>}
              {creatorClubs.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Total Members</span>
                <span className="text-blue-600 font-medium">{selectedClubName}</span>
              </div>
              <p className="mt-3 text-2xl font-semibold text-slate-900">{members.length}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Showing</span>
                <span className="text-blue-600 font-medium">Filtered</span>
              </div>
              <p className="mt-3 text-2xl font-semibold text-slate-900">{filteredMembers.length}</p>
            </div>
          </div>

          <div className="mt-6 bg-white border border-blue-200 rounded-xl overflow-x-auto">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-[2fr_2fr_1.3fr_1.4fr] gap-4 text-xs text-slate-400 font-semibold px-6 py-3 border-b border-slate-100 text-left">
                <span>Member Name</span>
                <span>Email</span>
                <span>Status</span>
                <span>Joined</span>
              </div>

              <div className="divide-y divide-slate-100">
                {isMembersLoading && (
                  <div className="px-6 py-6 text-sm text-slate-500">Loading members...</div>
                )}
                {!isMembersLoading && filteredMembers.length === 0 && (
                  <div className="px-6 py-6 text-sm text-slate-500">No members found for this club.</div>
                )}
                {!isMembersLoading &&
                  filteredMembers.map((member) => (
                    <div
                      key={member.membershipId}
                      className="grid grid-cols-[2fr_2fr_1.3fr_1.4fr] gap-4 items-center px-6 py-4 text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-slate-200"></div>
                        <div>
                          <p className="font-medium text-slate-900">{member.fullName}</p>
                          <p className="text-xs text-slate-400">{member.userId}</p>
                        </div>
                      </div>
                      <p className="text-slate-700">{member.email || 'N/A'}</p>
                      <p className="text-slate-700 capitalize">{member.status}</p>
                      <p className="text-slate-700">{new Date(member.joinedAt).toLocaleDateString()}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
