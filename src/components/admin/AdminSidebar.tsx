import {
  BarChart3,
  Users,
  FolderKanban,
  ClipboardCheck,
  LayoutDashboard,
  LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CodeCircleLogo from '@/components/common/CodeCircleLogo';

type AdminSidebarProps = {
  active: 'dashboard' | 'reports' | 'users' | 'clubs' | 'applications';
  variant?: 'desktop' | 'mobile';
};

export default function AdminSidebar({ active, variant = 'desktop' }: AdminSidebarProps) {
  const navigate = useNavigate();

  const baseItem =
    'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-blue-100 hover:bg-blue-800';
  const activeItem = 'w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-white text-blue-900 font-medium';
  const containerClass =
    variant === 'desktop'
      ? 'hidden lg:flex lg:w-64 lg:flex-col lg:justify-between bg-blue-900 text-white border-r border-blue-900 px-6 py-6 fixed left-0 top-0 h-screen'
      : 'flex w-full flex-col justify-between text-white';

  return (
    <aside className={containerClass}>
      <div>
        <CodeCircleLogo className="text-blue-100" />
        <nav className="mt-10 space-y-2 text-sm">
          <button
            className={active === 'dashboard' ? activeItem : baseItem}
            onClick={() => navigate('/admin/dashboard')}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </button>
          <button
            className={active === 'reports' ? activeItem : baseItem}
            onClick={() => navigate('/admin/reports')}
          >
            <BarChart3 className="h-4 w-4" />
            Reports
          </button>
          <button
            className={active === 'users' ? activeItem : baseItem}
            onClick={() => navigate('/admin/users')}
          >
            <Users className="h-4 w-4" />
            User Management
          </button>
          <button
            className={active === 'clubs' ? activeItem : baseItem}
            onClick={() => navigate('/admin/clubs')}
          >
            <FolderKanban className="h-4 w-4" />
            All Clubs
          </button>
          <button
            className={active === 'applications' ? activeItem : baseItem}
            onClick={() => navigate('/admin/applications')}
          >
            <ClipboardCheck className="h-4 w-4" />
            Leader Applications
          </button>
        </nav>
      </div>
      <button
        className="w-full rounded-lg border border-blue-700 px-4 py-2 text-sm text-blue-100 hover:bg-blue-800"
        onClick={() => {
          localStorage.removeItem('authUser');
          navigate('/login');
        }}
      >
        <span className="inline-flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          Logout
        </span>
      </button>
    </aside>
  );
}
