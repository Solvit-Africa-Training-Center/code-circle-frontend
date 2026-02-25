import { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  ClipboardCheck,
  Code2,
  FolderKanban,
  MessagesSquare,
  Search,
  Sparkles,
  Users,
  Menu,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StudentSidebar from '@/components/student/StudentSidebar';
import { clubs as allClubs } from '@/data/clubs';
import CodeCircleLogo from '@/components/common/CodeCircleLogo';
import MobileSidebarDrawer from '@/components/layout/MobileSidebarDrawer';
import { addNotification } from '@/utils/notifications';
import { useGetActiveClubsQuery } from '@/features/ClubsApi';
import { useGetUserMembershipsQuery } from '@/features/UsersApi';
import { useGetCoursesByClubIdsQuery } from '@/features/CoursesApi';
import { useGetAssignmentsByCourseIdsQuery } from '@/features/AssignmentsApi';
import { useGetProjectsByCourseIdsQuery } from '@/features/ProjectsApi';
import {
  computeCourseProgress,
  type StoredCourseProgress,
} from '@/utils/courseProgress';

const defaultMembers = [
  { name: 'Amina K.', role: 'Club Lead', status: 'online' },
  { name: 'Samir L.', role: 'Mentor', status: 'online' },
  { name: 'Grace P.', role: 'Contributor', status: 'offline' },
  { name: 'Diego M.', role: 'Contributor', status: 'online' },
];

const initialMessages = [
  { name: 'Amina', text: 'Post your progress screenshots by 5 PM.' },
  { name: 'Alex', text: 'Working on the hero section now, will share soon.' },
  { name: 'Diego', text: 'Need feedback on button hover states.' },
];

const starterCode = `const title = "CodeCircle UI Lab";
const makeBanner = (message) => {
  return "[Club Demo] " + message.toUpperCase();
};

console.log(makeBanner(title));`;

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

export default function StudentClubPage() {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState('JavaScript');
  const [code, setCode] = useState(starterCode);
  const [output, setOutput] = useState('Run the code to see output.');
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState(initialMessages);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const authUser = useMemo(() => {
    try {
      const raw = localStorage.getItem('authUser');
      return raw ? (JSON.parse(raw) as { id?: string; email?: string }) : {};
    } catch {
      return {};
    }
  }, []);
  const { data: activeClubs = [] } = useGetActiveClubsQuery();
  const { data: memberships = [] } = useGetUserMembershipsQuery(authUser.id ?? '', {
    skip: !authUser.id,
  });

  const studentProfile = useMemo(() => {
    try {
      const raw = localStorage.getItem('studentMembers');
      const members = raw ? (JSON.parse(raw) as { email: string; fullName: string }[]) : [];
      return members.find((member) => member.email === authUser.email);
    } catch {
      return undefined;
    }
  }, [authUser.email]);

  const [localJoinedClubIds, setLocalJoinedClubIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('studentJoinedClubs');
      return raw ? (JSON.parse(raw) as Array<string | number>).map(String) : [];
    } catch {
      return [];
    }
  });

  const joinedClubIds = useMemo(() => {
    const fromMemberships = memberships
      .filter((membership) => membership.status === 'active' && membership.clubId)
      .map((membership) => String(membership.clubId));
    if (fromMemberships.length > 0) {
      return Array.from(new Set(fromMemberships));
    }
    return localJoinedClubIds;
  }, [localJoinedClubIds, memberships]);

  const mergedClubs = useMemo(() => {
    try {
      const stored = localStorage.getItem('leaderCreatedClubs');
      const leaderClubs = stored ? JSON.parse(stored) : [];
      return [...activeClubs, ...leaderClubs, ...allClubs];
    } catch {
      return [...activeClubs, ...allClubs];
    }
  }, [activeClubs]);

  const normalizedClubs = useMemo(() => {
    return mergedClubs.map((club) => ({
      ...club,
      tags:
        club.tags ??
        (club.category?.name
          ? [club.category.name, 'Community', 'Projects']
          : club.category
            ? [club.category, 'Community', 'Projects']
            : []),
      projectList: club.projectList ?? [],
      stats: club.stats ?? { joinedMembers: 0, projects: club.projectsCount ?? 0, modules: club.modulesCount ?? 0 },
      projectsCount: club.projectsCount ?? 0,
      modulesCount: club.modulesCount ?? 0,
    }));
  }, [mergedClubs]);

  const joinedClubs = useMemo(
    () => normalizedClubs.filter((club) => joinedClubIds.includes(String(club.id))),
    [joinedClubIds, normalizedClubs]
  );

  const [activeClubId, setActiveClubId] = useState<string | null>(
    joinedClubs[0] ? String(joinedClubs[0].id) : null
  );

  const activeClub =
    joinedClubs.find((club) => String(club.id) === String(activeClubId)) ?? joinedClubs[0];

  const { data: clubCourses = [] } = useGetCoursesByClubIdsQuery(joinedClubIds, {
    skip: joinedClubIds.length === 0,
  });
  const visibleClubCourses = useMemo(
    () => clubCourses.filter((course) => course.status !== 'archived'),
    [clubCourses]
  );

  useEffect(() => {
    if (!activeClubId && joinedClubs.length > 0) {
      setActiveClubId(String(joinedClubs[0].id));
    }
  }, [activeClubId, joinedClubs]);

  const activeClubCourses = useMemo(() => {
    if (visibleClubCourses.length === 0) return [];
    if (!activeClub) return visibleClubCourses;

    const exact = visibleClubCourses.filter(
      (course) => String(course.clubId) === String(activeClub.id)
    );

    return exact.length > 0 ? exact : visibleClubCourses;
  }, [activeClub, visibleClubCourses]);

  const activeCourseIds = useMemo(
    () => activeClubCourses.map((course) => course.id),
    [activeClubCourses]
  );

  const { data: assignmentCatalog = [] } = useGetAssignmentsByCourseIdsQuery(activeCourseIds, {
    skip: activeCourseIds.length === 0,
  });
  const { data: projectCatalog = [] } = useGetProjectsByCourseIdsQuery(activeCourseIds, {
    skip: activeCourseIds.length === 0,
  });

  const clubAssignments = useMemo(
    () => assignmentCatalog
      .filter((assignment) => assignment.status !== 'closed')
      .sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }),
    [assignmentCatalog]
  );

  const clubProjects = useMemo(
    () => projectCatalog.filter((project) => project.status !== 'archived'),
    [projectCatalog]
  );

  const courseTitleById = useMemo(
    () =>
      activeClubCourses.reduce<Record<string, string>>((acc, course) => {
        acc[course.id] = course.title;
        return acc;
      }, {}),
    [activeClubCourses]
  );

  const showWorkspace = useMemo(() => {
    if (!activeClub) return false;
    const tagMatch = activeClub.tags.some((tag) => codingTags.includes(tag));
    const categoryValue =
      typeof activeClub.category === 'string' ? activeClub.category : activeClub.category?.name;
    const categoryMatch = categoryValue
      ? codingCategories.includes(categoryValue.toLowerCase())
      : false;
    return tagMatch || categoryMatch;
  }, [activeClub]);

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

  const handleLeaveClub = () => {
    if (!activeClub) return;
    if (!confirm(`Leave ${activeClub.name}?`)) return;

    const nextJoined = joinedClubIds.filter((clubId) => String(clubId) !== String(activeClub.id));
    localStorage.setItem('studentJoinedClubs', JSON.stringify(nextJoined));
    setLocalJoinedClubIds(nextJoined);

    try {
      const activeClubKey = String(activeClub.id);
      const membersRaw = localStorage.getItem('clubMembers');
      const membersByClub = membersRaw
        ? (JSON.parse(membersRaw) as Record<string, { email: string; fullName?: string }[]>)
        : {};
      const clubMembers = membersByClub[activeClubKey] || [];
      membersByClub[activeClubKey] = clubMembers.filter((member) => member.email !== authUser.email);
      localStorage.setItem('clubMembers', JSON.stringify(membersByClub));
    } catch {
      // Ignore member storage errors for demo flow
    }

    try {
      const createdRaw = localStorage.getItem('leaderCreatedClubs');
      if (createdRaw) {
        const activeClubKey = String(activeClub.id);
        const created = JSON.parse(createdRaw) as Array<{ id: number | string; stats?: { joinedMembers: number } }>;
        const membersRaw = localStorage.getItem('clubMembers');
        const membersByClub = membersRaw ? (JSON.parse(membersRaw) as Record<string, { email: string }[]>) : {};
        const nextClubs = created.map((clubItem) => {
          if (String(clubItem.id) !== String(activeClub.id)) return clubItem;
          return {
            ...clubItem,
            stats: { joinedMembers: (membersByClub[activeClubKey] || []).length }
          };
        });
        localStorage.setItem('leaderCreatedClubs', JSON.stringify(nextClubs));
      }
    } catch {
      // Ignore sync errors for demo flow
    }

    const displayName = studentProfile?.fullName || authUser.email?.split('@')[0] || 'A member';
    addNotification(`${displayName} left the club: ${activeClub.name}`);

    if (nextJoined.length === 0) {
      setActiveClubId(null);
      return;
    }
    if (String(activeClubId) === String(activeClub.id)) {
      setActiveClubId(String(nextJoined[0]));
    }
  };

  const memberSummary = useMemo(() => {
    if (!activeClub) return `${defaultMembers.length} members`;
    try {
      const membersRaw = localStorage.getItem('clubMembers');
      const membersByClub = membersRaw ? (JSON.parse(membersRaw) as Record<string, { email: string }[]>) : {};
      const count = membersByClub[String(activeClub.id)]?.length ?? 0;
      return `${Math.max(defaultMembers.length, count)} members`;
    } catch {
      return `${Math.max(defaultMembers.length, activeClub.stats.joinedMembers)} members`;
    }
  }, [activeClub]);

  const progressByCourse = useMemo(() => {
    try {
      const raw = localStorage.getItem(`studentCourseProgress:${authUser.email ?? 'anonymous'}`);
      return raw ? (JSON.parse(raw) as Record<string, StoredCourseProgress>) : {};
    } catch {
      return {};
    }
  }, [authUser.email]);

  if (!activeClub) {
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
              <h1 className="text-2xl font-semibold text-slate-900">No joined clubs yet</h1>
              <p className="text-sm text-slate-600 mt-2">
                Join a club to unlock collaboration, courses, and projects.
              </p>
              <button
                onClick={() => navigate('/clubs')}
                className="mt-6 rounded-full bg-blue-900 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Browse Clubs
              </button>
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
                <input className="w-full outline-none" placeholder="Search club resources..." />
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-white border border-slate-200 px-3 py-2">
              <div className="h-8 w-8 rounded-full bg-blue-100"></div>
              <div className="text-xs">
                <p className="text-slate-700 font-medium">
                  {studentProfile?.fullName || authUser.email?.split('@')[0] || 'Student'}
                </p>
                <p className="text-slate-400">Member</p>
              </div>
            </div>
          </div>

          {joinedClubs.length > 1 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {joinedClubs.map((club) => (
                <button
                  key={club.id}
                  onClick={() => setActiveClubId(String(club.id))}
                  className={`rounded-full px-4 py-1 text-xs font-semibold transition ${
                    String(activeClubId) === String(club.id)
                      ? 'bg-blue-900 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-200'
                  }`}
                >
                  {club.name}
                </button>
              ))}
            </div>
          )}

          <section className="mt-6 rounded-3xl bg-white border border-slate-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-blue-600 font-semibold">My Club</p>
                <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 mt-2">
                  {activeClub.name}
                </h1>
                <p className="text-sm text-slate-600 mt-2 max-w-2xl">{activeClub.description}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate(`/student/clubs/${activeClub.id}/collaboration`)}
                  className="rounded-full bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  Open Collaboration
                </button>
                
                <button
                  onClick={handleLeaveClub}
                  className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                >
                  Leave Club
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs text-slate-500">Members</p>
                <p className="text-lg font-semibold text-slate-900 mt-1">{memberSummary}</p>
                <p className="text-xs text-blue-600 mt-2">
                  {typeof activeClub.category === 'string' ? activeClub.category : activeClub.category?.name}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs text-slate-500">Active Courses</p>
                <p className="text-lg font-semibold text-slate-900 mt-1">{activeClubCourses.length}</p>
                <p className="text-xs text-slate-500 mt-2">Weekly reviews every Friday</p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs text-slate-500">Active Projects</p>
                <p className="text-lg font-semibold text-slate-900 mt-1">{clubProjects.length}</p>
                <p className="text-xs text-slate-500 mt-2">Next demo in 3 days</p>
              </div>
            </div>
          </section>

          <section className="mt-6 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
            <div className="space-y-6">
              <div className="rounded-3xl bg-white border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">Courses</h2>
                  <button
                    onClick={() => navigate('/student/courses')}
                    className="text-xs font-semibold text-blue-700"
                  >
                    View more
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeClubCourses.slice(0, 4).map((course) => {
                    const totalLessons = (course.modules ?? []).reduce((sum, mod) => sum + (mod.lessons?.length ?? 0), 0);
                    const storedProgress = progressByCourse[course.id];
                    const metrics = computeCourseProgress({
                      lessonTotal: totalLessons,
                      completedLessons: storedProgress?.completedLessons?.length ?? 0,
                      requiredAssignments: storedProgress?.requiredAssignments ?? 0,
                      completedAssignments: storedProgress?.completedAssignmentIds?.length ?? 0,
                      requiredProjects: storedProgress?.requiredProjects ?? 0,
                      completedProjects: storedProgress?.completedProjectIds?.length ?? 0,
                    });
                    const progress = metrics.percent;
                    const status = metrics.isCompleted ? 'Completed' : progress > 0 ? 'In progress' : 'Not started';
                    return (
                    <div key={course.title} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-blue-600 font-semibold">
                          {status}
                        </span>
                        <span className="text-xs text-slate-400">
                          {(course.modules ?? []).reduce((sum, mod) => sum + (mod.lessons?.length ?? 0), 0)} lessons
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-semibold text-slate-900">{course.title}</p>
                      {status === 'Completed' ? (
                        <button
                          className="mt-3 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                          disabled
                        >
                          Completed
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate(`/student/courses/${course.id}`)}
                          className="mt-3 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                        >
                          {status === 'In progress' ? 'Resume Course' : 'Learn Course'}
                        </button>
                      )}
                    </div>
                  )})}
                  {activeClubCourses.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                      No courses available for this club yet.
                    </div>
                  )}
                </div>
              </div>


              <div className="rounded-3xl bg-white border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">Assignments</h2>
                  <ClipboardCheck className="h-4 w-4 text-blue-600" />
                </div>
                <div className="mt-4 space-y-3">
                  {clubAssignments.map((assignment) => {
                    const dueLabel = assignment.dueDate
                      ? new Date(assignment.dueDate).toLocaleDateString()
                      : 'No due date';
                    return (
                      <div
                        key={assignment.id}
                        className="w-full rounded-2xl border border-slate-200 p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-slate-900">{assignment.title}</p>
                          <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700">
                            {assignment.type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{assignment.description}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          Course: {courseTitleById[assignment.courseId] ?? 'Unknown course'}
                        </p>
                        <p className="text-xs text-blue-600 mt-2 inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          Due {dueLabel}
                        </p>
                        <button
                          onClick={() => navigate(`/student/courses/${assignment.courseId}`)}
                          className="mt-3 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                        >
                          Open Course
                        </button>
                      </div>
                    );
                  })}
                  {clubAssignments.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                      No assignments for this club yet.
                    </div>
                  )}
                </div>
              </div>


              <div className="rounded-3xl bg-white border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">Projects</h2>
                  <FolderKanban className="h-4 w-4 text-blue-600" />
                </div>
                <div className="mt-4 space-y-3">
                  {clubProjects.map((project) => (
                    <div
                      key={project.id}
                      className="w-full rounded-2xl border border-slate-200 p-4"
                    >
                      <p className="text-sm font-semibold text-slate-900">{project.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{project.description}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Course: {courseTitleById[project.courseId] ?? 'Unknown course'}
                      </p>
                      <button
                        onClick={() => navigate(`/student/courses/${project.courseId}`)}
                        className="mt-3 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                      >
                        Open Course
                      </button>
                    </div>
                  ))}
                  {clubProjects.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                      No active projects yet.
                    </div>
                  )}
                </div>
              </div>


              {showWorkspace ? (
                <div className="rounded-3xl bg-white border border-slate-200 p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-900">Coding Workspace</h2>
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
                        className="min-h-[220px] w-full bg-transparent text-xs leading-relaxed outline-none"
                      />
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold text-slate-500">Console Output</p>
                      <pre className="mt-3 min-h-[180px] whitespace-pre-wrap text-xs text-slate-700">
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
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-6">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Code2 className="h-4 w-4 text-blue-600" />
                    <p className="text-sm font-semibold">Coding workspace is unavailable</p>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    This club focuses on non-coding tracks. Join a coding club to unlock the live
                    editor.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl bg-white border border-slate-200 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">Members</h3>
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
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
              </div>

              <div className="rounded-3xl bg-white border border-slate-200 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">Team Chat</h3>
                  <MessagesSquare className="h-4 w-4 text-blue-600" />
                </div>
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
                    placeholder="Share an update with the club..."
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-xs text-slate-600 outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  <button
                    onClick={sendMessage}
                    className="w-full rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    Send Message
                  </button>
                </div>
              </div>

              <div className="rounded-3xl bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 p-5 text-white">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-blue-100">
                  <Sparkles className="h-4 w-4" />
                  Collaboration Tip
                </div>
                <p className="mt-3 text-sm font-semibold">
                  Share a weekly wins recap to keep the team aligned on progress.
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
