import { Menu } from 'lucide-react';
import { useMemo, useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import MobileSidebarDrawer from '@/components/layout/MobileSidebarDrawer';
import { clubs as baseClubs } from '@/data/clubs';

export default function AdminDashboardPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const stats = useMemo(() => {
    const leaderApplications = (() => {
      try {
        const raw = localStorage.getItem('leaderApplications');
        return raw ? (JSON.parse(raw) as { status: string }[]) : [];
      } catch {
        return [];
      }
    })();
    const leaderCredentials = (() => {
      try {
        const raw = localStorage.getItem('leaderCredentials');
        return raw ? (JSON.parse(raw) as { email: string }[]) : [];
      } catch {
        return [];
      }
    })();
    const students = (() => {
      try {
        const raw = localStorage.getItem('studentMembers');
        return raw ? (JSON.parse(raw) as { email: string }[]) : [];
      } catch {
        return [];
      }
    })();
    const leaderCreatedClubs = (() => {
      try {
        const raw = localStorage.getItem('leaderCreatedClubs');
        return raw ? (JSON.parse(raw) as { id: number }[]) : [];
      } catch {
        return [];
      }
    })();
    return {
      totalClubs: baseClubs.length + leaderCreatedClubs.length,
      pendingApplications: leaderApplications.filter((app) => app.status === 'pending').length,
      approvedLeaders: leaderCredentials.length,
      studentCount: students.length
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-slate-100">
      <div className="flex min-h-screen">
        <AdminSidebar active="dashboard" />
        <MobileSidebarDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Admin Menu">
          <AdminSidebar active="dashboard" variant="mobile" />
        </MobileSidebarDrawer>

        <main className="flex-1 px-5 py-6 lg:px-8 lg:ml-64">
          <div className="flex items-center justify-between gap-4 lg:hidden">
            <button
              onClick={() => setDrawerOpen(true)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-600"
            >
              <Menu className="h-5 w-5" />
            </button>
            <p className="text-sm font-semibold text-slate-700">Admin Dashboard</p>
          </div>

          <div className="mt-6">
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">Admin Overview</h1>
            <p className="text-sm text-slate-500 mt-2">
              Monitor applications, user growth, and club health.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              { label: 'Total Clubs', value: stats.totalClubs },
              { label: 'Pending Applications', value: stats.pendingApplications },
              { label: 'Approved Leaders', value: stats.approvedLeaders },
              { label: 'Student Members', value: stats.studentCount }
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-sm font-semibold text-slate-900">Weekly Platform Activity</p>
              <p className="text-xs text-slate-500">Simulated engagement report</p>
              <div className="mt-6 h-44 w-full">
                <svg viewBox="0 0 400 140" className="w-full h-full">
                  <path
                    d="M10 110 C60 40, 120 60, 160 90 C200 120, 230 60, 260 70 C300 85, 330 40, 390 60"
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="3"
                  />
                  <path
                    d="M10 110 C60 40, 120 60, 160 90 C200 120, 230 60, 260 70 C300 85, 330 40, 390 60 L390 130 L10 130 Z"
                    fill="rgba(37,99,235,0.1)"
                  />
                </svg>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-sm font-semibold text-slate-900">Quick Actions</p>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <button className="w-full rounded-lg border border-slate-200 px-3 py-2 text-left hover:bg-slate-50">
                  Review pending applications
                </button>
                <button className="w-full rounded-lg border border-slate-200 px-3 py-2 text-left hover:bg-slate-50">
                  Check new clubs
                </button>
                <button className="w-full rounded-lg border border-slate-200 px-3 py-2 text-left hover:bg-slate-50">
                  Export user report
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
