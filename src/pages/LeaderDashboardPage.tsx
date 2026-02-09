import { CalendarCheck, ChartLine, ClipboardCheck, FolderKanban, Search, Users, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LeaderSidebar from '../components/leader/LeaderSidebar';
import LeaderNotificationsBell from '../components/leader/LeaderNotificationsBell';
import CodeCircleLogo from '@/components/common/CodeCircleLogo';

export default function LeaderDashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-slate-100">
      <div className="flex min-h-screen">
        <LeaderSidebar active="dashboard" />

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
                <input
                  className="w-full outline-none"
                  placeholder="Search projects, members or assignments..."
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="rounded-lg bg-blue-900 px-3 py-2 text-sm text-white hover:bg-blue-800">
                <span className="inline-flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4" />
                  Schedule Meeting
                </span>
              </button>
              <button className="rounded-lg bg-blue-900 px-3 py-2 text-sm text-white hover:bg-blue-800">
                <span className="inline-flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Assignment
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
              Welcome back, Eric!
            </h1>
            <p className="text-sm text-slate-500">
              Here is the latest pulse of the fullstack innovators club
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/leader/club')}
                className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
              >
                View My Club
              </button>
              <button
                onClick={() => navigate('/leader/clubs/new')}
                className="rounded-full bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Create Club
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Engagement Rate', value: '84.2%', delta: '+12%', icon: ChartLine },
              { label: 'Active Projects', value: '12', delta: '+2 Projects', icon: FolderKanban },
              { label: 'New Members', value: '25', delta: '+8%', icon: Users }
            ].map((stat) => (
              <div key={stat.label} className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="inline-flex items-center gap-2">
                    <stat.icon className="h-4 w-4 text-blue-600" />
                    {stat.label}
                  </span>
                  <span className="text-blue-600 font-medium">{stat.delta}</span>
                </div>
                <p className="mt-3 text-2xl font-semibold text-slate-900">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Chart + Status */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Week Engagement Trend</p>
                  <p className="text-xs text-slate-500">Active members contributing per day</p>
                </div>
                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Last 7 Days</span>
              </div>
              <div className="mt-6 h-40 w-full">
                <svg viewBox="0 0 400 140" className="w-full h-full">
                  <path
                    d="M10 110 C40 60, 80 60, 110 90 C140 120, 180 30, 220 70 C260 110, 300 80, 330 60 C350 50, 370 60, 390 70"
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="3"
                  />
                  <path
                    d="M10 110 C40 60, 80 60, 110 90 C140 120, 180 30, 220 70 C260 110, 300 80, 330 60 C350 50, 370 60, 390 70 L390 130 L10 130 Z"
                    fill="rgba(37,99,235,0.08)"
                  />
                </svg>
              </div>
              <div className="mt-2 flex justify-between text-[10px] text-slate-400">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <p className="text-sm font-semibold text-slate-900 inline-flex items-center gap-2">
                <ChartLine className="h-4 w-4 text-blue-600" />
                Project Status
              </p>
              <div className="mt-5 space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-2">
                    <span>In Review</span>
                    <span>14 Projects</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full w-2/3 bg-blue-600"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-2">
                    <span>Completed</span>
                    <span>10 Projects</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full w-1/2 bg-emerald-500"></div>
                  </div>
                </div>
                <div className="pt-4 text-xs text-slate-500 flex justify-between">
                  <span>Target completion</span>
                  <span className="text-slate-700">82% achieved</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tasks + Featured */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1.1fr_1.5fr] gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900 inline-flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4 text-blue-600" />
                  Action Required
                </p>
                <span className="text-[10px] text-rose-600 bg-rose-50 px-2 py-1 rounded-full">3 Urgent</span>
              </div>
              <div className="mt-4 space-y-3">
                {[
                  { title: 'Project review', sub: 'Preview UI v2.3', time: '2 days ago' },
                  { title: 'Member request', sub: 'Alex wants to join club', time: '5 hrs ago' },
                  { title: 'Assignment feedback', sub: 'Review submissions', time: 'Just now' }
                ].map((task) => (
                  <div key={task.title} className="border border-slate-100 rounded-lg p-3 hover:bg-slate-50">
                    <p className="text-sm font-medium text-slate-900">{task.title}</p>
                    <p className="text-xs text-slate-500">{task.sub}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{task.time}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900 inline-flex items-center gap-2">
                  <FolderKanban className="h-4 w-4 text-blue-600" />
                  Featured Projects
                </p>
                <button className="text-xs text-blue-600 inline-flex items-center gap-1">
                  <Plus className="h-3 w-3" />
                  View Gallery
                </button>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-lg bg-gradient-to-br from-blue-600 to-sky-400 text-white p-4 h-24 flex items-end">
                  <p className="text-xs font-medium">AI Chatbot Engine</p>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-emerald-600 to-lime-400 text-white p-4 h-24 flex items-end">
                  <p className="text-xs font-medium">Eco-track Dashboard</p>
                </div>
                <div className="rounded-lg border border-dashed border-slate-300 text-slate-500 p-4 h-24 flex items-center justify-center text-xs">
                  + Launch project
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
