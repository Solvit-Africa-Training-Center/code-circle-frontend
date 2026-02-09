import { useMemo } from 'react';
import { Search } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import LeaderSidebar from '../components/leader/LeaderSidebar';
import LeaderNotificationsBell from '../components/leader/LeaderNotificationsBell';
import CodeCircleLogo from '@/components/common/CodeCircleLogo';

type CreatedClub = {
  id: number;
  name: string;
  category: string;
  description: string;
  image: string;
};

export default function LeaderClubDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const clubId = Number(id);

  const createdClubs: CreatedClub[] = useMemo(() => {
    try {
      const stored = localStorage.getItem('leaderCreatedClubs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);

  const projectCounts = useMemo(() => {
    try {
      const stored = localStorage.getItem('leaderProjects');
      const projects = stored ? JSON.parse(stored) : [];
      return projects.reduce((acc: Record<number, number>, project: { clubId: number }) => {
        if (project.clubId) {
          acc[project.clubId] = (acc[project.clubId] || 0) + 1;
        }
        return acc;
      }, {});
    } catch {
      return {};
    }
  }, []);

  const club = createdClubs.find((item) => item.id === clubId);

  return (
    <div className="min-h-screen w-full bg-slate-100">
      <div className="flex min-h-screen">
        <LeaderSidebar active="club" />

        <main className="flex-1 px-5 py-6 lg:px-8 lg:ml-64">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="lg:hidden">
              <CodeCircleLogo className="text-blue-700" />
            </div>
            <div className="flex-1 md:max-w-xl">
              <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-500">
                <Search className="h-4 w-4 text-slate-400" />
                <input className="w-full outline-none" placeholder="Search club resources..." />
              </div>
            </div>
            <div className="flex items-center gap-3">
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

          <div className="mt-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">Club Details</h1>
              <p className="text-sm text-slate-500 mt-1">Manage and review your club details.</p>
            </div>
            <button
              onClick={() => navigate('/leader/club')}
              className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Back to My Clubs
            </button>
          </div>

          {!club ? (
            <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
              This club could not be found. Try selecting a club from your created list.
            </div>
          ) : (
            <div className="mt-6 bg-white border border-slate-200 rounded-2xl overflow-hidden">
              {club.image ? (
                <img src={club.image} alt={club.name} className="h-60 w-full object-cover" />
              ) : (
                <div className="h-60 w-full bg-slate-100 flex items-center justify-center text-slate-400">
                  No Image
                </div>
              )}
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-blue-900">{club.name}</h2>
                    <p className="text-sm text-slate-500 mt-1">{club.category}</p>
                  </div>
                  <button
                    onClick={() => navigate('/leader/projects')}
                    className="rounded-full bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    Add Project
                  </button>
                </div>

                <p className="text-sm text-slate-600 mt-4">{club.description}</p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-xl bg-slate-50 p-4 text-center">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Members</p>
                    <p className="text-lg font-semibold text-slate-900">0</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4 text-center">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Projects</p>
                    <p className="text-lg font-semibold text-slate-900">{projectCounts[club.id] || 0}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4 text-center">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Modules</p>
                    <p className="text-lg font-semibold text-slate-900">0</p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={() => navigate('/leader/members')}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Manage Members
                  </button>
                  <button
                    onClick={() => navigate('/leader/projects')}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Manage Projects
                  </button>
                  <button
                    onClick={() => navigate(`/clubs/${club.id}`)}
                    className="rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    View Public Page
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
