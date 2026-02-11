import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Package, LayoutGrid } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { clubs as allClubs } from '@/data/clubs';
import bg1 from '@/assets/home_11.jpeg';
import bg2 from '@/assets/home_1111.jpeg';
import bg3 from '@/assets/home_11111.jpeg';

export default function ClubsPage() {
  const INITIAL_VISIBLE_CLUBS = 6;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_CLUBS);

  const categories = [
    'All',
    'Web Development',
    'Software Development',
    'Mobile App Development',
    'Machine Learning',
    'Artificial Intelligence',
    'Data Engineering',
    'UI/UX Design',
    'Python Programming',
    'DevOps Engineering'
  ];

  const createdClubs = useMemo(() => {
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

  const mergedClubs = [...createdClubs, ...allClubs].map((club) => ({
    ...club,
    projectsCount: projectCounts[club.id] ?? club.projectsCount ?? 0
  }));

  // Filter clubs based on search and category
  const filteredClubs = mergedClubs.filter((club) => {
    const matchesSearch = club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || club.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_CLUBS);
  }, [searchQuery, selectedCategory]);

  const visibleClubs = useMemo(
    () => filteredClubs.slice(0, visibleCount),
    [filteredClubs, visibleCount]
  );

  return (
    <div className="w-full overflow-x-hidden bg-white min-h-screen flex flex-col">
      <Header />
      
      {/* Page Header */}
      <div className="relative w-full h-[250px] md:h-[280px] flex items-start justify-center overflow-hidden">
        {/* Background Images Container */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-cover bg-center opacity-0 animate-fade-in-out" style={{backgroundImage: `url(${bg1})`, animationDelay: '0s'}}></div>
          <div className="absolute inset-0 bg-cover bg-center opacity-0 animate-fade-in-out" style={{backgroundImage: `url(${bg2})`, animationDelay: '4s'}}></div>
          <div className="absolute inset-0 bg-cover bg-center opacity-0 animate-fade-in-out" style={{backgroundImage: `url(${bg3})`, animationDelay: '8s'}}></div>
        </div>

        {/* Dark Overlay */}
        <div className="absolute inset-0 z-[1]"></div>

        {/* Content */}
        <div className="relative z-10 text-left text-white w-full max-w-7xl px-5 sm:px-6 lg:px-8 pt-20">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-3 tracking-tight">Clubs</h1>
          <div className="flex items-center gap-2 text-blue-200">
            <span>«</span>
            <a href="/" className="hover:text-white transition-colors">Home</a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Search Box */}
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

            {/* Categories */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg transition-all ${
                      selectedCategory === category
                        ? 'bg-blue-900 text-white'
                        : 'bg-blue-50 text-blue-900 hover:bg-blue-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border-2 ${
                          selectedCategory === category
                            ? 'bg-white border-white'
                            : 'border-blue-900'
                        }`}
                      ></div>
                      <span className="text-sm font-medium">{category}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Clubs Grid */}
          <div className="lg:col-span-3">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-blue-900 mb-2">Available Clubs</h2>
              <p className="text-slate-600">{filteredClubs.length} clubs found</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visibleClubs.map((club, index) => (
                <div
                  key={club.id}
                  className="rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Image */}
                  <div className="relative h-44 overflow-hidden bg-slate-200">
                    <img
                      src={club.image}
                      alt={club.name}
                      loading={index < 3 ? 'eager' : 'lazy'}
                      fetchPriority={index < 3 ? 'high' : 'auto'}
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Club Name */}
                    <h3 className="text-base font-semibold text-blue-900">{club.name}</h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed text-center">{club.description}</p>

                    {/* Divider */}
                    <hr className="my-3 border-slate-200" />

                    {/* Stats */}
                    <div className="flex justify-between items-center mb-5">
                      <div className="flex items-center gap-1.5">
                        <Package className="h-4 w-4 text-blue-900" />
                        <span className="text-xs font-semibold text-blue-900">{club.projectsCount} Projects</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <LayoutGrid className="h-4 w-4 text-blue-900" />
                        <span className="text-xs font-semibold text-blue-900">{club.modulesCount} Modules</span>
                      </div>
                    </div>

                    {/* View Details Button */}
                    <Link to={`/clubs/${club.id}`} className="w-full rounded-full bg-blue-900 text-white py-2 font-semibold hover:bg-blue-700 transition-colors text-xs block text-center">
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>

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

            {filteredClubs.length === 0 && (
              <div className="text-center py-16">
                <p className="text-xl text-slate-600">No clubs found matching your criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
