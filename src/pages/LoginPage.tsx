import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import bg1 from '@/assets/home_11.jpeg';
import bg2 from '@/assets/home_1111.jpeg';
import bg3 from '@/assets/home_11111.jpeg';
import CodeCircleLogo from '@/components/common/CodeCircleLogo';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const studentDefaultPassword = 'member123';
  const adminDefault = { email: 'admin@codecircle.com', password: 'admin123' };

  const handleSignIn = () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail === adminDefault.email && password === adminDefault.password) {
      setError('');
      localStorage.setItem('authUser', JSON.stringify({ email: normalizedEmail, role: 'admin' }));
      const redirectTo = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
      navigate(redirectTo || '/admin/dashboard');
      return;
    }
    const tempLeaders = (() => {
      try {
        const raw = localStorage.getItem('leaderTempCredentials');
        return raw
          ? (JSON.parse(raw) as { email: string; password: string; expiresAt: string; fullName?: string }[])
          : [];
      } catch {
        return [];
      }
    })();
    const tempMatch = tempLeaders.find(
      (leader) => leader.email?.toLowerCase() === normalizedEmail && leader.password === password
    );
    if (tempMatch) {
      const isExpired = Date.now() > new Date(tempMatch.expiresAt).getTime();
      if (isExpired) {
        const remaining = tempLeaders.filter((leader) => leader.email?.toLowerCase() !== normalizedEmail);
        localStorage.setItem('leaderTempCredentials', JSON.stringify(remaining));
        setError('Temporary password expired. Please contact admin for a new one.');
        return;
      }
      setError('');
      localStorage.setItem(
        'authUser',
        JSON.stringify({
          email: normalizedEmail,
          role: 'leader',
          mustChange: true,
          fullName: tempMatch.fullName
        })
      );
      navigate('/leader/change-password');
      return;
    }

    const approvedLeaders = (() => {
      try {
        const raw = localStorage.getItem('leaderCredentials');
        return raw ? (JSON.parse(raw) as { email: string; password: string; fullName?: string }[]) : [];
      } catch {
        return [];
      }
    })();
    const matchedLeader = approvedLeaders.find(
      (leader) => leader.email?.toLowerCase() === normalizedEmail && leader.password === password
    );
    if (matchedLeader) {
      setError('');
      localStorage.setItem(
        'authUser',
        JSON.stringify({
          email: normalizedEmail,
          role: 'leader',
          mustChange: false,
          fullName: matchedLeader.fullName
        })
      );
      const redirectTo = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
      navigate(redirectTo || '/leader/dashboard');
      return;
    }
    const studentMembers = (() => {
      try {
        const raw = localStorage.getItem('studentMembers');
        return raw ? (JSON.parse(raw) as { email: string }[]) : [];
      } catch {
        return [];
      }
    })();
    const isStudent = studentMembers.some((member) => member.email === normalizedEmail);
    if (isStudent && password === studentDefaultPassword) {
      setError('');
      localStorage.setItem('authUser', JSON.stringify({ email: normalizedEmail, role: 'student' }));
      const redirectTo = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
      navigate(redirectTo || '/student/dashboard');
      return;
    }
    setError(
      `Invalid credentials. Admin uses admin@codecircle.com / admin123. ` +
        `Leaders must use admin-approved credentials. ` +
        `Member must use the email submitted in the club member form with password ${studentDefaultPassword}.`
    );
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-slate-950">
      <div className="fixed inset-0">
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
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-900/80 to-slate-950/95"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.25),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(14,165,233,0.18),transparent_50%),radial-gradient(circle_at_50%_80%,rgba(147,197,253,0.15),transparent_55%)]"></div>
      </div>

      <div className="relative z-10 flex h-screen items-center justify-center px-5 py-6 sm:py-8">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-white/20 bg-white/10 p-8 shadow-[0_30px_80px_rgba(2,6,23,0.55)] backdrop-blur-md">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center gap-2 text-blue-200">
                <CodeCircleLogo
                  asLink
                  className="text-white text-2xl"
                  iconClassName="text-2xl text-blue-400"
                  textClassName="tracking-wide"
                />
              </div>
              <p className="mt-3 text-lg text-blue-100/90">Creator Login</p>
            </div>

            <button
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-lg border border-white/20 bg-white/90 px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-white transition-colors"
              type="button"
            >
              <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5Z" />
                <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6 29.3 4 24 4 16.3 4 9.6 8.4 6.3 14.7Z" />
                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.5-5.2l-6.2-5.2C29.2 35.5 26.7 36 24 36c-5.2 0-9.6-3.3-11.2-7.9l-6.5 5C9.6 39.6 16.3 44 24 44Z" />
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 2.7-3.3 5-6.3 6.4l.1.1 6.2 5.2c-.4.4 8.7-6.4 8.7-15.7 0-1.2-.1-2.3-.4-3.5Z" />
              </svg>
              Sign in with Google Account
            </button>

            <div className="my-6 flex items-center gap-3 text-xs text-blue-100/70">
              <div className="h-px flex-1 bg-white/20"></div>
              <span>Or</span>
              <div className="h-px flex-1 bg-white/20"></div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-blue-100/70 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-white-90 placeholder:text-blue-100/50 focus:outline-none focus:ring-2 focus:ring-blue-400/60"
                />
              </div>

              <div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-blue-100/70 mb-2">
                    Password
                  </label>
                  
                </div>
                
                  <input
                  type="password"
                  placeholder="Enter a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-blue-100/50 focus:outline-none focus:ring-2 focus:ring-blue-400/60"
                />
                <button
                    type="button"
                    className="text-xs text-blue-200 hover:text-white transition-colors"
                  >
                    Forgot password
                  </button>

                
              </div>
            </div>

            {error && (
              <p className="mt-4 text-xs text-rose-200 bg-rose-500/10 border border-rose-200/20 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <button
              className="mt-6 w-full rounded-lg bg-blue-900 text-white font-semibold py-2.5 hover:bg-blue-700 transition-colors"
              type="button"
              onClick={handleSignIn}
            >
              Sign In
            </button>

            <button
              className="mt-4 w-full text-center text-xs text-blue-100/70 hover:text-white transition-colors"
              type="button"
              onClick={() => navigate('/')}
            >
              Back Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
