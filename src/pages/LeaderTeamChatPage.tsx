import { Menu, MessagesSquare, Search, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import LeaderSidebar from '@/components/leader/LeaderSidebar';
import LeaderNotificationsBell from '@/components/leader/LeaderNotificationsBell';
import CodeCircleLogo from '@/components/common/CodeCircleLogo';
import MobileSidebarDrawer from '@/components/layout/MobileSidebarDrawer';
import { useGetClubMembersQuery, useGetCreatorClubsQuery } from '@/features/ClubsApi';
import {
  useCreateMessageMutation,
  useGetRoomByClubQuery,
} from '@/features/CollaborationApi';
import { getAuthUser, getLeaderDisplayName } from '@/utils/authUser';

export default function LeaderTeamChatPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const leaderName = getLeaderDisplayName();
  const creatorId = getAuthUser()?.id ?? '';
  const { data: creatorClubs = [], isLoading: loadingClubs } = useGetCreatorClubsQuery(
    creatorId,
    { skip: !creatorId }
  );

  const [selectedClubId, setSelectedClubId] = useState('');
  const activeClubId = selectedClubId || creatorClubs[0]?.id || '';
  const activeClub = creatorClubs.find((club) => club.id === activeClubId);

  useEffect(() => {
    if (!selectedClubId && creatorClubs[0]?.id) {
      setSelectedClubId(creatorClubs[0].id);
    }
  }, [creatorClubs, selectedClubId]);

  const { data: room, isLoading: loadingRoom, isFetching: fetchingRoom } = useGetRoomByClubQuery(
    activeClubId,
    {
      skip: !activeClubId,
      pollingInterval: 15000,
    }
  );
  const { data: members = [] } = useGetClubMembersQuery(activeClubId, { skip: !activeClubId });
  const [createMessage, { isLoading: postingMessage }] = useCreateMessageMutation();

  const filteredMembers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return members;
    return members.filter((member) => {
      const name = member.fullName.toLowerCase();
      const email = member.email.toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [members, searchTerm]);

  const sendMessage = async () => {
    const content = chatInput.trim();
    if (!content || !activeClubId) return;
    await createMessage({ clubId: activeClubId, content }).unwrap();
    setChatInput('');
  };

  return (
    <div className="min-h-screen w-full bg-slate-100">
      <div className="flex min-h-screen">
        <LeaderSidebar active="team-chat" />
        <MobileSidebarDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Leader Menu">
          <LeaderSidebar active="team-chat" variant="mobile" />
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

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4">
            <label className="block text-xs uppercase tracking-[0.2em] text-slate-500">Club</label>
            <select
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={activeClubId}
              onChange={(event) => setSelectedClubId(event.target.value)}
              disabled={loadingClubs || creatorClubs.length === 0}
            >
              {creatorClubs.length === 0 && <option value="">No clubs found</option>}
              {creatorClubs.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name}
                </option>
              ))}
            </select>
          </div>

          {creatorClubs.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <h1 className="text-2xl font-semibold text-slate-900">No clubs yet</h1>
              <p className="mt-2 text-sm text-slate-500">Create a club first to start team collaboration.</p>
            </div>
          ) : (
            <section className="mt-6 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-900 inline-flex items-center gap-2">
                    <MessagesSquare className="h-4 w-4 text-blue-600" />
                    Team Chat {activeClub ? `- ${activeClub.name}` : ''}
                  </h2>
                </div>
                <div className="mt-4 space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {(loadingRoom || fetchingRoom) && !(room?.messages?.length ?? 0) && (
                    <div className="rounded-2xl bg-slate-50 p-3 text-xs text-slate-500">Loading messages...</div>
                  )}
                  {(room?.messages ?? []).map((message) => (
                    <div key={message.id} className="rounded-2xl bg-slate-50 p-3">
                      <p className="text-xs font-semibold text-slate-900">{message.user.name}</p>
                      <p className="text-xs text-slate-600 mt-1">{message.content}</p>
                    </div>
                  ))}
                  {(room?.messages?.length ?? 0) === 0 && !loadingRoom && !fetchingRoom && (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-3 text-xs text-slate-500">
                      No messages yet. Start the conversation.
                    </div>
                  )}
                </div>
                <div className="mt-4 space-y-2">
                  <textarea
                    value={chatInput}
                    onChange={(event) => setChatInput(event.target.value)}
                    placeholder="Share an update with your club..."
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-xs text-slate-600 outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={postingMessage || !activeClubId}
                    className="w-full rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    Send Message
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-slate-900 inline-flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  Members ({filteredMembers.length})
                </h3>
                <div className="mt-4 space-y-3 max-h-[520px] overflow-y-auto pr-1">
                  {filteredMembers.map((member) => (
                    <div
                      key={member.membershipId}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 p-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{member.fullName}</p>
                        <p className="text-xs text-slate-500">{member.email}</p>
                      </div>
                      <span className="text-[10px] font-semibold uppercase text-slate-500">
                        {member.status}
                      </span>
                    </div>
                  ))}
                  {filteredMembers.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-3 text-xs text-slate-500">
                      No members found.
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
