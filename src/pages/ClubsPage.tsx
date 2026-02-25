import { useEffect, useMemo, useState } from 'react';
import { Search, Package, LayoutGrid } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import bg1 from '@/assets/home_11.jpeg';
import bg2 from '@/assets/home_1111.jpeg';
import bg3 from '@/assets/home_11111.jpeg';
import { useGetActiveClubsQuery } from '@/features/ClubsApi';
import MemberPageLayout from '@/components/student/MemberPageLayout';

export default function ClubsPage() {
  const INITIAL_VISIBLE_CLUBS = 6;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_CLUBS);
  const { data: clubs = [], isLoading } = useGetActiveClubsQuery();

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(clubs.map((club) => club.category?.name || '').filter(Boolean)))],
    [clubs],
  );

  const filteredClubs = useMemo(() => {
    const search = searchQuery.toLowerCase();
    return clubs.filter((club) => {
      const matchesSearch =
        club.name.toLowerCase().includes(search) ||
        (club.description || '').toLowerCase().includes(search);
      const category = club.category?.name || '';
      const matchesCategory = selectedCategory === 'All' || category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [clubs, searchQuery, selectedCategory]);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_CLUBS);
  }, [searchQuery, selectedCategory]);

  const visibleClubs = useMemo(
    () => filteredClubs.slice(0, visibleCount),
    [filteredClubs, visibleCount],
  );

  return (
    <MemberPageLayout>
      <div className="w-full overflow-x-hidden bg-white min-h-screen flex flex-col">
        <Header />

      <div className="relative w-full h-[250px] md:h-[280px] flex items-start justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-cover bg-center opacity-0 animate-fade-in-out" style={{ backgroundImage: `url(${bg1})`, animationDelay: '0s' }}></div>
          <div className="absolute inset-0 bg-cover bg-center opacity-0 animate-fade-in-out" style={{ backgroundImage: `url(${bg2})`, animationDelay: '4s' }}></div>
          <div className="absolute inset-0 bg-cover bg-center opacity-0 animate-fade-in-out" style={{ backgroundImage: `url(${bg3})`, animationDelay: '8s' }}></div>
        </div>
        <div className="absolute inset-0 z-[1]"></div>
        <div className="relative z-10 text-left text-white w-full max-w-7xl px-5 sm:px-6 lg:px-8 pt-20">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-3 tracking-tight">Clubs</h1>
          <div className="flex items-center gap-2 text-blue-200">
            <span>&laquo;</span>
            <a href="/" className="hover:text-white transition-colors">Home</a>
          </div>
        </div>
      </div>

      <div className="flex-1 relative mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-slate-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search Clubs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg transition-all ${
                      selectedCategory === category ? 'bg-blue-900 text-white' : 'bg-blue-50 text-blue-900 hover:bg-blue-100'
                    }`}
                  >
                    <span className="text-sm font-medium">{category}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-blue-900 mb-2">Available Clubs</h2>
              <p className="text-slate-600">{filteredClubs.length} clubs found</p>
            </div>

            {isLoading && (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
                Loading clubs...
              </div>
            )}

            {!isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {visibleClubs.map((club) => (
                  <div
                    key={club.id}
                    className="rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    {club.imageUrl ? (
                      <img src={club.imageUrl} alt={club.name} className="relative h-44 w-full overflow-hidden object-cover" />
                    ) : (
                      <div className="relative h-44 overflow-hidden bg-slate-200 flex items-center justify-center text-slate-500 text-sm">
                        No Image
                      </div>
                    )}

                    <div className="p-5">
                      <h3 className="text-base font-semibold text-blue-900">{club.name}</h3>
                      <p className="text-xs text-slate-600 mt-1">{club.category?.name || 'Unknown category'}</p>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed text-center">
                        {club.description || 'No description'}
                      </p>

                      <hr className="my-3 border-slate-200" />

                      <div className="flex justify-between items-center mb-5">
                        <div className="flex items-center gap-1.5">
                          <Package className="h-4 w-4 text-blue-900" />
                          <span className="text-xs font-semibold text-blue-900">0 Projects</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <LayoutGrid className="h-4 w-4 text-blue-900" />
                          <span className="text-xs font-semibold text-blue-900">0 Modules</span>
                        </div>
                      </div>

                      <Link to={`/clubs/${club.id}`} className="w-full rounded-full bg-blue-900 text-white py-2 font-semibold hover:bg-blue-700 transition-colors text-xs block text-center">
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {visibleCount < filteredClubs.length && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + INITIAL_VISIBLE_CLUBS)}
                  className="rounded-full bg-blue-900 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  Load More Clubs
                </button>
              </div>
            )}

            {!isLoading && filteredClubs.length === 0 && (
              <div className="text-center py-16">
                <p className="text-xl text-slate-600">No clubs found matching your criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>

        <Footer />
      </div>
    </MemberPageLayout>
  );
}
