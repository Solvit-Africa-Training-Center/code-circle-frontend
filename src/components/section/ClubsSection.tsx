import img1 from '@/assets/image-7.jpg';
import img2 from '@/assets/image-6.jpg';
import img3 from '@/assets/image-8.jpg';
import img4 from '@/assets/image-9.jpg';
import img5 from '@/assets/image2.jpg';
import img6 from '@/assets/image2.jpg';
import { Package, LayoutGrid } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ClubsSection() {
  const clubs = [
    {
      id: 1,
      name: 'Frontend Flow',
      category: 'Focus on creating clean, interactive user interfaces using modern frameworks',
      image: img1,
      admins: ['Brian Kim'],
      adminCount: 1,
      projects: 4,
      modules: 8
    },
    {
      id: 2,
      name: 'Web Wizards',
      category: 'Build modern, responsive websites using cutting-edge web technologies',
      image: img2,
      admins: ['Alex Chen'],
      adminCount: 1,
      projects: 4,
      modules: 8
    },
    {
      id: 3,
      name: 'FullStack Forge',
      category: 'Develop complete web applications from end-to-end using modern stacks',
      image: img3,
      admins: ['Clara Singh'],
      adminCount: 1,
      projects: 4,
      modules: 3
    },
    {
      id: 4,
      name: 'CodeCraft Club',
      category: 'Learn how to design, build, and maintain well-structured software systems',
      image: img4,
      admins: ['David Lee'],
      adminCount: 1,
      projects: 4,
      modules: 7
    },
    {
      id: 5,
      name: 'System Builders',
      category: 'Learn how to design, build, and maintain well-structured software systems',
      image: img5,
      admins: ['Emily Roberts'],
      adminCount: 1,
      projects: 5,
      modules: 7
    },
    {
      id: 6,
      name: 'Clean Code Circle',
      category: 'Master best practices for writing clean, readable, maintainable, and testable code',
      image: img6,
      admins: ['Frank Merrith'],
      adminCount: 1,
      projects: 4,
      modules: 4
    }
  ];

  return (
    <section className="relative py-20 md:py-28 overflow-hidden bg-slate-50">
      <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-blue-900">
            Our Clubs
          </h2>
          <p className="mt-2 text-base text-blue-600 font-medium">Join a Club Gain Skills</p>
        </div>

        {/* Clubs Grid */}
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {clubs.slice(0, 3).map((club) => (
              <div
                key={club.id}
                className="rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden bg-slate-200">
                  <img
                    src={club.image}
                    alt={club.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Club Name */}
                  <h3 className="text-base font-semibold text-blue-900">{club.name}</h3>
                  <p className="text-xs text-blue-900 mt-2 leading-relaxed text-left">{club.category}</p>

                  {/* Divider */}
                  <hr className="my-3 border-slate-200" />

                  {/* Stats */}
                  <div className="flex justify-between items-center mb-5">
                    <div className="flex items-center gap-1.5">
                      <Package className="h-4 w-4 text-blue-900" />
                      <span className="text-xs font-semibold text-blue-900">{club.projects} Projects</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <LayoutGrid className="h-4 w-4 text-blue-900" />
                      <span className="text-xs font-semibold text-blue-900">{club.modules} Modules</span>
                    </div>
                  </div>

                  {/* View Details Button */}
                  <button className="w-full rounded-full bg-blue-900 text-white py-2 font-semibold hover:bg-blue-700 transition-colors text-xs">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-slate-300"></div>

          {/* Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {clubs.slice(3, 6).map((club) => (
              <div
                key={club.id}
                className="rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden bg-slate-200">
                  <img
                    src={club.image}
                    alt={club.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Club Name */}
                  <h3 className="text-base font-semibold text-blue-900">{club.name}</h3>
                  <p className="text-xs text-blue-900 mt-2 leading-relaxed text-left">{club.category}</p>

                  {/* Divider */}
                  <hr className="my-3 border-slate-200" />

                  {/* Stats */}
                  <div className="flex justify-between items-center mb-5">
                    <div className="flex items-center gap-1.5">
                      <Package className="h-4 w-4 text-blue-900" />
                      <span className="text-xs font-semibold text-blue-900">{club.projects} Projects</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <LayoutGrid className="h-4 w-4 text-blue-900" />
                      <span className="text-xs font-semibold text-blue-900">{club.modules} Modules</span>
                    </div>
                  </div>

                  {/* View Details Button */}
                  <button className="w-full rounded-full bg-blue-900 text-white py-2 font-semibold hover:bg-blue-700 transition-colors text-xs">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Explore More Link */}
          <div className="flex justify-center mt-12">
            <Link to="/clubs" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors text-base">
              Explore More →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
