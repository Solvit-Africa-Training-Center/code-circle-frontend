import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, UserCircle2, GraduationCap } from 'lucide-react';
import CodeCircleLogo from '@/components/common/CodeCircleLogo';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/student/dashboard' },
  { label: 'My Clubs', icon: Users, path: '/student/clubs' },
  { label: 'Profile', icon: UserCircle2, path: '/student/profile' },
];

type StudentSidebarProps = {
  variant?: 'desktop' | 'mobile';
};

export default function StudentSidebar({ variant = 'desktop' }: StudentSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const containerClass =
    variant === 'desktop'
      ? 'hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 bg-blue-900 text-white border-r border-blue-900 px-6 py-6'
      : 'flex flex-col text-white';

  return (
    <aside className={containerClass}>
      <div className="flex items-center gap-2 text-blue-100">
        
        <CodeCircleLogo className="text-blue-100" />
      </div>

      <nav className="mt-8 flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                isActive
                  ? 'bg-white text-blue-900'
                  : 'text-blue-100 hover:bg-blue-800'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
        <div className="mt-4 rounded-xl border border-dashed border-blue-700 px-3 py-3 text-xs text-blue-100/80">
          Courses and projects dashboards are coming next.
        </div>
      </nav>

      <div className="mt-6 rounded-2xl bg-white/10 text-white p-4">
        <p className="text-sm font-semibold">Boost your learning</p>
        <p className="text-xs text-blue-100 mt-1">
          Join a new club and collaborate on real projects.
        </p>
        <Link
          to="/clubs"
          className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-white/15 px-3 py-2 text-xs font-semibold text-white hover:bg-white/25"
        >
          Explore Clubs
        </Link>
      </div>

      <button
        className="mt-6 w-full rounded-lg border border-blue-700 px-4 py-2 text-sm text-blue-100 hover:bg-blue-800"
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
