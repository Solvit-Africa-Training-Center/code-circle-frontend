import { type ReactNode, useMemo, useState } from 'react';
import { Menu } from 'lucide-react';
import StudentSidebar from '@/components/student/StudentSidebar';
import MobileSidebarDrawer from '@/components/layout/MobileSidebarDrawer';

type MemberPageLayoutProps = {
  children: ReactNode;
};

export default function MemberPageLayout({ children }: MemberPageLayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMember = useMemo(() => {
    try {
      const raw = localStorage.getItem('authUser');
      if (!raw) return false;
      const parsed = JSON.parse(raw) as { role?: string };
      return parsed.role === 'MEMBER';
    } catch {
      return false;
    }
  }, []);

  if (!isMember) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen w-full bg-slate-100">
      <div className="flex min-h-screen">
        <StudentSidebar />
        <MobileSidebarDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Student Menu">
          <StudentSidebar variant="mobile" />
        </MobileSidebarDrawer>
        <button
          onClick={() => setDrawerOpen(true)}
          className="fixed left-4 top-4 z-50 rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-600 lg:hidden"
          aria-label="Open student sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <main className="flex-1 lg:ml-64">{children}</main>
      </div>
    </div>
  );
}
