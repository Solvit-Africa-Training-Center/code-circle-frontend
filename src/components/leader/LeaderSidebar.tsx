import {
  ClipboardCheck,
  BookOpen,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  MessagesSquare,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CodeCircleLogo from '@/components/common/CodeCircleLogo';

type LeaderSidebarProps = {
  active:
    | 'dashboard'
    | 'members'
    | 'projects'
    | 'club'
    | 'create'
    | 'courses'
    | 'assignments'
    | 'team-chat';
  variant?: 'desktop' | 'mobile';
};

export default function LeaderSidebar({ active, variant = 'desktop' }: LeaderSidebarProps) {
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
            onClick={() => navigate('/leader/dashboard')}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </button>
          <button
            className={active === 'members' ? activeItem : baseItem}
            onClick={() => navigate('/leader/members')}
          >
            <Users className="h-4 w-4" />
            Members
          </button>
          <button
            className={active === 'club' ? activeItem : baseItem}
            onClick={() => navigate('/leader/club')}
          >
            <FolderKanban className="h-4 w-4" />
            My Club
          </button>
          <button
            className={active === 'projects' ? activeItem : baseItem}
            onClick={() => navigate('/leader/projects')}
          >
            <FolderKanban className="h-4 w-4" />
            Projects
          </button>
          <button
            className={active === 'courses' ? activeItem : baseItem}
            onClick={() => navigate('/leader/courses')}
          >
            <BookOpen className="h-4 w-4" />
            Courses
          </button>
          <button
            className={active === 'assignments' ? activeItem : baseItem}
            onClick={() => navigate('/leader/assignments')}
          >
            <ClipboardCheck className="h-4 w-4" />
            Assignments
          </button>
          <button
            className={active === 'team-chat' ? activeItem : baseItem}
            onClick={() => navigate('/leader/team-chat')}
          >
            <MessagesSquare className="h-4 w-4" />
            Team Chat
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
