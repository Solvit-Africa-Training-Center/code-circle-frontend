import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

export default function LeaderChangePasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = () => {
    setError('');
    setSuccess('');
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    const authRaw = localStorage.getItem('authUser');
    const authUser = authRaw ? JSON.parse(authRaw) : null;
    if (!authUser?.email) {
      setError('Unable to verify account. Please log in again.');
      return;
    }

    const existingCreds = (() => {
      try {
        const raw = localStorage.getItem('leaderCredentials');
        return raw ? (JSON.parse(raw) as { email: string; password: string; approvedAt: string }[]) : [];
      } catch {
        return [];
      }
    })();
    const nextCreds = [
      {
        email: authUser.email,
        password,
        approvedAt: new Date().toISOString(),
        fullName: authUser.fullName
      },
      ...existingCreds.filter((cred) => cred.email !== authUser.email)
    ];
    localStorage.setItem('leaderCredentials', JSON.stringify(nextCreds));

    const existingTemp = (() => {
      try {
        const raw = localStorage.getItem('leaderTempCredentials');
        return raw
          ? (JSON.parse(raw) as { email: string; password: string; expiresAt: string }[])
          : [];
      } catch {
        return [];
      }
    })();
    localStorage.setItem(
      'leaderTempCredentials',
      JSON.stringify(existingTemp.filter((cred) => cred.email !== authUser.email))
    );

    localStorage.setItem(
      'authUser',
      JSON.stringify({ email: authUser.email, role: 'CLUB_LEADER', mustChange: false, fullName: authUser.fullName })
    );
    setSuccess('Password updated. Redirecting to your dashboard...');
    setTimeout(() => navigate('/leader/dashboard'), 900);
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 flex flex-col">
      <Header />
      <div className="flex-1 w-full px-5 py-12 pt-24">
        <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">Change Password</h1>
          <p className="mt-2 text-sm text-slate-600">
            For security, please set a new password before continuing.
          </p>

          {error && (
            <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              {success}
            </div>
          )}

          <div className="mt-5 space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
                placeholder="Confirm password"
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="mt-6 w-full rounded-lg bg-blue-900 text-white font-semibold py-2.5 hover:bg-blue-700 transition-colors"
          >
            Update Password
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
