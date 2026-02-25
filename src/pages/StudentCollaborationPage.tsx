import { useMemo, useState } from 'react';
import {
  BadgeCheck,
  Bolt,
  Code2,
  Crown,
  MonitorPlay,
  Search,
  Sparkles,
  Menu,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import StudentSidebar from '@/components/student/StudentSidebar';
import CodeCircleLogo from '@/components/common/CodeCircleLogo';
import MobileSidebarDrawer from '@/components/layout/MobileSidebarDrawer';
import { useGetClubByIdQuery } from '@/features/ClubsApi';
import { useGetUserMembershipsQuery } from '@/features/UsersApi';
import {
  type CollaborationTask,
  type CollaborationTaskStatus,
  useCreateCodeSubmissionMutation,
  useCreateMessageMutation,
  useCreateTaskMutation,
  useGetRoomByClubQuery,
  useUpdateTaskMutation,
} from '@/features/CollaborationApi';

const defaultMembers = [
  { name: 'Club Lead', role: 'CREATOR', status: 'online' as const },
  { name: 'Member', role: 'MEMBER', status: 'offline' as const },
];

const starterCode = `function greeting(name) {
  return "Welcome " + name + " to the club!";
}

console.log(greeting("CodeCircle"));`;

const codingTags = ['JavaScript', 'Python', 'React', 'Node.js', 'HTML', 'CSS', 'Dart', 'Flutter', 'SQL'];
const codingCategories = [
  'web development',
  'software development',
  'mobile app development',
  'machine learning',
  'artificial intelligence',
  'data engineering',
  'python programming',
  'devops engineering',
];

const columnToStatus: Record<string, CollaborationTaskStatus> = {
  Todo: 'todo',
  'In progress': 'in_progress',
  Review: 'review',
  Done: 'done',
};

const nextStatus: Record<CollaborationTaskStatus, CollaborationTaskStatus> = {
  todo: 'in_progress',
  in_progress: 'review',
  review: 'done',
  done: 'done',
};

const getDueLabel = (date?: string | null) => {
  if (!date) return 'No due date';
  return new Date(date).toLocaleDateString();
};

export default function StudentCollaborationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState('JavaScript');
  const [code, setCode] = useState(starterCode);
  const [output, setOutput] = useState('Run the code to see output.');
  const [chatInput, setChatInput] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [activePeopleTab, setActivePeopleTab] = useState<'chat' | 'members'>('chat');
  const [submittedNote, setSubmittedNote] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const authUser = useMemo(() => {
    try {
      const raw = localStorage.getItem('authUser');
      return raw
        ? (JSON.parse(raw) as {
            id?: string;
            userId?: string;
            sub?: string;
            email?: string;
          })
        : {};
    } catch {
      return {};
    }
  }, []);
  const tokenUserId = useMemo(() => {
    try {
      const token = localStorage.getItem('authAccessToken');
      if (!token) return '';
      const payload = token.split('.')[1];
      if (!payload) return '';
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = JSON.parse(atob(normalized)) as { sub?: string };
      return decoded.sub ?? '';
    } catch {
      return '';
    }
  }, []);
  const resolvedUserId = authUser.id || authUser.userId || authUser.sub || tokenUserId || '';
  const tokenExists = Boolean(localStorage.getItem('authAccessToken'));

  const clubId = String(id ?? '');
  const { data: club } = useGetClubByIdQuery(clubId, { skip: !clubId });
  const {
    data: memberships = [],
    isLoading: membershipsLoading,
    isFetching: membershipsFetching,
  } = useGetUserMembershipsQuery(resolvedUserId, {
    skip: !resolvedUserId,
  });
  const {
    data: room,
    isLoading: roomLoading,
    isFetching: roomFetching,
  } = useGetRoomByClubQuery(clubId, {
    skip: !clubId || !tokenExists,
    pollingInterval: 15000,
  });

  const localJoinedClubIds = useMemo(() => {
    try {
      const raw = localStorage.getItem('studentJoinedClubs');
      return raw ? (JSON.parse(raw) as Array<string | number>).map(String) : [];
    } catch {
      return [];
    }
  }, []);

  const [createMessage, { isLoading: postingMessage }] = useCreateMessageMutation();
  const [createTask, { isLoading: creatingTask }] = useCreateTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [createCodeSubmission, { isLoading: submittingCode }] = useCreateCodeSubmissionMutation();

  const isJoined = useMemo(() => {
    if (!clubId) return false;
    const activeMembership = memberships.some(
      (membership) =>
        String(membership.clubId) === clubId && membership.status === 'active',
    );
    const isClubOwner = club?.creatorId && resolvedUserId && club.creatorId === resolvedUserId;
    const joinedLocally = localJoinedClubIds.includes(clubId);
    const hasRoomAccess = Boolean(room);
    return activeMembership || Boolean(isClubOwner) || joinedLocally || hasRoomAccess;
  }, [club?.creatorId, clubId, localJoinedClubIds, memberships, resolvedUserId, room]);

  const showWorkspace = useMemo(() => {
    if (!club) return false;
    const categoryName = typeof club.category === 'string' ? club.category : club.category?.name;
    const tagMatch = codingTags.some((tag) =>
      club.name.toLowerCase().includes(tag.toLowerCase())
    );
    const categoryMatch = categoryName
      ? codingCategories.includes(String(categoryName).toLowerCase())
      : false;
    return tagMatch || categoryMatch;
  }, [club]);

  const tasks = room?.tasks ?? [];
  const messages = room?.messages ?? [];
  const members = room?.members ?? [];

  const runCode = () => {
    if (selectedLanguage !== 'JavaScript') {
      setOutput('Execution is available for JavaScript in this demo.');
      return;
    }

    const logs: string[] = [];
    const originalLog = console.log;
    try {
      console.log = (...args: unknown[]) => {
        logs.push(args.map((arg) => String(arg)).join(' '));
      };
      const result = new Function(code)();
      if (result !== undefined) logs.push(String(result));
      setOutput(logs.length ? logs.join('\n') : 'Program finished with no output.');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setOutput(`Error: ${message}`);
    } finally {
      console.log = originalLog;
    }
  };

  const sendMessage = async () => {
    const content = chatInput.trim();
    if (!content || !clubId) return;
    await createMessage({ clubId, content }).unwrap();
    setChatInput('');
  };

  const handleCreateTask = async () => {
    const title = newTaskTitle.trim();
    if (!title || !clubId) return;
    await createTask({ clubId, title, status: 'todo' }).unwrap();
    setNewTaskTitle('');
  };

  const advanceTask = async (task: CollaborationTask) => {
    if (!clubId || task.status === 'done') return;
    await updateTask({ clubId, taskId: task.id, status: nextStatus[task.status] }).unwrap();
  };

  const handleSubmitCode = async () => {
    if (!clubId) return;
    await createCodeSubmission({
      clubId,
      language: selectedLanguage,
      code,
      note: submittedNote.trim() || undefined,
    }).unwrap();
    setSubmittedNote('');
  };

  if (!club) {
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
              <h1 className="text-2xl font-semibold text-slate-900">Club not found</h1>
              <p className="text-sm text-slate-600 mt-2">
                Pick a valid club from your student dashboard to collaborate.
              </p>
              <button
                onClick={() => navigate('/student/clubs')}
                className="mt-6 rounded-full bg-blue-900 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Back to My Clubs
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const accessCheckLoading =
    (resolvedUserId && (membershipsLoading || membershipsFetching)) ||
    (tokenExists && (roomLoading || roomFetching));
  if (accessCheckLoading) {
    return (
      <div className="min-h-screen w-full bg-slate-100">
        <div className="flex min-h-screen">
          <StudentSidebar />
          <main className="flex-1 px-5 py-12 lg:px-8 lg:ml-64">
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <h1 className="text-2xl font-semibold text-slate-900">Loading collaboration room...</h1>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!isJoined) {
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
              <h1 className="text-2xl font-semibold text-slate-900">Join the club first</h1>
              <p className="text-sm text-slate-600 mt-2">
                Collaboration spaces are available after you join the club.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link
                  to={`/clubs/${club.id}`}
                  className="rounded-full bg-blue-900 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  Go to Club
                </Link>
                <button
                  onClick={() => navigate('/student/clubs')}
                  className="rounded-full border border-slate-200 px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  My Clubs
                </button>
              </div>
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
                <input className="w-full outline-none" placeholder="Search collaboration artifacts..." />
              </div>
            </div>
            <div className="rounded-2xl bg-white border border-slate-200 px-3 py-2 text-xs">
              <p className="text-slate-700 font-medium">{authUser.email?.split('@')[0] || 'Student'}</p>
              <p className="text-slate-400">Member</p>
            </div>
          </div>

          <section className="mt-6 rounded-3xl bg-white border border-slate-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-blue-600 font-semibold">Collaboration Room</p>
                <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 mt-2">{club.name}</h1>
                <p className="text-sm text-slate-600 mt-2 max-w-2xl">{club.description}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-2xl bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700">
                  <MonitorPlay className="h-4 w-4" />
                  Live Sprint Board
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
                  <Bolt className="h-4 w-4" />
                  {room?.codeSubmissions.length ?? 0} code updates
                </div>
              </div>
            </div>
          </section>

          <section className="mt-6 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
            <div className="space-y-6">
              <div className="rounded-3xl bg-white border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">Sprint Board</h2>
                  <Sparkles className="h-4 w-4 text-blue-600" />
                </div>

                <div className="mt-4 flex gap-2">
                  <input
                    value={newTaskTitle}
                    onChange={(event) => setNewTaskTitle(event.target.value)}
                    placeholder="Add a task..."
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  <button
                    onClick={handleCreateTask}
                    disabled={creatingTask}
                    className="rounded-xl bg-blue-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                  >
                    Add
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                  {Object.entries(columnToStatus).map(([column, status]) => (
                    <div key={column} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-[0.2em]">
                        {column}
                      </p>
                      <div className="mt-3 space-y-3">
                        {tasks
                          .filter((task) => task.status === status)
                          .map((task) => (
                            <button
                              key={task.id}
                              onClick={() => advanceTask(task)}
                              className="w-full text-left rounded-2xl bg-white p-3 shadow-sm border border-slate-200 hover:border-blue-200"
                            >
                              <p className="text-sm font-semibold text-slate-900">{task.title}</p>
                              <p className="text-xs text-slate-500 mt-1">Due {getDueLabel(task.dueDate)}</p>
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {showWorkspace ? (
                <div className="rounded-3xl bg-white border border-slate-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">Live Coding Pad</h2>
                      <p className="text-xs text-slate-500 mt-1">Pair with a teammate and ship small wins fast.</p>
                    </div>
                    <Code2 className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {['JavaScript', 'Python', 'HTML'].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setSelectedLanguage(lang)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                          selectedLanguage === lang
                            ? 'bg-blue-900 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4">
                    <div className="rounded-2xl border border-slate-200 bg-slate-900 p-4 text-slate-100">
                      <textarea
                        value={code}
                        onChange={(event) => setCode(event.target.value)}
                        className="min-h-[320px] w-full bg-transparent text-xs leading-relaxed outline-none"
                      />
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold text-slate-500">Console Output</p>
                      <pre className="mt-3 min-h-[240px] whitespace-pre-wrap text-xs text-slate-700">
                        {output}
                      </pre>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      onClick={runCode}
                      className="rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                    >
                      Run Code
                    </button>
                    <button
                      onClick={() => setCode(starterCode)}
                      className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Reset
                    </button>
                    <button
                      onClick={handleSubmitCode}
                      disabled={submittingCode}
                      className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
                    >
                      Submit Code
                    </button>
                  </div>
                  <div className="mt-4">
                    <label className="text-xs font-semibold text-slate-500">Submission note</label>
                    <textarea
                      value={submittedNote}
                      onChange={(event) => setSubmittedNote(event.target.value)}
                      rows={2}
                      placeholder="What did you change?"
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 text-xs text-slate-600 outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-6">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Code2 className="h-4 w-4 text-blue-600" />
                    <p className="text-sm font-semibold">Coding pad is unavailable</p>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    This collaboration room focuses on non-coding workflows.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 p-5 text-white">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-blue-100">
                  <Crown className="h-4 w-4" />
                  Collaboration Pulse
                </div>
                <p className="mt-3 text-sm font-semibold">
                  {members.length} members in this room. Keep updates actionable.
                </p>
                <button
                  onClick={() => setActivePeopleTab('chat')}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold text-white hover:bg-white/25"
                >
                  <BadgeCheck className="h-4 w-4" />
                  Open Chat
                </button>
              </div>

              <div className="rounded-3xl bg-white border border-slate-200 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">Team Room</h3>
                  <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1 text-xs">
                    <button
                      onClick={() => setActivePeopleTab('chat')}
                      className={`rounded-full px-3 py-1 font-semibold ${
                        activePeopleTab === 'chat' ? 'bg-blue-900 text-white' : 'text-slate-600'
                      }`}
                    >
                      Chat
                    </button>
                    <button
                      onClick={() => setActivePeopleTab('members')}
                      className={`rounded-full px-3 py-1 font-semibold ${
                        activePeopleTab === 'members' ? 'bg-blue-900 text-white' : 'text-slate-600'
                      }`}
                    >
                      Members
                    </button>
                  </div>
                </div>

                {activePeopleTab === 'chat' ? (
                  <>
                    <div className="mt-4 space-y-3 max-h-64 overflow-y-auto pr-1">
                      {(roomLoading || roomFetching) && messages.length === 0 && (
                        <div className="rounded-2xl bg-slate-50 p-3 text-xs text-slate-500">Loading messages...</div>
                      )}
                      {messages.map((message) => (
                        <div key={message.id} className="rounded-2xl bg-slate-50 p-3">
                          <p className="text-xs font-semibold text-slate-900">{message.user.name}</p>
                          <p className="text-xs text-slate-600 mt-1">{message.content}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 space-y-2">
                      <textarea
                        value={chatInput}
                        onChange={(event) => setChatInput(event.target.value)}
                        placeholder="Share an update with the team..."
                        className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-xs text-slate-600 outline-none focus:ring-2 focus:ring-blue-200"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={postingMessage}
                        className="w-full rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                      >
                        Send Message
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="mt-4 space-y-3">
                    {(members.length > 0 ? members : defaultMembers).map((member) => (
                      <div
                        key={'userId' in member ? member.userId : member.name}
                        className="flex items-center justify-between rounded-2xl border border-slate-200 p-3"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{member.name}</p>
                          <p className="text-xs text-slate-500">{member.role}</p>
                        </div>
                        <span
                          className={`text-[10px] font-semibold uppercase ${
                            ('email' in member && member.email ? 'text-emerald-600' : 'text-slate-400')
                          }`}
                        >
                          {'email' in member && member.email ? 'online' : member.status}
                        </span>
                      </div>
                    ))}
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
