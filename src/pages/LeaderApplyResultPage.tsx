import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import bg1 from '@/assets/home_11.jpeg';
import bg2 from '@/assets/home_1111.jpeg';
import bg3 from '@/assets/home_11111.jpeg';

type ResultState = {
  score: number;
  totalQuestions: number;
  attemptedAll: boolean;
  answeredCount: number;
};

export default function LeaderApplyResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const storedResult = (() => {
    try {
      const raw = sessionStorage.getItem('leaderApplyResult');
      return raw ? (JSON.parse(raw) as ResultState) : null;
    } catch {
      return null;
    }
  })();

  const { score, totalQuestions, attemptedAll, answeredCount } = location.state ||
    storedResult || {
      score: 0,
      totalQuestions: 6,
      attemptedAll: false,
      answeredCount: 0
    };

  const safeAnsweredCount = Math.max(0, answeredCount);
  const percentage =
    safeAnsweredCount > 0 ? Math.round((score / safeAnsweredCount) * 100) : 0;
  const passed = percentage >= 70;
  const notAnswered = Math.max(0, totalQuestions - safeAnsweredCount);
  const [retryError, setRetryError] = useState('');

  const retryKey = useMemo(() => 'leaderApplyLastFailedAt', []);
  const retryCooldownMs = 7 * 24 * 60 * 60 * 1000;

  const radius = 95;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
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
    navigate('/leader/apply/test');
  };

  return (
    <div className="w-full overflow-x-hidden bg-white min-h-screen flex flex-col">
      <Header />

      <div className="relative w-full h-[250px] md:h-[280px] flex items-start justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-cover bg-center opacity-0 animate-fade-in-out" style={{ backgroundImage: `url(${bg1})`, animationDelay: '0s' }}></div>
          <div className="absolute inset-0 bg-cover bg-center opacity-0 animate-fade-in-out" style={{ backgroundImage: `url(${bg2})`, animationDelay: '4s' }}></div>
          <div className="absolute inset-0 bg-cover bg-center opacity-0 animate-fade-in-out" style={{ backgroundImage: `url(${bg3})`, animationDelay: '8s' }}></div>
        </div>
        <div className="absolute inset-0 z-[1] bg-slate-900/50"></div>
        <div className="relative z-10 text-left text-white w-full max-w-6xl px-5 sm:px-6 lg:px-8 pt-20">
          <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-blue-100/80">
            Leader Test Result
          </p>
          <h1 className="text-3xl md:text-5xl font-semibold leading-tight mb-3 tracking-tight">
            Application Test
          </h1>
          <button
            onClick={() => navigate('/leader/apply')}
            className="inline-flex items-center gap-2 text-blue-200 hover:text-white transition-colors"
          >
            <span>{'<'}</span>
            <span>Home</span>
          </button>
        </div>
      </div>

      <div className="flex-1 relative w-full bg-slate-50 py-12 md:py-16">
        <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
            <div className="flex flex-col lg:flex-row gap-10 items-center">
              <div className="relative">
                <svg className="w-56 h-56 md:w-64 md:h-64 transform -rotate-90">
                  <circle cx="50%" cy="50%" r={radius} stroke="#E5E7EB" strokeWidth="10" fill="none" />
                  <circle
                    cx="50%" cy="50%"
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
                  <span className={`text-4xl md:text-5xl font-semibold ${passed ? 'text-green-600' : 'text-red-800'}`}>
                    {percentage}%
                  </span>
                  <span className="text-xs uppercase tracking-[0.2em] text-gray-400 mt-2">
                    Score
                  </span>
                </div>
              </div>

              <div className="flex-1 text-center lg:text-left">
                <div className="mb-6">
                  {passed ? (
                    <>
                      <h2 className="text-2xl md:text-4xl font-semibold text-blue-900 mb-3">
                        Great job, you passed!
                      </h2>
                      <p className="text-base md:text-lg text-slate-700">
                        Your leader application is ready for review. We will contact you by email with next steps.
                      </p>
                    </>
                  ) : (
                    <>
                      <h2 className="text-2xl md:text-4xl font-semibold text-blue-900 mb-3">
                        You didn’t pass this time
                      </h2>
                      <p className="text-base md:text-lg text-slate-700">
                        Review leadership basics and try again after the waiting period.
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
                      onClick={() => navigate('/login')}
                      className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Login
                    </button>
                  ) : (
                    <button
                      onClick={handleRetry}
                      className="px-8 py-3 bg-blue-900 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Retry Test
                    </button>
                  )}
                  <button
                    onClick={() => navigate('/leader/apply')}
                    className="px-8 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Back to Categories
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
