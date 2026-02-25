import { useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Users, LayoutGrid, Package, X } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import bg1 from '@/assets/home_11.jpeg';
import bg2 from '@/assets/home_1111.jpeg';
import bg3 from '@/assets/home_11111.jpeg';
import { useGetClubByIdQuery, useGetClubStatsQuery } from '@/features/ClubsApi';
import { useRegisterMemberForClubMutation } from '@/features/ClubTestsApi';
import MemberPageLayout from '@/components/student/MemberPageLayout';

type MemberFormState = {
  fullName: string;
  email: string;
};

export default function ClubDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberForm, setMemberForm] = useState<MemberFormState>({
    fullName: '',
    email: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [joinError, setJoinError] = useState('');
  const [registerMemberForClub, { isLoading: isRegisteringMember }] =
    useRegisterMemberForClubMutation();
  const { data: club, isLoading } = useGetClubByIdQuery(id, { skip: !id });
  const { data: stats } = useGetClubStatsQuery(id, { skip: !id });
  const authUser = useMemo(() => {
    try {
      const raw = localStorage.getItem('authUser');
      return raw
        ? (JSON.parse(raw) as { email?: string; name?: string; fullName?: string; role?: string })
        : {};
    } catch {
      return {};
    }
  }, []);

  const validateMemberForm = () => {
    const errors: Record<string, string> = {};
    if (!memberForm.fullName.trim()) errors.fullName = 'Full name is required.';
    if (!memberForm.email.trim()) {
      errors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(memberForm.email)) {
      errors.email = 'Enter a valid email address.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  if (isLoading) {
    return (
      <MemberPageLayout>
        <div className="w-full overflow-x-hidden bg-white min-h-screen flex flex-col">
          <Header />
          <div className="flex-1 flex items-center justify-center px-5 py-16">
            <div className="text-center max-w-lg text-slate-600">Loading club...</div>
          </div>
          <Footer />
        </div>
      </MemberPageLayout>
    );
  }

  if (!club) {
    return (
      <MemberPageLayout>
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
      </MemberPageLayout>
    );
  }

  return (
    <MemberPageLayout>
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
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-3 tracking-tight">Club Overview</h1>
          <div className="flex items-center gap-2 text-blue-200">
            <span>&laquo;</span>
            <a href="/" className="hover:text-white transition-colors">Home</a>
          </div>
        </div>
      </div>

      <div className="flex-1 relative w-full py-12 bg-blue-50">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <Link to="/clubs" className="inline-flex items-center gap-2 text-blue-900 font-semibold mb-8 hover:text-blue-700 transition-colors">
            <span>&larr;</span>
            <span>Back To Clubs</span>
          </Link>

          <div className="bg-blue-100 rounded-lg p-8 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <div className="flex gap-6 items-start">
                  {club.imageUrl ? (
                    <img src={club.imageUrl} alt={club.name} className="w-24 h-24 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-slate-200 flex-shrink-0 flex items-center justify-center text-xs text-slate-500">
                      No Image
                    </div>
                  )}
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-blue-900 mb-2 text-left">{club.name}</h2>
                    <p className="text-slate-700 mb-4 italic text-left">
                      "{club.description || 'No description'}"
                    </p>
                    <p className="text-sm text-slate-700">Category: {club.category?.name || 'Unknown category'}</p>
                  </div>
                </div>
              </div>

              <div className="md:col-span-1">
                <div className="bg-white rounded-lg p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-6">Quick Stats</h3>
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 flex items-center gap-2">
                        <Package className="w-4 h-4 text-blue-900" />
                        Projects
                      </span>
                      <span className="font-semibold text-blue-900">({stats?.projectsCount ?? 0})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 flex items-center gap-2">
                        <LayoutGrid className="w-4 h-4 text-blue-900" />
                        Modules
                      </span>
                      <span className="font-semibold text-blue-900">(0)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-900" />
                        Joined Members
                      </span>
                      <span className="font-semibold text-blue-900">({stats?.membersCount ?? 0})</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setJoinError('');
                      setMemberForm((prev) => ({
                        fullName: prev.fullName || authUser.fullName || authUser.name || '',
                        email: prev.email || authUser.email || '',
                      }));
                      setShowMemberModal(true);
                    }}
                    className="w-full py-3 rounded-lg font-semibold transition-colors bg-blue-900 text-white hover:bg-blue-700"
                  >
                    Join Club
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showMemberModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-blue-900">Member Information</h2>
              <button
                onClick={() => setShowMemberModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-slate-500" />
              </button>
            </div>

            <form
              id="member-info-form"
              className="p-6 space-y-6"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!validateMemberForm()) return;
                const email = memberForm.email.trim().toLowerCase();
                const fullName = memberForm.fullName.trim();
                const normalizedClubId = String(club.id);
                setJoinError('');

                try {
                  const registered = await registerMemberForClub({
                    fullName,
                    email,
                    clubId: normalizedClubId,
                  }).unwrap();

                  sessionStorage.setItem(
                    'pendingMemberInfo',
                    JSON.stringify({
                      userId: registered.userId,
                      clubId: normalizedClubId,
                      email,
                      fullName,
                    }),
                  );

                  setShowMemberModal(false);
                  navigate(`/clubs/${club.id}/test`);
                } catch (err) {
                  const message = (err as { data?: { message?: string | string[] } })?.data
                    ?.message;
                  if (Array.isArray(message)) {
                    setJoinError(message[0] ?? 'Unable to register for club test.');
                    return;
                  }
                  setJoinError(
                    typeof message === 'string' && message.trim()
                      ? message
                      : 'Unable to register for club test.',
                  );
                }
              }}
            >
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
              {joinError && <p className="text-sm text-red-600">{joinError}</p>}
            </form>

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
                disabled={isRegisteringMember}
                className="flex-1 px-4 py-3 bg-blue-900 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                {isRegisteringMember ? 'Preparing Test...' : 'Continue To Test'}
              </button>
            </div>
          </div>
        </div>
      )}

        <Footer />
      </div>
    </MemberPageLayout>
  );
}
