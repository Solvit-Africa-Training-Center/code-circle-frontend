import { useEffect, useMemo, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import bg1 from '@/assets/home_11.jpeg';
import bg2 from '@/assets/home_1111.jpeg';
import bg3 from '@/assets/home_11111.jpeg';

export default function ClubResultsPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const storedResult = (() => {
    try {
      const raw = sessionStorage.getItem('clubTestResult');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const { score, totalQuestions, attemptedAll, answeredCount } = location.state ||
    storedResult || {
      score: 0,
      totalQuestions: 5,
      attemptedAll: false,
      answeredCount: 0
    };

  const safeAnsweredCount = Math.max(0, answeredCount);
  const percentage =
    safeAnsweredCount > 0 ? Math.round((score / safeAnsweredCount) * 100) : 0;
  const passed = percentage >= 70;
  const notAnswered = Math.max(0, totalQuestions - safeAnsweredCount);
  const [retryError, setRetryError] = useState('');

  const retryKey = useMemo(() => `clubTestLastFailedAt:${id ?? 'unknown'}`, [id]);
  const retryCooldownMs = 7 * 24 * 60 * 60 * 1000;

  // Calculate the stroke dash offset for the circular progress
  const radius = 95;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  const handleLogin = () => {
    // Navigate to login or show login modal
    navigate('/login');
  };

  useEffect(() => {
    if (passed) {
      try {
        const pendingRaw = sessionStorage.getItem('pendingMemberInfo');
        if (pendingRaw) {
          const pending = JSON.parse(pendingRaw) as {
            clubId: number;
            email: string;
            fullName: string;
          };
          const memberRaw = localStorage.getItem('studentMembers');
          const existing = memberRaw ? (JSON.parse(memberRaw) as typeof pending[]) : [];
          const next = [
            ...existing.filter((m) => m.email !== pending.email),
            pending
          ];
          localStorage.setItem('studentMembers', JSON.stringify(next));
          sessionStorage.removeItem('pendingMemberInfo');
        }
      } catch {
        // Ignore storage errors for demo flows
      }
    }

    if (!passed) {
      const existing = localStorage.getItem(retryKey);
      if (!existing) {
        localStorage.setItem(retryKey, String(Date.now()));
      }
    }
  }, [passed, retryKey]);

  const handleRetry = () => {
    const lastFailedAt = localStorage.getItem(retryKey);
    if (lastFailedAt) {
      const elapsed = Date.now() - Number(lastFailedAt);
      if (!Number.isNaN(elapsed) && elapsed < retryCooldownMs) {
        const remainingMs = retryCooldownMs - elapsed;
        const remainingDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
        setRetryError(`You can retry after ${remainingDays} day(s). Please prepare and try again later.`);
        return;
      }
    }

    setRetryError('');
    navigate(`/clubs/${id}/test/quiz`);
  };

  return (
    <div className="w-full overflow-x-hidden bg-white min-h-screen flex flex-col">
      <Header />

      {/* Page Title Section */}
      <div className="relative w-full h-[250px] md:h-[280px] flex items-start justify-center overflow-hidden">
        {/* Animated Background Images Container */}
        <div className="absolute inset-0 z-0">
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
        </div>

        {/* Dark Overlay */}
        <div className="absolute inset-0 z-[1] bg-slate-900/50"></div>

        {/* Content */}
        <div className="relative z-10 text-left text-white w-full max-w-6xl px-5 sm:px-6 lg:px-8 pt-20">
          <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-blue-100/80">
            Club Test Result
          </p>
          <h1 className="text-3xl md:text-5xl font-semibold leading-tight mb-3 tracking-tight">
            Creator Test
          </h1>
          <button
            onClick={() => navigate(`/clubs/${id}`)}
            className="inline-flex items-center gap-2 text-blue-200 hover:text-white transition-colors"
          >
            <span>&lt;</span>
            <span>Home</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative w-full bg-slate-50 py-12 md:py-16">
        <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8">
          {/* Results Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
            <div className="flex flex-col lg:flex-row gap-10 items-center">
              {/* Progress */}
              <div className="relative">
                <svg className="w-56 h-56 md:w-64 md:h-64 transform -rotate-90">
                  <circle cx="50%" cy="50%" r={radius} stroke="#E5E7EB" strokeWidth="10" fill="none" />
                  <circle
                    cx="50%"
                    cy="50%"
                    r={radius}
                    stroke={passed ? '#16A34A' : '#991B1B'}
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {passed ? (
                    <svg className="w-10 h-10 text-green-600 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <polyline points="20 6 9 17 4 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg className="w-10 h-10 text-red-800 mb-2" viewBox="0 0 50 50" fill="currentColor">
                      <path d="M13.3337 39.5827L10.417 36.666L22.0837 24.9993L10.417 13.3327L13.3337 10.416L25.0003 22.0827L36.667 10.416L39.5837 13.3327L27.917 24.9993L39.5837 36.666L36.667 39.5827L25.0003 27.916L13.3337 39.5827Z" />
                    </svg>
                  )}
                  <span className={`text-4xl md:text-5xl font-semibold ${passed ? 'text-green-600' : 'text-red-800'}`}>
                    {percentage}%
                  </span>
                  <span className="text-xs uppercase tracking-[0.2em] text-gray-400 mt-2">
                    Average
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 text-center lg:text-left">
                <div className="mb-6">
                  {passed ? (
                    <>
                      <h2 className="text-2xl md:text-4xl font-semibold text-blue-900 mb-3">
                        Congratulations, You Passed!
                      </h2>
                      <p className="text-base md:text-lg text-slate-700">
                        Use the email you submitted in the member form and the default password
                        <span className="font-semibold"> student123</span> to login.
                      </p>
                    </>
                  ) : (
                    <>
                      <h2 className="text-2xl md:text-4xl font-semibold text-blue-900 mb-3">
                        Sorry!, You didn't Pass the Test !
                      </h2>
                      <p className="text-base md:text-lg text-slate-700">
                        Use these links to prepare before taking the test again:
                        <span className="block mt-2">
                          <a
                            href="https://www.youtube.com"
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-900 font-semibold hover:underline"
                          >
                            YouTube Tutorials
                          </a>
                          <span className="mx-2 text-slate-400">•</span>
                          <a
                            href="https://www.freecodecamp.org"
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-900 font-semibold hover:underline"
                          >
                            freeCodeCamp
                          </a>
                        </span>
                      </p>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3 text-center mb-6">
                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Score</p>
                    <p className="text-xl font-semibold text-slate-900 mt-1">{score}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Total</p>
                    <p className="text-xl font-semibold text-slate-900 mt-1">{totalQuestions}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Missed</p>
                    <p className="text-xl font-semibold text-slate-900 mt-1">{notAnswered}</p>
                  </div>
                </div>

                <p className="text-sm text-slate-500 mb-6">
                  Completion required: all questions must be attempted.
                </p>

                {retryError && (
                  <p className="text-sm text-red-700 mb-4">{retryError}</p>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  {passed ? (
                    <button
                      onClick={handleLogin}
                      className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Login
                    </button>
                  ) : (
                    <button
                     >
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/clubs/${id}`)}
                    className="px-8 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Back to Club
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
