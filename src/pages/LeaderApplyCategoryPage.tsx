import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import bg1 from '@/assets/home_11.jpeg';
import bg2 from '@/assets/home_1111.jpeg';
import bg3 from '@/assets/home_11111.jpeg';
import { getAuthUser } from '@/utils/authUser';
import { useGetActiveCategoriesQuery } from '@/features/CategoriesApi';
import type { Category } from '@/types/category';

type CategoryCard = {
  id: string;
  name: string;
  description?: string;
  icon?: string;
};

export default function LeaderApplyCategoryPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { data: apiCategories = [] } = useGetActiveCategoriesQuery();

  const categories = useMemo<CategoryCard[]>(() => {
    return [...apiCategories]
      .map((category: Category) => ({
        id: category.id,
        name: category.name,
        description: category.description,
        icon: category.icon || 'Tag',
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [apiCategories]);

  const handleSelect = (category: CategoryCard) => {
    setError('');
    sessionStorage.removeItem('leaderApplyResult');
    sessionStorage.removeItem('leaderApplyProtocolDone');
    sessionStorage.removeItem('leaderApplySession');

    const authUser = getAuthUser();
    if (authUser?.role === 'CLUB_LEADER' && authUser.email) {
      const existingClubs = (() => {
        try {
          const raw = localStorage.getItem('leaderCreatedClubs');
          return raw ? (JSON.parse(raw) as { category?: string; leaderEmail?: string }[]) : [];
        } catch {
          return [];
        }
      })();
      const alreadyLeadsCategory = existingClubs.some(
        (club) => club.category === category.name && club.leaderEmail === authUser.email,
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
          app.category === category.name &&
          app.status !== 'denied',
      );
      if (alreadyApplied) {
        setError('You already applied for this category.');
        return;
      }
    }

    sessionStorage.setItem(
      'leaderApplySelection',
      JSON.stringify({
        categoryId: category.id,
        categoryName: category.name,
      }),
    );
    navigate('/leader/apply/form');
  };

  return (
    <div className="w-full overflow-x-hidden bg-white min-h-screen flex flex-col">
      <Header />

      <div className="relative w-full h-[250px] md:h-[280px] flex items-start justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-0 animate-fade-in-out"
            style={{ backgroundImage: `url(${bg1})`, animationDelay: '0s' }}
          ></div>
          <div
            className="absolute inset-0 bg-cover bg-center opacity-0 animate-fade-in-out"
            style={{ backgroundImage: `url(${bg2})`, animationDelay: '4s' }}
          ></div>
          <div
            className="absolute inset-0 bg-cover bg-center opacity-0 animate-fade-in-out"
            style={{ backgroundImage: `url(${bg3})`, animationDelay: '8s' }}
          ></div>
        </div>

        <div className="absolute inset-0 z-[1]"></div>

        <div className="relative z-10 text-left text-white w-full max-w-7xl px-5 sm:px-6 lg:px-8 pt-20">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-3 tracking-tight">Club Category</h1>
          <Link to="/" className="inline-flex items-center gap-2 text-blue-200 hover:text-white transition-colors">
            <span>&laquo;</span>
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

          {categories.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
              No categories available yet. Please contact admin.
            </div>
          ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {categories.map((category) => (
              <div key={category.name} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    {category.icon?.startsWith('data:') ? (
                      <img src={category.icon} alt={category.name} className="h-6 w-6 rounded-md object-cover" />
                    ) : (
                      <span className="text-base">{category.icon ?? 'Tag'}</span>
                    )}
                    {category.name}
                  </h3>
                </div>
                {category.description && (
                  <p className="mt-3 text-sm text-slate-600">{category.description}</p>
                )}
                <div className="mt-5 flex justify-end">
                  <button
                    onClick={() => handleSelect(category)}
                    className="px-5 py-2 rounded-full bg-blue-900 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Select
                  </button>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
