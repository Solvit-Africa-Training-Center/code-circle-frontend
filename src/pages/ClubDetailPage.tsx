import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Mail, Phone, Linkedin, Twitter, User, MapPin, CheckCircle2, Box, BarChart3, Users, Layout, FileText, Star, Mail as MailIcon, X } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import bg1 from '@/assets/home_11.jpeg';
import bg2 from '@/assets/home_1111.jpeg';
import bg3 from '@/assets/home_11111.jpeg';
import { clubs } from '@/data/clubs';

type MemberFormState = {
  fullName: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  location: string;
  skills: string;
  cv: File | null;
};

export default function ClubDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberForm, setMemberForm] = useState<MemberFormState>({
    fullName: '',
    email: '',
    dateOfBirth: '',
    gender: 'Male',
    location: '',
    skills: '',
    cv: null
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateMemberForm = () => {
    const errors: Record<string, string> = {};

    if (!memberForm.fullName.trim()) {
      errors.fullName = 'Full name is required.';
    }

    if (!memberForm.email.trim()) {
      errors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(memberForm.email)) {
      errors.email = 'Enter a valid email address.';
    }

    if (!memberForm.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required.';
    }

    if (!memberForm.gender) {
      errors.gender = 'Gender is required.';
    }

    if (!memberForm.location.trim()) {
      errors.location = 'Location is required.';
    }

    if (!memberForm.skills.trim()) {
      errors.skills = 'Skills are required.';
    }

    if (!memberForm.cv) {
      errors.cv = 'CV is required.';
    } else if (memberForm.cv.size > 5 * 1024 * 1024) {
      errors.cv = 'CV must be 5MB or smaller.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const clubId = Number(id);
  const joinedClubIds = (() => {
    try {
      const raw = localStorage.getItem('studentJoinedClubs');
      return raw ? (JSON.parse(raw) as number[]) : [];
    } catch {
      return [];
    }
  })();
  const leaderClubs = (() => {
    try {
      const stored = localStorage.getItem('leaderCreatedClubs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  })();

  const baseClub = clubs.find((item) => item.id === clubId);
  const leaderClub = leaderClubs.find((item: { id: number }) => item.id === clubId);

  const club = baseClub ?? (leaderClub
    ? {
        ...leaderClub,
        admin: {
          name: 'Club Leader',
          location: 'CodeCircle',
          email: 'leader@codecircle.com',
          phone: 'N/A',
          twitter: 'codecircle',
          linkedin: 'codecircle'
        },
        tags: leaderClub.category ? [leaderClub.category, 'Community', 'Projects'] : ['Community', 'Projects'],
        stats: {
          projects: leaderClub.projectsCount ?? 0,
          modules: leaderClub.modulesCount ?? 0,
          joinedMembers: leaderClub.stats?.joinedMembers ?? 0
        },
        details: {
          entryRequirement: 'Join the club to get started',
          projects: `${leaderClub.projectsCount ?? 0} Projects`,
          duration: '6 Weeks',
          modules: `${leaderClub.modulesCount ?? 0} Modules`,
          weeklyCommitment: '3-5 hours',
          learningFormat: 'Collaborative sessions, project work, peer reviews',
          outcome: 'Build real-world skills and a portfolio'
        },
        gallery: leaderClub.image ? [leaderClub.image, bg1, bg2, bg3] : [bg1, bg2, bg3],
        services: ['Core Training Sessions', 'Project-Based Learning', 'Peer Reviews', 'Mentor Support'],
        projectList: [
          { title: 'Kickoff Project', type: 'club project' },
          { title: 'Team Challenge', type: 'club project' },
          { title: 'Showcase Demo', type: 'club project' }
        ]
      }
    : undefined);

  const alreadyJoined = joinedClubIds.includes(clubId);

  if (!club) {
    return (
      <div className="w-full overflow-x-hidden bg-white min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center px-5 py-16">
          <div className="text-center max-w-lg">
            <h2 className="text-2xl font-bold text-blue-900 mb-3">Club Not Found</h2>
            <p className="text-slate-600 mb-6">We could not find that club. Please go back and choose a club from the list.</p>
            <Link to="/clubs" className="inline-flex items-center justify-center rounded-full bg-blue-900 text-white px-6 py-2 font-semibold hover:bg-blue-700 transition-colors">
              Back To Clubs
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-3 tracking-tight">Club Overview</h1>
          <div className="flex items-center gap-2 text-blue-200">
            <span>«</span>
            <a href="/" className="hover:text-white transition-colors">Home</a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative w-full py-12 bg-blue-50">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          {/* Back to Clubs Link */}
        <Link to="/clubs" className="inline-flex items-center gap-2 text-blue-900 font-semibold mb-8 hover:text-blue-700 transition-colors">
          <span>←</span>
          <span>Back To Clubs</span>
        </Link>

        {/* Club Header Card */}
        <div className="bg-blue-100 rounded-lg p-8 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left - Image and Info */}
            <div className="md:col-span-2">
              <div className="flex gap-6 items-start">
                {/* Club Image */}
                <img src={club.image} alt={club.name} className="w-24 h-24 rounded-lg object-cover flex-shrink-0" />
                
                {/* Club Info */}
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-blue-900 mb-2 text-left">{club.name}</h2>
                  <p className="text-slate-700 mb-4 italic text-left">"{club.description}"</p>
                  
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
                      <Box className="w-4 h-4 text-blue-900" />
                      Projects
                    </span>
                    <span className="font-semibold text-blue-900">({club.stats.projects})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-blue-900" />
                      Modules
                    </span>
                    <span className="font-semibold text-blue-900">({club.stats.modules})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-900" />
                      Joined Members
                    </span>
                    <span className="font-semibold text-blue-900">({club.stats.joinedMembers})</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!alreadyJoined) setShowMemberModal(true);
                  }}
                  disabled={alreadyJoined}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    alreadyJoined
                      ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                      : 'bg-blue-900 text-white hover:bg-blue-700'
                  }`}
                >
                  {alreadyJoined ? 'Already Joined' : 'Join Club'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-12 border-b border-slate-200">
          <div className="flex gap-8 w-full">
            {[
              { id: 'overview', label: 'Overview', icon: Layout },
              { id: 'projects', label: 'Projects', icon: FileText },
              { id: 'reviews', label: 'Reviews', icon: Star },
              { id: 'contact', label: 'Contact', icon: MailIcon }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 font-semibold whitespace-nowrap transition-all rounded-t-lg flex items-center gap-2 border-b-2 ${
                    activeTab === tab.id
                      ? 'text-blue-900 border-b-blue-900 bg-transparent'
                      : 'text-slate-600 border-b-transparent hover:text-blue-900 bg-transparent'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
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
                <div className="bg-white rounded-lg p-6">
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
                <div className="bg-white rounded-lg p-6" >
                  <h3 className="text-lg font-bold text-blue-900 mb-6">Gallery</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {club.gallery.map((img, idx) => (
                      <img key={idx} src={img} alt={`gallery-${idx}`} className="w-full h-40 object-cover rounded-lg" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Services and Contact */}
              <div className="space-y-12 ">
                {/* Services & Capabilities */}
                <div className="bg-white rounded-lg p-6">
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
                {club.projectList.map((project, idx) => (
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
            {club.projectList.map((project, idx) => (
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
      </div>

      {/* Member Information Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-blue-900">Member Information</h2>
              <button
                onClick={() => setShowMemberModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-slate-500" />
              </button>
            </div>

            {/* Modal Body */}
            <form
              id="member-info-form"
              className="p-6 space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                if (validateMemberForm()) {
                  if (alreadyJoined) {
                    setShowMemberModal(false);
                    navigate(`/clubs/${club.id}`);
                    return;
                  }
                  const pendingMember = {
                    clubId: club.id,
                    email: memberForm.email.trim().toLowerCase(),
                    fullName: memberForm.fullName.trim()
                  };
                  sessionStorage.setItem('pendingMemberInfo', JSON.stringify(pendingMember));
                  try {
                    const raw = localStorage.getItem('studentJoinedClubs');
                    const existing = raw ? (JSON.parse(raw) as number[]) : [];
                    const next = Array.from(new Set([...existing, club.id]));
                    localStorage.setItem('studentJoinedClubs', JSON.stringify(next));
                  } catch {
                    localStorage.setItem('studentJoinedClubs', JSON.stringify([club.id]));
                  }
                  try {
                    const membersRaw = localStorage.getItem('clubMembers');
                    const membersByClub = membersRaw ? (JSON.parse(membersRaw) as Record<number, { email: string; fullName: string }[]>) : {};
                    const currentMembers = membersByClub[club.id] || [];
                    const filtered = currentMembers.filter((member) => member.email !== pendingMember.email);
                    membersByClub[club.id] = [...filtered, { email: pendingMember.email, fullName: pendingMember.fullName }];
                    localStorage.setItem('clubMembers', JSON.stringify(membersByClub));
                  } catch {
                    localStorage.setItem(
                      'clubMembers',
                      JSON.stringify({ [club.id]: [{ email: pendingMember.email, fullName: pendingMember.fullName }] })
                    );
                  }
                  try {
                    const createdRaw = localStorage.getItem('leaderCreatedClubs');
                    if (createdRaw) {
                      const created = JSON.parse(createdRaw) as Array<{ id: number; stats?: { joinedMembers: number } }>;
                      const membersRaw = localStorage.getItem('clubMembers');
                      const membersByClub = membersRaw ? (JSON.parse(membersRaw) as Record<number, { email: string }[]>) : {};
                      const next = created.map((clubItem) => {
                        if (clubItem.id !== club.id) return clubItem;
                        const memberCount = (membersByClub[club.id] || []).length;
                        return {
                          ...clubItem,
                          stats: { joinedMembers: memberCount }
                        };
                      });
                      localStorage.setItem('leaderCreatedClubs', JSON.stringify(next));
                    }
                  } catch {
                    // Ignore sync errors for demo flow
                  }
                  setShowMemberModal(false);
                  navigate(`/clubs/${club.id}/test`);
                }
              }}
            >
              {/* Full Name and Email */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 text-left">Full Name</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={memberForm.fullName}
                    onChange={(e) => {
                      setMemberForm({ ...memberForm, fullName: e.target.value });
                      if (formErrors.fullName) setFormErrors({ ...formErrors, fullName: '' });
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                      formErrors.fullName ? 'border-red-500' : 'border-slate-300'
                    }`}
                  />
                  {formErrors.fullName && <p className="text-xs text-red-600 mt-1">{formErrors.fullName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 text-left">Email</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={memberForm.email}
                    onChange={(e) => {
                      setMemberForm({ ...memberForm, email: e.target.value });
                      if (formErrors.email) setFormErrors({ ...formErrors, email: '' });
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                      formErrors.email ? 'border-red-500' : 'border-slate-300'
                    }`}
                  />
                  {formErrors.email && <p className="text-xs text-red-600 mt-1">{formErrors.email}</p>}
                </div>
              </div>

              {/* Date of Birth and Gender */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 text-left">Date of Birth</label>
                  <input
                    type="date"
                    value={memberForm.dateOfBirth}
                    onChange={(e) => {
                      setMemberForm({ ...memberForm, dateOfBirth: e.target.value });
                      if (formErrors.dateOfBirth) setFormErrors({ ...formErrors, dateOfBirth: '' });
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                      formErrors.dateOfBirth ? 'border-red-500' : 'border-slate-300'
                    }`}
                  />
                  {formErrors.dateOfBirth && <p className="text-xs text-red-600 mt-1">{formErrors.dateOfBirth}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 text-left">Gender</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="gender"
                        value="Male"
                        checked={memberForm.gender === 'Male'}
                        onChange={(e) => {
                          setMemberForm({ ...memberForm, gender: e.target.value });
                          if (formErrors.gender) setFormErrors({ ...formErrors, gender: '' });
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-slate-600">Male</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="gender"
                        value="Female"
                        checked={memberForm.gender === 'Female'}
                        onChange={(e) => {
                          setMemberForm({ ...memberForm, gender: e.target.value });
                          if (formErrors.gender) setFormErrors({ ...formErrors, gender: '' });
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-slate-600">Female</span>
                    </label>
                  </div>
                  {formErrors.gender && <p className="text-xs text-red-600 mt-1">{formErrors.gender}</p>}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 text-left">Location</label>
                  <input
                    type="text"
                    placeholder="City, Country"
                    value={memberForm.location}
                    onChange={(e) => {
                      setMemberForm({ ...memberForm, location: e.target.value });
                      if (formErrors.location) setFormErrors({ ...formErrors, location: '' });
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                      formErrors.location ? 'border-red-500' : 'border-slate-300'
                    }`}
                  />
                  {formErrors.location && <p className="text-xs text-red-600 mt-1">{formErrors.location}</p>}
                </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 text-left">Skills</label>
                  <textarea
                    placeholder="List your skills"
                    value={memberForm.skills}
                    onChange={(e) => {
                      setMemberForm({ ...memberForm, skills: e.target.value });
                      if (formErrors.skills) setFormErrors({ ...formErrors, skills: '' });
                    }}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 resize-none ${
                      formErrors.skills ? 'border-red-500' : 'border-slate-300'
                    }`}
                  />
                  {formErrors.skills && <p className="text-xs text-red-600 mt-1">{formErrors.skills}</p>}
                </div>

              {/* Upload CV */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 text-left">Upload your CV</label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-left bg-slate-50">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      setMemberForm({ ...memberForm, cv: e.target.files?.[0] || null });
                      if (formErrors.cv) setFormErrors({ ...formErrors, cv: '' });
                    }}
                    className="hidden"
                    id="cv-upload"
                  />
                  <label htmlFor="cv-upload" className="cursor-pointer">
                    <p className="text-sm text-slate-500">Click to upload or drag and drop</p>
                    <p className="text-xs text-slate-400">PDF, DOC, DOCX up to 5MB</p>
                  </label>
                  {memberForm.cv && <p className="text-sm text-blue-900 mt-2">{memberForm.cv?.name}</p>}
                </div>
                {formErrors.cv && <p className="text-xs text-red-600 mt-2">{formErrors.cv}</p>}
              </div>
            </form>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 border-t border-slate-200">
              <button
                onClick={() => setShowMemberModal(false)}
                className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="member-info-form"
                className="flex-1 px-4 py-3 bg-blue-900 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Take a Test
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
