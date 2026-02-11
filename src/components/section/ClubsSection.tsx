import { useEffect, useMemo } from 'react';
import { Package, LayoutGrid } from 'lucide-react';
import { Link } from 'react-router-dom';
import { clubs as allClubs } from '@/data/clubs';

export default function ClubsSection() {
  const featuredClubs = useMemo(() => allClubs.slice(0, 6), []);

  useEffect(() => {
    // Preload visible club images to reduce delayed paint in this section.
    const preloaders = featuredClubs.map((club) => {
      const img = new Image();
      img.src = club.image;
      return img;
    });

    return () => {
      preloaders.forEach((img) => {
        img.src = '';
      });
    };
  }, [featuredClubs]);

  return (
    <section className="relative overflow-hidden bg-slate-50 py-20 md:py-28">
      <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-bold tracking-tight text-blue-900 md:text-5xl">Our Clubs</h2>
          <p className="mt-2 text-base font-medium text-blue-600">Join a Club Gain Skills</p>
        </div>

        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featuredClubs.slice(0, 3).map((club) => (
              <div
                key={club.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative h-44 overflow-hidden bg-slate-200">
                  <img
                    src={club.image}
                    alt={club.name}
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="p-5">
                  <h3 className="text-base font-semibold text-blue-900">{club.name}</h3>
                  <p className="mt-2 text-left text-xs leading-relaxed text-blue-900">{club.description}</p>

                  <hr className="my-3 border-slate-200" />

                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Package className="h-4 w-4 text-blue-900" />
                      <span className="text-xs font-semibold text-blue-900">{club.projectsCount} Projects</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <LayoutGrid className="h-4 w-4 text-blue-900" />
                      <span className="text-xs font-semibold text-blue-900">{club.modulesCount} Modules</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="w-full rounded-full bg-blue-900 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-300"></div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featuredClubs.slice(3, 6).map((club) => (
              <div
                key={club.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative h-44 overflow-hidden bg-slate-200">
                  <img
                    src={club.image}
                    alt={club.name}
                    loading="eager"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="p-5">
                  <h3 className="text-base font-semibold text-blue-900">{club.name}</h3>
                  <p className="mt-2 text-left text-xs leading-relaxed text-blue-900">{club.description}</p>

                  <hr className="my-3 border-slate-200" />

                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Package className="h-4 w-4 text-blue-900" />
                      <span className="text-xs font-semibold text-blue-900">{club.projectsCount} Projects</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <LayoutGrid className="h-4 w-4 text-blue-900" />
                      <span className="text-xs font-semibold text-blue-900">{club.modulesCount} Modules</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="w-full rounded-full bg-blue-900 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <Link to="/clubs" className="text-base font-semibold text-blue-600 transition-colors hover:text-blue-700">
              Explore More {'->'}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
