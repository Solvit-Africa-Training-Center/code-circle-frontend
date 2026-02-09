import { Menu } from 'lucide-react';
import { useMemo, useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import MobileSidebarDrawer from '@/components/layout/MobileSidebarDrawer';
import { clubs as baseClubs } from '@/data/clubs';

export default function AdminClubsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const clubs = useMemo(() => {
    const leaderCreated = (() => {
      try {
        const raw = localStorage.getItem('leaderCreatedClubs');
        return raw ? (JSON.parse(raw) as typeof baseClubs) : [];
      } catch {
        return [];
      }
    })();
    return [...leaderCreated, ...baseClubs];
  }, []);

  return (
    <div className="min-h-screen w-full bg-slate-100">
      <div className="flex min-h-screen">
        <AdminSidebar active="clubs" />
        <MobileSidebarDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Admin Menu">
          <AdminSidebar active="clubs" variant="mobile" />
        </MobileSidebarDrawer>

        <main className="flex-1 px-5 py-6 lg:px-8 lg:ml-64">
          <div className="flex items-center justify-between gap-4 lg:hidden">
            <button
              onClick={() => setDrawerOpen(true)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-600"
            >
              <Menu className="h-5 w-5" />
            </button>
            <p className="text-sm font-semibold text-slate-700">All Clubs</p>
          </div>

          <div className="mt-6">
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">All Clubs</h1>
            <p className="text-sm text-slate-500 mt-2">
              Review active clubs and their categories.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {clubs.map((club) => (
              <div key={club.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{club.category}</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{club.name}</p>
                <p className="text-sm text-slate-600 mt-2">{club.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {club.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
