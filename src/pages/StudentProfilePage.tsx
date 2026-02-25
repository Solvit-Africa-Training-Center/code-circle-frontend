import { useMemo, useState } from 'react';
import { Mail, MapPin, ShieldCheck, Trophy, UserCircle2, Menu } from 'lucide-react';
import StudentSidebar from '@/components/student/StudentSidebar';
import { clubs as baseClubs } from '@/data/clubs';
import MobileSidebarDrawer from '@/components/layout/MobileSidebarDrawer';
import { useGetActiveClubsQuery } from '@/features/ClubsApi';

export default function StudentProfilePage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data: backendClubs = [] } = useGetActiveClubsQuery();
  const authUser = useMemo(() => {
    try {
      const raw = localStorage.getItem('authUser');
      return raw ? (JSON.parse(raw) as { email?: string }) : {};
    } catch {
      return {};
    }
  }, []);

  const studentProfile = useMemo(() => {
    try {
      const raw = localStorage.getItem('studentMembers');
      const members = raw ? (JSON.parse(raw) as { email: string; fullName: string; clubId: number }[]) : [];
      return members.find((member) => member.email === authUser.email);
    } catch {
      return undefined;
    }
  }, [authUser.email]);

  const joinedClubIds = useMemo(() => {
    try {
      const raw = localStorage.getItem('studentJoinedClubs');
      return raw ? (JSON.parse(raw) as Array<number | string>).map((id) => String(id)) : [];
    } catch {
      return [];
    }
  }, []);

  const mergedClubs = useMemo(() => {
    try {
      const stored = localStorage.getItem('leaderCreatedClubs');
      const leaderClubs = stored ? JSON.parse(stored) : [];
      return [...backendClubs, ...leaderClubs, ...baseClubs];
    } catch {
      return [...backendClubs, ...baseClubs];
    }
  }, [backendClubs]);

  const joinedClubs = useMemo(
    () => mergedClubs.filter((club) => joinedClubIds.includes(String(club.id))),
    [joinedClubIds, mergedClubs]
  );

  return (
    <div className="min-h-screen w-full bg-slate-100">
      <div className="flex min-h-screen">
        <StudentSidebar />
        <MobileSidebarDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Student Menu">
          <StudentSidebar variant="mobile" />
        </MobileSidebarDrawer>

        <main className="flex-1 px-5 py-6 lg:px-8 lg:ml-64">
          <div className="rounded-3xl bg-white border border-slate-200 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="lg:hidden rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-600"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div className="h-16 w-16 rounded-2xl bg-blue-100 flex items-center justify-center">
                  <UserCircle2 className="h-8 w-8 text-blue-700" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-blue-600 font-semibold">Student Profile</p>
                  <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 mt-2">
                    {studentProfile?.fullName || 'Student'}
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">{authUser.email || 'Email not set'}</p>
                </div>
              </div>
              <button className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100">
                Edit Profile
              </button>
            </div>
          </div>

          <section className="mt-6 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
            <div className="rounded-3xl bg-white border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900">Profile Details</h2>
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="text-sm font-semibold text-slate-900">{authUser.email || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-slate-500">Location</p>
                    <p className="text-sm font-semibold text-slate-900">Kigali, Rwanda</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4">
                  <ShieldCheck className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-slate-500">Status</p>
                    <p className="text-sm font-semibold text-slate-900">Verified Student</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4">
                  <Trophy className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-slate-500">Achievement</p>
                    <p className="text-sm font-semibold text-slate-900">Test Passer</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900">Joined Clubs</h2>
              <div className="mt-4 space-y-3">
                {joinedClubs.map((club) => (
                  <div key={club.id} className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-sm font-semibold text-slate-900">{club.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{club.category?.name ?? club.category ?? 'Unknown category'}</p>
                  </div>
                ))}
                {joinedClubs.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                    No joined clubs yet.
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
