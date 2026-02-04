import { useState } from 'react';
import { Search } from 'lucide-react';
import { Package, LayoutGrid } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import img1 from '@/assets/image-7.jpg';
import img2 from '@/assets/image-6.jpg';
import img3 from '@/assets/image-8.jpg';
import img4 from '@/assets/image-9.jpg';
import img5 from '@/assets/image2.jpg';
import img6 from '@/assets/image2.jpg';
import bg1 from '@/assets/home_11.jpeg';
import bg2 from '@/assets/home_1111.jpeg';
import bg3 from '@/assets/home_11111.jpeg';

export default function ClubsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

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

  const allClubs = [
    {
      id: 1,
      name: 'Frontend Flow',
      category: 'Web Development',
      description: 'Focus on creating clean, interactive user interfaces using modern frameworks',
      image: img1,
      projects: 4,
      modules: 8
    },
    {
      id: 2,
      name: 'Web Wizards',
      category: 'Web Development',
      description: 'Build modern, responsive websites using cutting-edge web technologies',
      image: img2,
      projects: 4,
      modules: 8
    },
    {
      id: 3,
      name: 'FullStack Forge',
      category: 'Software Development',
      description: 'Develop complete web applications from end-to-end using modern stacks',
      image: img3,
      projects: 4,
      modules: 3
    },
    {
      id: 4,
      name: 'CodeCraft Club',
      category: 'Software Development',
      description: 'Build strong software foundations through hands-on coding and real-world projects',
      image: img4,
      projects: 4,
      modules: 5
    },
    {
      id: 5,
      name: 'System Builders',
      category: 'Software Development',
      description: 'Learn how to design, build, and maintain well-structured software systems',
      image: img5,
      projects: 4,
      modules: 7
    },
    {
      id: 6,
      name: 'Clean Code Circle',
      category: 'Software Development',
      description: 'Master best practices for writing clean, readable, maintainable, and efficient code',
      image: img6,
      projects: 4,
      modules: 4
    },
    {
      id: 7,
      name: 'Mobile Masters',
      category: 'Mobile App Development',
      description: 'Create cross-platform mobile apps with modern development tools',
      image: img1,
      projects: 4,
      modules: 7
    },
    {
      id: 8,
      name: 'AppLab Studio',
      category: 'Mobile App Development',
      description: 'Build real-world mobile applications from concept to deployment',
      image: img2,
      projects: 4,
      modules: 8
    },
    {
      id: 9,
      name: 'Flutter Force',
      category: 'Mobile App Development',
      description: 'Develop high-performance apps using the Flutter framework',
      image: img3,
      projects: 4,
      modules: 5
    },
    {
      id: 10,
      name: 'ML Innovators',
      category: 'Machine Learning',
      description: 'Explore machine learning models and solve real-world prediction problems',
      image: img4,
      projects: 4,
      modules: 9
    },
    {
      id: 11,
      name: 'Data Minds',
      category: 'Data Engineering',
      description: 'Master data analysis techniques to analyze and interpret complex datasets',
      image: img5,
      projects: 4,
      modules: 7
    },
    {
      id: 12,
      name: 'AI Pioneers',
      category: 'Artificial Intelligence',
      description: 'Advanced systems and build AI-driven solutions for real-world challenges',
      image: img6,
      projects: 4,
      modules: 6
    }
  ];

  // Filter clubs based on search and category
  const filteredClubs = allClubs.filter((club) => {
    const matchesSearch = club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || club.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full overflow-x-hidden bg-white min-h-screen flex flex-col">
      <Header />
      
      {/* Page Header */}
      <div className="relative w-full h-[250px] md:h-[280px] flex items-start justify-center overflow-hidden mt-16">
        {/* Background Images Container */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-cover bg-center opacity-0 animate-fade-in-out" style={{backgroundImage: `url(${bg1})`, animationDelay: '0s'}}></div>
          <div className="absolute inset-0 bg-cover bg-center opacity-0 animate-fade-in-out" style={{backgroundImage: `url(${bg2})`, animationDelay: '4s'}}></div>
          <div className="absolute inset-0 bg-cover bg-center opacity-0 animate-fade-in-out" style={{backgroundImage: `url(${bg3})`, animationDelay: '8s'}}></div>
        </div>

        {/* Dark Overlay */}
        <div className="absolute inset-0 z-[1]"></div>

        {/* Content */}
        <div className="relative z-10 text-left text-white w-full max-w-7xl px-5 sm:px-6 lg:px-8 pt-8">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-3 tracking-tight">Clubs</h1>
          <div className="flex items-center gap-2 text-blue-200">
            <span>←</span>
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
              {filteredClubs.map((club) => (
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
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed text-center">{club.description}</p>

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
                    <Link to={`/clubs/${club.id}`} className="w-full rounded-full bg-blue-900 text-white py-2 font-semibold hover:bg-blue-700 transition-colors text-xs block text-center">
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>

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
