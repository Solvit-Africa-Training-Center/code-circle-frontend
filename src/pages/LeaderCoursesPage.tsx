import { useMemo, useState } from 'react';
import {
  BookOpen,
  BriefcaseBusiness,
  ChevronDown,
  ClipboardList,
  FilePlus2,
  FolderPlus,
  Layers,
  Menu,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import LeaderSidebar from '../components/leader/LeaderSidebar';
import LeaderNotificationsBell from '../components/leader/LeaderNotificationsBell';
import CodeCircleLogo from '@/components/common/CodeCircleLogo';
import MobileSidebarDrawer from '@/components/layout/MobileSidebarDrawer';
import { getAuthUser, getLeaderDisplayName } from '@/utils/authUser';
import { showToast } from '@/utils/toast';
import { useGetCreatorClubsQuery } from '@/features/ClubsApi';
import {
  useCreateCourseMutation,
  useCreateLessonMutation,
  useCreateModuleMutation,
  useDeleteCourseMutation,
  useDeleteLessonMutation,
  useDeleteModuleMutation,
  useGetCourseByIdQuery,
  useGetCoursesByClubIdsQuery,
  usePublishCourseMutation,
  useUpdateCourseMutation,
  useUpdateLessonMutation,
  useUpdateModuleMutation,
} from '@/features/CoursesApi';
import {
  useCreateAssignmentMutation,
  useDeleteAssignmentMutation,
  useGetAssignmentSubmissionsQuery,
  useGetAssignmentsByCourseQuery,
  usePublishAssignmentMutation,
  useUpdateAssignmentMutation,
} from '@/features/AssignmentsApi';
import {
  useCreateProjectTeamMutation,
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useGetMyProjectTeamsQuery,
  useGetProjectTeamsQuery,
  useGetProjectsByCourseQuery,
  usePublishProjectMutation,
  useSubmitProjectTeamMutation,
  useUpdateProjectMutation,
} from '@/features/ProjectsApi';
import type { CourseLevel, CourseStatus, LessonType } from '@/types/course';

type CourseForm = {
  clubId: string;
  title: string;
  description: string;
  level: CourseLevel;
  status: CourseStatus;
  duration: string;
  thumbnail: string;
};

type AssignmentForm = {
  title: string;
  description: string;
  instructions: string;
  type: 'individual' | 'group';
};

const initialCourseForm: CourseForm = {
  clubId: '',
  title: '',
  description: '',
  level: 'beginner',
  status: 'draft',
  duration: '',
  thumbnail: '',
};

const initialAssignmentForm: AssignmentForm = {
  title: '',
  description: '',
  instructions: '',
  type: 'individual',
};

export default function LeaderCoursesPage() {
  const leaderName = getLeaderDisplayName();
  const creatorId = getAuthUser()?.id ?? '';
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [curriculumCourseId, setCurriculumCourseId] = useState<string | null>(null);
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'assignments' | 'projects'>('curriculum');
  const [addModuleOpen, setAddModuleOpen] = useState(false);
  const [addLessonOpen, setAddLessonOpen] = useState(false);
  const [addAssignmentOpen, setAddAssignmentOpen] = useState(false);
  const [courseForm, setCourseForm] = useState<CourseForm>(initialCourseForm);
  const [assignmentForm, setAssignmentForm] = useState<AssignmentForm>(initialAssignmentForm);
  const [moduleForm, setModuleForm] = useState({ title: '', description: '', duration: '' });
  const [lessonForm, setLessonForm] = useState({ moduleId: '', title: '', description: '', type: 'text' as LessonType, duration: '' });
  const [lessonContentType, setLessonContentType] = useState<'text' | 'video' | 'file' | 'external_link'>('text');
  const [lessonContentValue, setLessonContentValue] = useState('');
  const [lessonContentLinkTitle, setLessonContentLinkTitle] = useState('');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const { data: clubs = [] } = useGetCreatorClubsQuery(creatorId, { skip: !creatorId });
  const clubIds = useMemo(() => clubs.map((c) => c.id), [clubs]);
  const { data: courses = [], isLoading, refetch } = useGetCoursesByClubIdsQuery(clubIds, { skip: clubIds.length === 0 });
  const { data: curriculum, refetch: refetchCurriculum } = useGetCourseByIdQuery(curriculumCourseId ?? '', { skip: !curriculumCourseId });
  const { data: assignments = [], refetch: refetchAssignments } = useGetAssignmentsByCourseQuery(curriculumCourseId ?? '', { skip: !curriculumCourseId });
  const { data: projects = [], refetch: refetchProjects } = useGetProjectsByCourseQuery(curriculumCourseId ?? '', { skip: !curriculumCourseId });
  const { data: assignmentSubmissions = [], refetch: refetchAssignmentSubmissions } = useGetAssignmentSubmissionsQuery(selectedAssignmentId ?? '', { skip: !selectedAssignmentId });
  const { data: projectTeams = [], refetch: refetchProjectTeams } = useGetProjectTeamsQuery(selectedProjectId ?? '', { skip: !selectedProjectId });
  const { refetch: refetchMyTeams } = useGetMyProjectTeamsQuery();
  const assignmentsList = Array.isArray(assignments) ? assignments : [];
  const projectsList = Array.isArray(projects) ? projects : [];

  const [createCourse] = useCreateCourseMutation();
  const [updateCourse] = useUpdateCourseMutation();
  const [deleteCourse] = useDeleteCourseMutation();
  const [publishCourse] = usePublishCourseMutation();
  const [createModule] = useCreateModuleMutation();
  const [updateModule] = useUpdateModuleMutation();
  const [deleteModule] = useDeleteModuleMutation();
  const [createLesson] = useCreateLessonMutation();
  const [updateLesson] = useUpdateLessonMutation();
  const [deleteLesson] = useDeleteLessonMutation();
  const [createAssignment] = useCreateAssignmentMutation();
  const [updateAssignment] = useUpdateAssignmentMutation();
  const [publishAssignment] = usePublishAssignmentMutation();
  const [deleteAssignment] = useDeleteAssignmentMutation();
  const [createProject] = useCreateProjectMutation();
  const [updateProject] = useUpdateProjectMutation();
  const [publishProject] = usePublishProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();
  const [createProjectTeam] = useCreateProjectTeamMutation();
  const [submitProjectTeam] = useSubmitProjectTeamMutation();

  const filteredCourses = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter((c) => [c.title, c.description, c.level].some((v) => (v || '').toLowerCase().includes(q)));
  }, [courses, searchTerm]);

  const currentEditingCourse = courses.find((c) => c.id === editingCourseId) ?? null;

  const refreshAll = async () => {
    await refetch();
    if (curriculumCourseId) {
      await refetchCurriculum();
      await refetchAssignments();
      await refetchProjects();
      if (selectedAssignmentId) await refetchAssignmentSubmissions();
      if (selectedProjectId) await refetchProjectTeams();
      await refetchMyTeams();
    }
  };

  const createAssignmentFromModal = async () => {
    if (!curriculumCourseId) return;
    const title = assignmentForm.title.trim();
    const description = assignmentForm.description.trim();
    const instructions = assignmentForm.instructions.trim() || description || title;
    if (title.length < 3) {
      showToast('Assignment title must be at least 3 characters.');
      return;
    }
    try {
      await createAssignment({
        courseId: curriculumCourseId,
        title,
        description,
        instructions,
        type: assignmentForm.type,
      }).unwrap();
      showToast('Assignment created.');
      setAssignmentForm(initialAssignmentForm);
      setAddAssignmentOpen(false);
      await refetchAssignments();
    } catch (error) {
      const apiError = error as { data?: { message?: string | string[] } };
      const rawMessage = apiError?.data?.message;
      const message = Array.isArray(rawMessage) ? rawMessage.join(', ') : rawMessage || 'Failed to create assignment';
      showToast(message);
    }
  };

  const addProjectByPrompt = async () => {
    if (!curriculumCourseId) return;
    const title = prompt('New project title:')?.trim();
    if (!title) return;
    const description = prompt('project description:')?.trim() || '';
    const requirements = prompt('Project requirements:')?.trim() || description || title;
    const type = (prompt('Type: group or individual', 'individual') || 'individual') as 'group' | 'individual';
    await createProject({
      courseId: curriculumCourseId,
      title,
      description,
      requirements,
      type,
      minTeamSize: type === 'group' ? 1 : 1,
      maxTeamSize: type === 'group' ? 5 : 1,
    }).unwrap();
    showToast('Project created.');
    await refetchProjects();
  };

  return (
    <div className="min-h-screen w-full bg-slate-100">
      <div className="flex min-h-screen">
        <LeaderSidebar active="courses" />
        <MobileSidebarDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Leader Menu">
          <LeaderSidebar active="courses" variant="mobile" />
        </MobileSidebarDrawer>
        <main className="flex-1 px-4 py-5 lg:px-6 lg:ml-64">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="lg:hidden flex items-center gap-3">
              <button onClick={() => setDrawerOpen(true)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-600"><Menu className="h-5 w-5" /></button>
              <CodeCircleLogo className="text-blue-700" />
            </div>
            <div className="flex-1 md:max-w-xl"><div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500"><Search className="h-4 w-4 text-slate-400" /><input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full outline-none" placeholder="Search courses..." /></div></div>
            <div className="flex items-center gap-3"><button onClick={() => setCreateOpen(true)} className="rounded-lg bg-blue-900 px-3 py-2 text-sm text-white hover:bg-blue-800"><span className="inline-flex items-center gap-2"><Plus className="h-4 w-4" />New Course</span></button><LeaderNotificationsBell /><div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2"><div className="h-7 w-7 rounded-full bg-slate-200" /><div className="text-xs"><p className="font-medium text-slate-700">{leaderName}</p><p className="text-slate-400">Leader</p></div></div></div>
          </div>
          <div className="mt-4 grid grid-cols-1 xl:grid-cols-[1.24fr_1fr] gap-2">
            <section>{isLoading ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">Loading courses...</div> : <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{filteredCourses.map((c) => <div key={c.id} className={`rounded-2xl border bg-white p-4 ${curriculumCourseId === c.id ? 'border-blue-300 ring-1 ring-blue-200' : 'border-slate-200'}`}><div className="mt-1 flex items-center justify-between"><span className="inline-flex items-center gap-2 text-xs text-slate-500"><BookOpen className="h-4 w-4 text-blue-600" />{c.level}</span><span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">{c.status}</span></div><h3 className="mt-2 text-sm font-semibold text-slate-900">{c.title}</h3><p className="mt-1 text-xs text-slate-500 line-clamp-2">{c.description}</p><div className="mt-3 flex flex-wrap gap-2"><button onClick={() => setCurriculumCourseId(c.id)} className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs text-blue-700"><Layers className="h-3 w-3" />Open</button><button onClick={() => setEditingCourseId(c.id)} className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600"><Pencil className="h-3 w-3" />Edit</button>{c.status === 'draft' && <button onClick={async () => { try { await publishCourse(c.id).unwrap(); showToast('Course published.'); await refreshAll(); } catch (error) { const apiError = error as { data?: { message?: string | string[] } }; const rawMessage = apiError?.data?.message; const message = Array.isArray(rawMessage) ? rawMessage.join(', ') : rawMessage || 'Failed to publish course'; showToast(message); } }} className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">Publish</button>}<button onClick={async () => { if (!confirm('Delete this course?')) return; await deleteCourse(c.id).unwrap(); await refreshAll(); }} className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs text-rose-700"><Trash2 className="h-3 w-3" />Delete</button></div></div>)}</div>}</section>
            <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4 xl:sticky xl:top-5">
              <div className="mt-1 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">{curriculum?.title ?? 'Curriculum'}</h2>
                <div className="flex items-center gap-1">{activeTab === 'curriculum' && <><button onClick={() => setAddModuleOpen(true)} disabled={!curriculumCourseId} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-blue-200 bg-blue-50 text-blue-700 disabled:opacity-50"><FolderPlus className="h-4 w-4" /></button><button onClick={() => setAddLessonOpen(true)} disabled={!curriculumCourseId} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-blue-200 bg-blue-50 text-blue-700 disabled:opacity-50"><FilePlus2 className="h-4 w-4" /></button></>}{activeTab === 'assignments' && <button onClick={() => setAddAssignmentOpen(true)} disabled={!curriculumCourseId} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-blue-200 bg-blue-50 text-blue-700 disabled:opacity-50"><ClipboardList className="h-4 w-4" /></button>}{activeTab === 'projects' && <button onClick={() => addProjectByPrompt()} disabled={!curriculumCourseId} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-blue-200 bg-blue-50 text-blue-700 disabled:opacity-50"><BriefcaseBusiness className="h-4 w-4" /></button>}</div>
              </div>
              <div className="mt-3 flex items-center gap-1 rounded-lg bg-slate-100 p-1">
                <button onClick={() => setActiveTab('overview')} className={`rounded-md px-2.5 py-1 text-xs ${activeTab === 'overview' ? 'bg-white' : ''}`}>Overview</button>
                <button onClick={() => setActiveTab('curriculum')} className={`rounded-md px-2.5 py-1 text-xs ${activeTab === 'curriculum' ? 'bg-white' : ''}`}>Curriculum</button>
                <button onClick={() => setActiveTab('assignments')} className={`rounded-md px-2.5 py-1 text-xs ${activeTab === 'assignments' ? 'bg-white' : ''}`}>Assignments</button>
                <button onClick={() => setActiveTab('projects')} className={`rounded-md px-2.5 py-1 text-xs ${activeTab === 'projects' ? 'bg-white' : ''}`}>Projects</button>
              </div>
              {!curriculumCourseId && <div className="mt-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-500">Select a course.</div>}
              {curriculumCourseId && activeTab === 'overview' && <div className="mt-3 grid grid-cols-3 gap-2 text-center">{[{k:'Modules',v:curriculum?.modules?.length ?? 0},{k:'Lessons',v:(curriculum?.modules ?? []).reduce((a,m)=>a+(m.lessons?.length ?? 0),0)},{k:'Assigns',v:assignmentsList.length}].map((i)=><div key={i.k} className="rounded-lg border border-slate-200 bg-slate-50 p-2"><p className="text-[10px] uppercase text-slate-500">{i.k}</p><p className="text-sm font-semibold text-slate-900">{i.v}</p></div>)}</div>}
              {curriculumCourseId && activeTab === 'curriculum' && <div className="mt-3 max-h-[58vh] space-y-2 overflow-y-auto pr-1">{[...(curriculum?.modules ?? [])].sort((a,b)=>a.orderIndex-b.orderIndex).map((m)=>{const open=expandedModuleId===m.id;return <div key={m.id} className="overflow-hidden rounded-xl border border-slate-200"><button onClick={()=>setExpandedModuleId(open?null:m.id)} className="flex w-full items-center justify-between bg-slate-50 px-3 py-2 text-left"><span className="text-sm font-semibold text-slate-800">Module {m.orderIndex}: {m.title}</span><ChevronDown className={`h-4 w-4 text-slate-500 ${open?'rotate-180':''}`} /></button>{open && <div className="space-y-2 bg-white p-3"><div className="flex justify-end gap-2"><button onClick={async()=>{const t=prompt('Module title',m.title);if(!t)return;const d=prompt('Module description',m.description ?? '') ?? '';await updateModule({moduleId:m.id,body:{title:t,description:d}}).unwrap();await refetchCurriculum();}} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700"><span className="inline-flex items-center gap-1"><Pencil className="h-3 w-3" />Edit</span></button><button onClick={async()=>{if(!confirm('Delete module?')) return;await deleteModule(m.id).unwrap();await refetchCurriculum();}} className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs text-rose-700">Delete</button></div>{[...(m.lessons ?? [])].sort((a,b)=>a.orderIndex-b.orderIndex).map((l)=><div key={l.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"><div><p className="text-sm text-slate-700">{l.orderIndex}. {l.title}</p><p className="text-xs uppercase text-slate-500">{l.type}</p></div><div className="flex items-center gap-2"><button onClick={async()=>{const t=prompt('Lesson title',l.title);if(!t)return;const d=prompt('Lesson description',l.description ?? '') ?? '';await updateLesson({lessonId:l.id,body:{title:t,description:d,type:l.type as LessonType}}).unwrap();await refetchCurriculum();}} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700"><span className="inline-flex items-center gap-1"><Pencil className="h-3 w-3" />Edit</span></button><button onClick={async()=>{if(!confirm('Delete lesson?'))return;await deleteLesson(l.id).unwrap();await refetchCurriculum();}} className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs text-rose-700">Delete</button></div></div>)}</div>}</div>;})}</div>}
              {curriculumCourseId && activeTab === 'assignments' && <div className="mt-3 max-h-[58vh] space-y-2 overflow-y-auto pr-1">{assignmentsList.map((a)=><div key={a.id} className="rounded-lg border border-slate-200 bg-white p-3"><div className="flex items-center justify-between"><p className="text-sm font-semibold text-slate-900">{a.title}</p><div className="flex items-center gap-2"><button onClick={async()=>{const t=prompt('Title',a.title);if(!t)return;const d=prompt('Description',a.description) ?? '';const i=prompt('Instructions',a.instructions) ?? '';await updateAssignment({assignmentId:a.id,courseId:curriculumCourseId,body:{courseId:curriculumCourseId,title:t,description:d,instructions:i,type:a.type}}).unwrap();await refetchAssignments();}} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700"><span className="inline-flex items-center gap-1"><Pencil className="h-3 w-3" />Edit</span></button>{a.status==='draft' && <button onClick={async()=>{await publishAssignment({assignmentId:a.id,courseId:curriculumCourseId}).unwrap();await refetchAssignments();}} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">Publish</button>}<button onClick={async()=>{setSelectedAssignmentId(selectedAssignmentId===a.id?null:a.id);setSelectedProjectId(null);}} className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs text-blue-700">Submissions</button><button onClick={async()=>{if(!confirm('Delete assignment?'))return;await deleteAssignment({assignmentId:a.id,courseId:curriculumCourseId}).unwrap();await refetchAssignments();}} className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs text-rose-700">Delete</button></div></div><p className="mt-1 text-xs text-slate-500">{a.description}</p><div className="mt-2 flex items-center justify-between text-[11px] uppercase text-slate-400"><span>{a.type}</span><span>{a.status}</span></div>{selectedAssignmentId===a.id && <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">{assignmentSubmissions.length===0 ? <p className="text-xs text-slate-500">No member submissions yet.</p> : assignmentSubmissions.map((sub)=><div key={sub.id} className="rounded-md border border-slate-200 bg-white p-2"><p className="text-xs font-semibold text-slate-700">Member: {sub.userId}</p><p className="text-xs text-slate-500 mt-1 line-clamp-2">{sub.content || 'No content'}</p><p className="text-[11px] text-slate-400 mt-1">Status: {sub.status}</p></div>)}</div>}</div>)}{assignmentsList.length===0 && <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-500">No assignments.</div>}</div>}
              {curriculumCourseId && activeTab === 'projects' && <div className="mt-3 max-h-[58vh] space-y-2 overflow-y-auto pr-1">{projectsList.map((p)=><div key={p.id} className="rounded-lg border border-slate-200 bg-white p-3"><div className="flex items-center justify-between"><p className="text-sm font-semibold text-slate-900">{p.title}</p><div className="flex items-center gap-2"><button onClick={async()=>{const t=prompt('Title',p.title);if(!t)return;const d=prompt('Description',p.description) ?? '';const r=prompt('Requirements',p.requirements) ?? '';await updateProject({projectId:p.id,courseId:curriculumCourseId,body:{courseId:curriculumCourseId,title:t,description:d,requirements:r,type:p.type}}).unwrap();await refetchProjects();}} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700"><span className="inline-flex items-center gap-1"><Pencil className="h-3 w-3" />Edit</span></button>{p.status==='draft' && <button onClick={async()=>{await publishProject({projectId:p.id,courseId:curriculumCourseId}).unwrap();await refetchProjects();}} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">Publish</button>}<button onClick={async()=>{setSelectedProjectId(selectedProjectId===p.id?null:p.id);setSelectedAssignmentId(null);}} className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs text-blue-700">Submissions</button><button onClick={async()=>{if(!confirm('Delete project?'))return;await deleteProject({projectId:p.id,courseId:curriculumCourseId}).unwrap();await refetchProjects();}} className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs text-rose-700">Delete</button></div></div><p className="mt-1 text-xs text-slate-500">{p.description}</p><div className="mt-2 flex items-center justify-between text-[11px] uppercase text-slate-400"><span>{p.type}</span><span>{p.status}</span></div>{selectedProjectId===p.id && <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">{projectTeams.length===0 ? <p className="text-xs text-slate-500">No project submissions yet.</p> : projectTeams.map((team)=><div key={team.id} className="rounded-md border border-slate-200 bg-white p-2"><p className="text-xs font-semibold text-slate-700">{team.name}</p><p className="text-[11px] text-slate-400 mt-1">Status: {team.status}</p><p className="text-xs text-slate-500 mt-1 line-clamp-2">{team.submissionContent || 'No submission content'}</p></div>)}</div>}</div>)}{projectsList.length===0 && <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-500">No projects.</div>}</div>}
            </aside>
          </div>
        </main>
      </div>

      {createOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-3"><h2 className="text-lg font-semibold text-slate-900">Create Course</h2><select value={courseForm.clubId} onChange={(e)=>setCourseForm({...courseForm,clubId:e.target.value})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"><option value="">Select club</option>{clubs.map((c)=><option key={c.id} value={c.id}>{c.name}</option>)}</select><input value={courseForm.title} onChange={(e)=>setCourseForm({...courseForm,title:e.target.value})} placeholder="Title" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /><textarea value={courseForm.description} onChange={(e)=>setCourseForm({...courseForm,description:e.target.value})} placeholder="Description" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /><div className="grid grid-cols-2 gap-2"><select value={courseForm.level} onChange={(e)=>setCourseForm({...courseForm,level:e.target.value as CourseLevel})} className="rounded-lg border border-slate-300 px-3 py-2 text-sm"><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select><select value={courseForm.status} onChange={(e)=>setCourseForm({...courseForm,status:e.target.value as CourseStatus})} className="rounded-lg border border-slate-300 px-3 py-2 text-sm"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></div><input value={courseForm.duration} onChange={(e)=>setCourseForm({...courseForm,duration:e.target.value})} placeholder="Duration (hours)" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /><input value={courseForm.thumbnail} onChange={(e)=>setCourseForm({...courseForm,thumbnail:e.target.value})} placeholder="Thumbnail URL (https://...)" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /><div className="flex gap-2"><button onClick={()=>setCreateOpen(false)} className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm">Cancel</button><button onClick={async()=>{try{if(!courseForm.clubId||!courseForm.title.trim()||!courseForm.description.trim()){showToast('Select a club and fill title/description.');return;}const parsedDuration=courseForm.duration.trim()===''?undefined:Number(courseForm.duration);if(parsedDuration!==undefined&&(!Number.isFinite(parsedDuration)||parsedDuration<0)){showToast('Duration must be a valid non-negative number.');return;}await createCourse({clubId:courseForm.clubId,title:courseForm.title.trim(),description:courseForm.description.trim(),level:courseForm.level,status:courseForm.status,duration:parsedDuration,thumbnail:courseForm.thumbnail||undefined}).unwrap();setCourseForm(initialCourseForm);setCreateOpen(false);await refetch();showToast('Course created successfully.');}catch(error){const apiError=error as {data?:{message?:string|string[]}};const rawMessage=apiError?.data?.message;const message=Array.isArray(rawMessage)?rawMessage.join(', '):rawMessage||'Failed to create course';showToast(message);}}} className="flex-1 rounded-lg bg-blue-900 px-4 py-2 text-sm text-white">Create</button></div></div></div>}

      {currentEditingCourse && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-3"><h2 className="text-lg font-semibold text-slate-900">Edit Course</h2><input value={currentEditingCourse.title} onChange={(e)=>updateCourse({id:currentEditingCourse.id,body:{title:e.target.value}})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /><textarea value={currentEditingCourse.description} onChange={(e)=>updateCourse({id:currentEditingCourse.id,body:{description:e.target.value}})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /><div className="flex gap-2"><button onClick={()=>setEditingCourseId(null)} className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm">Close</button><button onClick={async()=>{await refetch();setEditingCourseId(null);showToast('Course updated.');}} className="flex-1 rounded-lg bg-blue-900 px-4 py-2 text-sm text-white">Done</button></div></div></div>}

      {addAssignmentOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-3"><h2 className="text-lg font-semibold text-slate-900">Create Assignment</h2><input value={assignmentForm.title} onChange={(e)=>setAssignmentForm({...assignmentForm,title:e.target.value})} placeholder="Assignment title" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /><textarea value={assignmentForm.description} onChange={(e)=>setAssignmentForm({...assignmentForm,description:e.target.value})} placeholder="Description" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /><textarea value={assignmentForm.instructions} onChange={(e)=>setAssignmentForm({...assignmentForm,instructions:e.target.value})} placeholder="Instructions" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /><select value={assignmentForm.type} onChange={(e)=>setAssignmentForm({...assignmentForm,type:e.target.value as 'individual' | 'group'})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"><option value="individual">Individual</option><option value="group">Group</option></select><div className="flex gap-2"><button onClick={()=>{setAddAssignmentOpen(false);setAssignmentForm(initialAssignmentForm);}} className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm">Cancel</button><button onClick={createAssignmentFromModal} className="flex-1 rounded-lg bg-blue-900 px-4 py-2 text-sm text-white">Create</button></div></div></div>}

      {addModuleOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl space-y-3"><h2 className="text-lg font-semibold text-slate-900">Add Module</h2><input value={moduleForm.title} onChange={(e)=>setModuleForm({...moduleForm,title:e.target.value})} placeholder="Module title" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /><textarea value={moduleForm.description} onChange={(e)=>setModuleForm({...moduleForm,description:e.target.value})} placeholder="Description" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /><div className="flex gap-2"><button onClick={()=>setAddModuleOpen(false)} className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm">Cancel</button><button onClick={async()=>{try{if(!curriculumCourseId){showToast('Select a course first.');return;}if(moduleForm.title.trim().length<3){showToast('Module title must be at least 3 characters.');return;}await createModule({courseId:curriculumCourseId,body:{title:moduleForm.title.trim(),description:moduleForm.description||undefined,orderIndex:(curriculum?.modules?.length??0)+1}}).unwrap();setModuleForm({title:'',description:'',duration:''});setAddModuleOpen(false);await refetchCurriculum();showToast('Module added successfully.');}catch(error){const apiError=error as {data?:{message?:string|string[]}};const rawMessage=apiError?.data?.message;const message=Array.isArray(rawMessage)?rawMessage.join(', '):rawMessage||'Failed to add module';showToast(message);}}} className="flex-1 rounded-lg bg-blue-900 px-4 py-2 text-sm text-white">Add</button></div></div></div>}
      {addLessonOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl space-y-3"><h2 className="text-lg font-semibold text-slate-900">Add Lesson</h2><select value={lessonForm.moduleId} onChange={(e)=>setLessonForm({...lessonForm,moduleId:e.target.value})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"><option value="">Select module</option>{(curriculum?.modules??[]).map((m)=><option key={m.id} value={m.id}>{m.orderIndex}. {m.title}</option>)}</select><input value={lessonForm.title} onChange={(e)=>setLessonForm({...lessonForm,title:e.target.value})} placeholder="Lesson title" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /><select value={lessonContentType} onChange={(e)=>setLessonContentType(e.target.value as 'text'|'video'|'file'|'external_link')} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"><option value="text">Text</option><option value="video">Video URL</option><option value="file">File URL (pdf/doc/ppt)</option><option value="external_link">External Link</option></select>{lessonContentType==='external_link' && <input value={lessonContentLinkTitle} onChange={(e)=>setLessonContentLinkTitle(e.target.value)} placeholder="Link title" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />}{lessonContentType==='text' ? <textarea value={lessonContentValue} onChange={(e)=>setLessonContentValue(e.target.value)} placeholder="Text content" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /> : <input value={lessonContentValue} onChange={(e)=>setLessonContentValue(e.target.value)} placeholder={lessonContentType==='video'?'Video URL':lessonContentType==='file'?'File URL (pdf/doc/ppt)':'External URL'} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />}<div className="flex gap-2"><button onClick={()=>setAddLessonOpen(false)} className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm">Cancel</button><button onClick={async()=>{try{if(!lessonForm.moduleId){showToast('Select a module first.');return;}if(lessonForm.title.trim().length<3){showToast('Lesson title must be at least 3 characters.');return;}if(!lessonContentValue.trim()){showToast('Provide lesson content.');return;}const mod=(curriculum?.modules??[]).find((m)=>m.id===lessonForm.moduleId);const contentPayload=lessonContentType==='text'?{type:'text' as const,orderIndex:1,content:lessonContentValue.trim()}:lessonContentType==='external_link'?{type:'external_link' as const,orderIndex:1,linkTitle:lessonContentLinkTitle.trim() || 'Resource',linkUrl:lessonContentValue.trim()}:{type:lessonContentType as 'video'|'file',orderIndex:1,url:lessonContentValue.trim()};await createLesson({moduleId:lessonForm.moduleId,body:{title:lessonForm.title.trim(),type:lessonForm.type,description:lessonForm.description||undefined,orderIndex:(mod?.lessons?.length??0)+1,contents:[contentPayload]}}).unwrap();setLessonForm((prev)=>({...prev,title:'',description:'',duration:''}));setLessonContentValue('');setLessonContentLinkTitle('');setLessonContentType('text');setAddLessonOpen(false);await refetchCurriculum();showToast('Lesson added successfully.');}catch(error){const apiError=error as {data?:{message?:string|string[]}};const rawMessage=apiError?.data?.message;const message=Array.isArray(rawMessage)?rawMessage.join(', '):rawMessage||'Failed to add lesson';showToast(message);}}} className="flex-1 rounded-lg bg-blue-900 px-4 py-2 text-sm text-white">Add</button></div></div></div>}
    </div>
  );
}
