import {
  CalendarCheck,
  MessageSquare,
  MoreVertical,
  Plus,
  Search,
  ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LeaderSidebar from '../components/leader/LeaderSidebar';
import LeaderNotificationsBell from '../components/leader/LeaderNotificationsBell';
import CodeCircleLogo from '@/components/common/CodeCircleLogo';

const members = [
  {
    name: 'Sarah UMUTON',
    email: 'sarah@codecircle.com',
    skills: ['React', 'Node.js'],
    role: 'Member',
    score: 642,
    canPromote: false
  },
  {
    name: 'David Chen',
    email: 'david@codecircle.com',
    skills: ['Python', 'PyTorch'],
    role: 'Senior Member',
    score: 785,
    canPromote: true
  },
  {
    name: 'David Kamali',
    email: 'david@codecircle.com',
    skills: ['Go', 'Docker', 'K8s'],
    role: 'Project Leader',
    score: 851,
    canPromote: false
  },
  {
    name: 'Elena Maria',
    email: 'elena@codecircle.com',
    skills: ['Tailwind', 'Figma'],
    role: 'Member',
    score: 451,
    canPromote: true
  },
  {
    name: 'Alex Wong',
    email: 'alex@codecircle.com',
    skills: ['TypeScript', 'Next.js'],
    role: 'New Member',
    score: 315,
    canPromote: true
  }
];

export default function LeaderMembersPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-slate-100">
      <div className="flex min-h-screen">
        <LeaderSidebar active="members" />

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
                <input className="w-full outline-none" placeholder="Search members by name or skill" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="rounded-lg bg-blue-900 px-3 py-2 text-sm text-white hover:bg-blue-800">
                <span className="inline-flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4" />
                  Invite Member
                </span>
              </button>
              <button className="rounded-lg bg-blue-900 px-3 py-2 text-sm text-white hover:bg-blue-800">
                <span className="inline-flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Member
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
              Member Management
            </h1>
            <p className="text-sm text-slate-500">
              Oversee your club talent and contribution levels.
            </p>
          </div>

          {/* Summary */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Total Members</span>
                <span className="text-blue-600 font-medium">+15 this month</span>
              </div>
              <p className="mt-3 text-2xl font-semibold text-slate-900">154</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Active Now</span>
                <span className="text-blue-600 font-medium">85% active</span>
              </div>
              <p className="mt-3 text-2xl font-semibold text-slate-900">132</p>
            </div>
          </div>

          {/* Table */}
          <div className="mt-6 bg-white border border-blue-200 rounded-xl">
            <div className="grid grid-cols-[2.2fr_2.2fr_1.4fr_2.2fr_0.8fr] gap-4 text-xs text-slate-400 font-semibold px-6 py-3 border-b border-slate-100 text-left">
              <span>Member Name</span>
              <span>Verified Skills</span>
              <span>Club Role</span>
              <span>Contribution Score</span>
              <span>Actions</span>
            </div>
            <div className="divide-y divide-slate-100">
              {members.map((member) => (
                <div key={member.name} className="grid grid-cols-[2.2fr_2.2fr_1.4fr_2.2fr_0.8fr] gap-4 items-center px-6 py-4 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-slate-200"></div>
                    <div>
                      <p className="font-medium text-slate-900">{member.name}</p>
                      <p className="text-xs text-slate-400">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {member.skills.map((skill) => (
                      <span key={skill} className="px-2 py-1 rounded-full bg-blue-50 text-blue-600 text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-slate-900 font-medium">{member.role}</span>
                    <span className="text-xs text-slate-400">Club role</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Score</span>
                      <span className="text-slate-700 font-medium">{member.score}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-blue-600"
                        style={{ width: `${Math.min(100, Math.round(member.score / 10))}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-start gap-2 text-xs text-slate-600">
                    {member.canPromote ? (
                      <button className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-medium hover:bg-slate-50">
                        Promote
                      </button>
                    ) : (
                      <span className="inline-block w-[70px]" aria-hidden="true"></span>
                    )}
                    <button className="p-1.5 hover:bg-slate-100 rounded-md">
                      <MessageSquare className="h-4 w-4" />
                    </button>
                    <button className="p-1.5 hover:bg-slate-100 rounded-md">
                      <ShieldCheck className="h-4 w-4" />
                    </button>
                    <button className="p-1.5 hover:bg-slate-100 rounded-md">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 px-6 py-4 border-t border-slate-100">
              <span>Showing 5 of 154 Members</span>
              <div className="flex gap-2">
                <button className="rounded-md border border-slate-200 px-3 py-1">Previous</button>
                <button className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1 text-blue-600">
                  Next
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
