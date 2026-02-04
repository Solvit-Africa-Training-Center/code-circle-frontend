import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Mail, Phone, Linkedin, Twitter, User, MapPin, CheckCircle2 } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import bg1 from '@/assets/home_11.jpeg';
import bg2 from '@/assets/home_1111.jpeg';
import bg3 from '@/assets/home_11111.jpeg';
import img1 from '@/assets/image-7.jpg';

export default function ClubDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  // Sample club data - in real app, would come from API based on ID
  const club = {
    id: id || '1',
    name: 'Web Wizards',
    description: 'Design with purpose, code with clarity, and always keep the user first.',
    image: img1,
    admin: {
      name: 'Jacob Reed',
      location: 'Egypt, Cairo',
      email: 'jacobreed@gmail.com',
      phone: '0780647340',
      twitter: 'jacobreed',
      linkedin: 'jacobreed'
    },
    tags: ['HTML', 'CSS', 'UX/UI', 'JavaScript'],
    stats: {
      projects: 3,
      modules: 0,
      joinedMembers: 0
    },
    details: {
      entryRequirement: 'Pass skill test (CSS or higher)',
      projects: '3 Projects',
      duration: '6 Weeks',
      modules: '4 Modules',
      weeklyCommitment: '3-5 hours',
      learningFormat: 'Hands-on projects, guided exercises, peer reviews',
      outcome: 'Build responsive, accessible, and interactive user interfaces'
    },
    gallery: [img1, img1, img1, img1, img1, img1],
    services: [
      'Core Web Development Training',
      'Website Project Development',
      'Responsive & Cross-Browser Design',
      'Team Collaboration & Code Reviews',
      'Certificate'
    ],
    projects: [
      { title: 'Corporate Website Redesign', type: 'web development' },
      { title: 'E-Commerce Storefront', type: 'web development' },
      { title: 'Startup Portfolio Website', type: 'web development' }
    ]
  };

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
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-3 tracking-tight">Club Overview</h1>
          <div className="flex items-center gap-2 text-blue-200">
            <span>←</span>
            <a href="/" className="hover:text-white transition-colors">Home</a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8 py-12">
        {/* Back to Clubs Link */}
        <Link to="/clubs" className="inline-flex items-center gap-2 text-blue-900 font-semibold mb-8 hover:text-blue-700 transition-colors">
          <span>←</span>
          <span>Back To Clubs</span>
        </Link>

        {/* Club Header Card */}
        <div className="bg-blue-50 border-l-4 border-blue-900 rounded-lg p-8 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left - Image and Info */}
            <div className="md:col-span-2">
              <div className="flex gap-6 items-start">
                {/* Club Image */}
                <img src={club.image} alt={club.name} className="w-24 h-24 rounded-lg object-cover flex-shrink-0" />
                
                {/* Club Info */}
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-blue-900 mb-2">{club.name}</h2>
                  <p className="text-slate-700 mb-4 italic">"{club.description}"</p>
                  
                  {/* Admin Info */}
                  <div className="space-y-1.5 text-sm text-slate-600 mb-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-900" />
                      <span>{club.admin.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-900" />
                      <span>{club.admin.location}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {club.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1.5 bg-white border border-slate-300 rounded-full text-xs font-medium text-slate-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Quick Stats and Join Button */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Quick Stats</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-900"></span>
                      Projects
                    </span>
                    <span className="font-semibold text-blue-900">({club.stats.projects})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 border-2 border-blue-900 rounded-sm"></span>
                      Modules
                    </span>
                    <span className="font-semibold text-blue-900">({club.stats.modules})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 border-2 border-blue-900 rounded-sm"></span>
                      Joined Members
                    </span>
                    <span className="font-semibold text-blue-900">({club.stats.joinedMembers})</span>
                  </div>
                </div>

                <button className="w-full bg-blue-900 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Join Club
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-12 border-b border-slate-200">
          <div className="flex gap-4 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: '≡' },
              { id: 'projects', label: 'Projects', icon: '📁' },
              { id: 'reviews', label: 'Reviews', icon: '⭐' },
              { id: 'contact', label: 'Contact', icon: '■' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-semibold whitespace-nowrap transition-all rounded-t-lg flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-blue-900 text-white'
                    : 'text-slate-600 hover:text-blue-900 bg-transparent'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-12">
            {/* Two Column Layout - Club Details/Gallery and Services/Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Left Column - Club Details and Gallery */}
              <div className="space-y-12">
                {/* Club Details */}
                <div>
                  <h3 className="text-lg font-bold text-blue-900 mb-6">Club Details</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <p className="text-sm font-semibold text-slate-600">Entry Requirement:</p>
                      <p className="text-slate-900 text-right">{club.details.entryRequirement}</p>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <p className="text-sm font-semibold text-slate-600">Projects:</p>
                      <p className="text-slate-900 text-right">{club.details.projects}</p>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <p className="text-sm font-semibold text-slate-600">Duration:</p>
                      <p className="text-slate-900 text-right">{club.details.duration}</p>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <p className="text-sm font-semibold text-slate-600">Modules:</p>
                      <p className="text-slate-900 text-right">{club.details.modules}</p>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <p className="text-sm font-semibold text-slate-600">Weekly Commitment:</p>
                      <p className="text-slate-900 text-right">{club.details.weeklyCommitment}</p>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <p className="text-sm font-semibold text-slate-600">Learning Format:</p>
                      <p className="text-slate-900 text-right">{club.details.learningFormat}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-600">Outcome:</p>
                      <p className="text-slate-900 text-right">{club.details.outcome}</p>
                    </div>
                  </div>
                </div>

                {/* Gallery */}
                <div>
                  <h3 className="text-lg font-bold text-blue-900 mb-6">Gallery</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {club.gallery.map((img, idx) => (
                      <img key={idx} src={img} alt={`gallery-${idx}`} className="w-full h-40 object-cover rounded-lg" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Services and Contact */}
              <div className="space-y-12">
                {/* Services & Capabilities */}
                <div>
                  <h3 className="text-lg font-bold text-blue-900 mb-6">Services & Capabilities</h3>
                  <div className="space-y-3">
                    {club.services.map((service, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-blue-900 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-900">{service}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-6">Contact Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                      <Mail className="w-5 h-5 text-blue-900" />
                      <span className="text-slate-900">{club.admin.email}</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                      <Phone className="w-5 h-5 text-blue-900" />
                      <span className="text-slate-900">{club.admin.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                      <Twitter className="w-5 h-5 text-blue-900" />
                      <span className="text-slate-900">{club.admin.twitter}</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                      <Linkedin className="w-5 h-5 text-blue-900" />
                      <span className="text-slate-900">{club.admin.linkedin}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Projects - Full Width Below */}
            <div>
              <h3 className="text-lg font-bold text-blue-900 mb-6">Projects</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {club.projects.map((project, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer">
                    <div className="w-12 h-12 bg-slate-300 rounded flex-shrink-0"></div>
                    <div>
                      <p className="font-semibold text-slate-900">{project.title}</p>
                      <p className="text-xs text-slate-600">{project.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="text-center py-12">
            <p className="text-slate-600">Please refer to the Contact Information section in the Overview tab for contact details.</p>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {club.projects.map((project, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <h4 className="text-lg font-bold text-slate-900 mb-2">{project.title}</h4>
                <p className="text-sm text-slate-600 capitalize">{project.type}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="text-center py-12">
            <p className="text-slate-600">No reviews yet. Be the first to review this club!</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
