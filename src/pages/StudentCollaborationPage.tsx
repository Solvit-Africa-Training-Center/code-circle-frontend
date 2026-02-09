import { useMemo, useState } from 'react';
import {
  BadgeCheck,
  Bolt,
  Code2,
  Crown,
  MessagesSquare,
  MonitorPlay,
  Search,
  Sparkles,
  Users,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import StudentSidebar from '@/components/student/StudentSidebar';
import { clubs as allClubs } from '@/data/clubs';
import CodeCircleLogo from '@/components/common/CodeCircleLogo';

const defaultMembers = [
  { name: 'Amina K.', role: 'Club Lead', status: 'online' },
  { name: 'Samir L.', role: 'Mentor', status: 'online' },
  { name: 'Grace P.', role: 'Contributor', status: 'offline' },
  { name: 'Diego M.', role: 'Contributor', status: 'online' },
];

const tasks = [
  { title: 'Update hero animation', due: 'Today', status: 'In progress' },
  { title: 'Review component library', due: 'Tomorrow', status: 'Review' },
  { title: 'Prepare demo notes', due: 'Friday', status: 'Todo' },
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

export default function StudentCollaborationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState('JavaScript');
  const [code, setCode] = useState(starterCode);
  const [output, setOutput] = useState('Run the code to see output.');
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { name: 'Amina', text: 'Let’s keep updates short and actionable.' },
    { name: 'Alex', text: 'I can handle the UI polish today.' },
  ]);
  const [activePeopleTab, setActivePeopleTab] = useState<'chat' | 'members'>('chat');
  const [submittedNote, setSubmittedNote] = useState('');

  const clubId = Number(id);
  const mergedClubs = useMemo(() => {
    try {
      const stored = localStorage.getItem('leaderCreatedClubs');
      const leaderClubs = stored ? JSON.parse(stored) : [];
      return [...leaderClubs, ...allClubs];
    } catch {
      return allClubs;
    }
  }, []);

  const normalizedClubs = useMemo(
    () =>
      mergedClubs.map((club) => ({
        ...club,
        tags: club.tags ?? (club.category ? [club.category, 'Community', 'Projects'] : []),
        projectList: club.projectList ?? [],
        stats: club.stats ?? { joinedMembers: 0, projects: club.projectsCount ?? 0, modules: club.modulesCount ?? 0 },
        projectsCount: club.projectsCount ?? 0,
        modulesCount: club.modulesCount ?? 0,
      })),
    [mergedClubs]
  );

  const club = normalizedClubs.find((item) => item.id === clubId);

  const joinedClubIds = useMemo(() => {
    try {
      const raw = localStorage.getItem('studentJoinedClubs');
      return raw ? (JSON.parse(raw) as number[]) : [];
    } catch {
      return [];
    }
  }, []);

  const isJoined = joinedClubIds.includes(clubId);
  const showWorkspace = useMemo(() => {
    if (!club) return false;
    const tagMatch = club.tags.some((tag) => codingTags.includes(tag));
    const categoryMatch = club.category
      ? codingCategories.includes(String(club.category).toLowerCase())
      : false;
    return tagMatch || categoryMatch;
  }, [club]);

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
      if (result !== undefined) {
        logs.push(String(result));
      }
      setOutput(logs.length ? logs.join('\n') : 'Program finished with no output.');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setOutput(`Error: ${message}`);
    } finally {
      console.log = originalLog;
    }
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    setMessages((prev) => [...prev, { name: 'You', text: chatInput.trim() }]);
    setChatInput('');
  };

  const handleSubmitCode = () => {
    if (!club) return;
    const entry = {
      clubId: club.id,
      code,
      note: submittedNote.trim(),
      submittedAt: new Date().toISOString(),
    };
    try {
      const raw = localStorage.getItem('collabCodeSubmissions');
      const existing = raw ? (JSON.parse(raw) as typeof entry[]) : [];
      localStorage.setItem('collabCodeSubmissions', JSON.stringify([entry, ...existing]));
    } catch {
      localStorage.setItem('collabCodeSubmissions', JSON.stringify([entry]));
    }
    setSubmittedNote('');
  };

  if (!club) {
    return (
      <div className="min-h-screen w-full bg-slate-100">
        <div className="flex min-h-screen">
          <StudentSidebar />
          <main className="flex-1 px-5 py-12 lg:px-8 lg:ml-64">
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <h1 className="text-2xl font-semibold text-slate-900">Club not found</h1>
              <p className="text-sm text-slate-600 mt-2">
                Pick a club from your student dashboard to collaborate.
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

  if (!isJoined) {
    return (
      <div className="min-h-screen w-full bg-slate-100">
        <div className="flex min-h-screen">
          <StudentSidebar />
          <main className="flex-1 px-5 py-12 lg:px-8 lg:ml-64">
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

        <main className="flex-1 px-5 py-6 lg:px-8 lg:ml-64">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="lg:hidden">
              <CodeCircleLogo className="text-blue-700" />
            </div>
            <div className="flex-1 md:max-w-xl">
              <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-500">
                <Search className="h-4 w-4 text-slate-400" />
                <input className="w-full outline-none" placeholder="Search collaboration artifacts..." />
              </div>
            </div>
            <div className="rounded-2xl bg-white border border-slate-200 px-3 py-2 text-xs">
              <p className="text-slate-700 font-medium">
                {(() => {
                  try {
                    const raw = localStorage.getItem('authUser');
                    if (!raw) return 'Student';
                    const auth = JSON.parse(raw) as { email?: string };
                    const membersRaw = localStorage.getItem('studentMembers');
                    const members = membersRaw ? (JSON.parse(membersRaw) as { email: string; fullName: string }[]) : [];
                    const profile = members.find((member) => member.email === auth.email);
                    return profile?.fullName || auth.email?.split('@')[0] || 'Student';
                  } catch {
                    return 'Student';
                  }
                })()}
              </p>
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
                  6 updates today
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
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['Todo', 'In progress', 'Review'].map((column) => (
                    <div key={column} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-[0.2em]">
                        {column}
                      </p>
                      <div className="mt-3 space-y-3">
                        {tasks
                          .filter((task) => task.status === column)
                          .map((task) => (
                            <div key={task.title} className="rounded-2xl bg-white p-3 shadow-sm border border-slate-200">
                              <p className="text-sm font-semibold text-slate-900">{task.title}</p>
                              <p className="text-xs text-slate-500 mt-1">Due {task.due}</p>
                            </div>
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
                      className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
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
                  3 members are active now. Jump into the live chat and claim a task.
                </p>
                <button className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold text-white hover:bg-white/25">
                  <BadgeCheck className="h-4 w-4" />
                  Claim a task
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
                      {messages.map((message, index) => (
                        <div key={`${message.name}-${index}`} className="rounded-2xl bg-slate-50 p-3">
                          <p className="text-xs font-semibold text-slate-900">{message.name}</p>
                          <p className="text-xs text-slate-600 mt-1">{message.text}</p>
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
                        className="w-full rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                      >
                        Send Message
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="mt-4 space-y-3">
                    {defaultMembers.map((member) => (
                      <div
                        key={member.name}
                        className="flex items-center justify-between rounded-2xl border border-slate-200 p-3"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{member.name}</p>
                          <p className="text-xs text-slate-500">{member.role}</p>
                        </div>
                        <span
                          className={`text-[10px] font-semibold uppercase ${
                            member.status === 'online' ? 'text-emerald-600' : 'text-slate-400'
                          }`}
                        >
                          {member.status}
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
