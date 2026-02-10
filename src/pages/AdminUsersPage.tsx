import { Menu } from 'lucide-react';
import { useMemo, useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import MobileSidebarDrawer from '@/components/layout/MobileSidebarDrawer';

type LeaderCredential = {
  email: string;
  approvedAt: string;
};

export default function AdminUsersPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { leaders, students } = useMemo(() => {
    const leaderCredentials = (() => {
      try {
        const raw = localStorage.getItem('leaderCredentials');
        return raw ? (JSON.parse(raw) as LeaderCredential[]) : [];
      } catch {
        return [];
      }
    })();
    const studentMembers = (() => {
      try {
        const raw = localStorage.getItem('studentMembers');
        return raw ? (JSON.parse(raw) as { email: string; fullName?: string }[]) : [];
      } catch {
        return [];
      }
    })();

    return {
      leaders: leaderCredentials,
      students: studentMembers
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-slate-100">
      <div className="flex min-h-screen">
        <AdminSidebar active="users" />
        <MobileSidebarDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Admin Menu">
          <AdminSidebar active="users" variant="mobile" />
        </MobileSidebarDrawer>

        <main className="flex-1 px-5 py-6 lg:px-8 lg:ml-64">
          <div className="flex items-center justify-between gap-4 lg:hidden">
            <button
              onClick={() => setDrawerOpen(true)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-600"
            >
              <Menu className="h-5 w-5" />
            </button>
            <p className="text-sm font-semibold text-slate-700">User Management</p>
          </div>

          <div className="mt-6">
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">User Management</h1>
            <p className="text-sm text-slate-500 mt-2">
              Manage approved leaders and student members.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-sm font-semibold text-slate-900">Approved Leaders</p>
              <div className="mt-4 space-y-3">
                {leaders.length === 0 ? (
                  <p className="text-sm text-slate-500">No approved leaders yet.</p>
                ) : (
                  leaders.map((leader) => (
                    <div key={leader.email} className="rounded-lg border border-slate-100 p-3">
                      <p className="text-sm font-semibold text-slate-800">{leader.email}</p>
                      <p className="text-xs text-slate-500">Approved: {new Date(leader.approvedAt).toLocaleDateString()}</p>
                      <p className="text-xs text-slate-400 mt-1">Status: Active</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-sm font-semibold text-slate-900">Student Members</p>
              <div className="mt-4 space-y-3">
                {students.length === 0 ? (
                  <p className="text-sm text-slate-500">No students yet.</p>
                ) : (
                  students.map((student) => (
                    <div key={student.email} className="rounded-lg border border-slate-100 p-3">
                      <p className="text-sm font-semibold text-slate-800">{student.fullName || 'Student Member'}</p>
                      <p className="text-xs text-slate-500">{student.email}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
