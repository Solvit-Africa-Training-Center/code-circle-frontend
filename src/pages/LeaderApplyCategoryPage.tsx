import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import bg1 from '@/assets/home_11.jpeg';
import bg2 from '@/assets/home_1111.jpeg';
import bg3 from '@/assets/home_11111.jpeg';
import { clubs } from '@/data/clubs';
import { getAuthUser } from '@/utils/authUser';

type CategoryCard = {
  name: string;
  count: number;
  tags: string[];
  icon?: string;
};

export default function LeaderApplyCategoryPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const categories = useMemo<CategoryCard[]>(() => {
    const grouped = new Map<string, { count: number; tags: Set<string> }>();
    clubs.forEach((club) => {
      const existing = grouped.get(club.category) ?? { count: 0, tags: new Set<string>() };
      existing.count += 1;
      club.tags.forEach((tag) => existing.tags.add(tag));
      grouped.set(club.category, existing);
    });

    const storedCategories = (() => {
      try {
        const raw = localStorage.getItem('clubCategories');
        const parsed = raw ? (JSON.parse(raw) as Array<string | { id: number; name: string; icon: string }>) : [];
        return parsed.map((item, index) =>
          typeof item === 'string'
            ? { id: Date.now() + index, name: item, icon: '🏷️' }
            : item
        );
      } catch {
        return [];
      }
    })();

    const allNames = new Set<string>([
      ...Array.from(grouped.keys()),
      ...storedCategories.map((category) => category.name)
    ]);

    return Array.from(allNames).map((name) => {
      const meta = grouped.get(name) ?? { count: 0, tags: new Set<string>() };
      const stored = storedCategories.find((category) => category.name === name);
      return {
        name,
        count: meta.count,
        tags: Array.from(meta.tags).slice(0, 4),
        icon: stored?.icon ?? '🏷️'
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const handleSelect = (category: string) => {
    setError('');
    sessionStorage.removeItem('leaderApplyResult');
    sessionStorage.removeItem('leaderApplyProtocolDone');

    const authUser = getAuthUser();
    if (authUser?.role === 'leader' && authUser.email) {
      const existingClubs = (() => {
        try {
          const raw = localStorage.getItem('leaderCreatedClubs');
          return raw ? (JSON.parse(raw) as { category?: string; leaderEmail?: string }[]) : [];
        } catch {
          return [];
        }
      })();
      const alreadyLeadsCategory = existingClubs.some(
        (club) => club.category === category && club.leaderEmail === authUser.email
      );
      if (alreadyLeadsCategory) {
        setError('You already lead a club in this category.');
        return;
      }

      const existingApps = (() => {
        try {
          const raw = localStorage.getItem('leaderApplications');
          return raw ? (JSON.parse(raw) as { email?: string; category?: string; status?: string }[]) : [];
        } catch {
          return [];
        }
      })();
      const alreadyApplied = existingApps.some(
        (app) =>
          app.email?.toLowerCase() === authUser.email?.toLowerCase() &&
          app.category === category &&
          app.status !== 'denied'
      );
      if (alreadyApplied) {
        setError('You already applied for this category.');
        return;
      }
    }

    sessionStorage.setItem('leaderApplyCategory', category);
    navigate('/leader/apply/form');
  };

  return (
    <div className="w-full overflow-x-hidden bg-white min-h-screen flex flex-col">
      <Header />

      <div className="relative w-full h-[250px] md:h-[280px] flex items-start justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-cover bg-center opacity-0 animate-fade-in-out" style={{backgroundImage: `url(${bg1})`, animationDelay: '0s'}}></div>
          <div className="absolute inset-0 bg-cover bg-center opacity-0 animate-fade-in-out" style={{backgroundImage: `url(${bg2})`, animationDelay: '4s'}}></div>
          <div className="absolute inset-0 bg-cover bg-center opacity-0 animate-fade-in-out" style={{backgroundImage: `url(${bg3})`, animationDelay: '8s'}}></div>
        </div>

        <div className="absolute inset-0 z-[1]"></div>

        <div className="relative z-10 text-left text-white w-full max-w-7xl px-5 sm:px-6 lg:px-8 pt-20">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-3 tracking-tight">Club Category</h1>
          <Link to="/" className="inline-flex items-center gap-2 text-blue-200 hover:text-white transition-colors">
            <span>«</span>
            <span>Home</span>
          </Link>
        </div>
      </div>

      <div className="flex-1 relative w-full py-12 bg-slate-100">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-blue-900">Select Club Category</h2>
            <p className="text-sm text-slate-600 mt-2">
              Choose the category you want to lead. You will submit your profile and take a leader test.
            </p>
          </div>
          {error && (
            <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {categories.map((category) => (
              <div key={category.name} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    {category.icon?.startsWith('data:') ? (
                      <img src={category.icon} alt={category.name} className="h-6 w-6 rounded-md object-cover" />
                    ) : (
                      <span className="text-base">{category.icon ?? '🏷️'}</span>
                    )}
                    {category.name}
                  </h3>
                  <span className="text-xs text-slate-500">{category.count} clubs</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {category.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-5 flex justify-end">
                  <button
                    onClick={() => handleSelect(category.name)}
                    className="px-5 py-2 rounded-full bg-blue-900 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Select
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
