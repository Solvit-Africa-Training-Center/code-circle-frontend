import { Menu } from 'lucide-react';
import { useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import MobileSidebarDrawer from '@/components/layout/MobileSidebarDrawer';

export default function AdminReportsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-slate-100">
      <div className="flex min-h-screen">
        <AdminSidebar active="reports" />
        <MobileSidebarDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Admin Menu">
          <AdminSidebar active="reports" variant="mobile" />
        </MobileSidebarDrawer>

        <main className="flex-1 px-5 py-6 lg:px-8 lg:ml-64">
          <div className="flex items-center justify-between gap-4 lg:hidden">
            <button
              onClick={() => setDrawerOpen(true)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-600"
            >
              <Menu className="h-5 w-5" />
            </button>
            <p className="text-sm font-semibold text-slate-700">Reports</p>
          </div>

          <div className="mt-6">
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">Reports</h1>
            <p className="text-sm text-slate-500 mt-2">
              Snapshot of platform performance and leader onboarding.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
            {[
              { label: 'New Signups', value: '128', trend: '+12%' },
              { label: 'Active Clubs', value: '24', trend: '+4%' },
              { label: 'Leader Pass Rate', value: '78%', trend: '-2%' }
            ].map((card) => (
              <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{card.label}</p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">{card.value}</p>
                <p className="text-xs text-blue-600 mt-2">{card.trend} vs last month</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">Leader Applications Status</p>
              <span className="text-xs text-slate-400">Last 30 days</span>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3 text-sm text-slate-600">
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Pending</p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">9</p>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Approved</p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">21</p>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Rejected</p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">4</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
