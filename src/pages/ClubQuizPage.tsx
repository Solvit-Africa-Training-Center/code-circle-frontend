import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import bg1 from '@/assets/home_11.jpeg';
import bg2 from '@/assets/home_1111.jpeg';
import bg3 from '@/assets/home_11111.jpeg';
import {
  useGetMemberTestByClubQuery,
  useSubmitMemberTestMutation,
} from '@/features/ClubTestsApi';
import { stopAllProctoring } from '@/utils/testProctoring';
import MemberPageLayout from '@/components/student/MemberPageLayout';

export default function ClubQuizPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const pendingMember = (() => {
    try {
      const raw = sessionStorage.getItem('pendingMemberInfo');
      if (!raw) return null;
      return JSON.parse(raw) as { userId?: string; clubId?: string };
    } catch {
      return null;
    }
  })();
  const hasMatchingPendingClub =
    !pendingMember?.clubId || String(pendingMember.clubId) === String(id);
  const {
    data: test,
    isLoading,
    isError,
  } = useGetMemberTestByClubQuery(id, { skip: !id });
  const [submitMemberTest, { isLoading: isSubmitting }] =
    useSubmitMemberTestMutation();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(10 * 60);
  const [submitError, setSubmitError] = useState('');

  const orderedQuestions = useMemo(() => {
    return [...(test?.questions ?? [])].sort(
      (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0),
    );
  }, [test?.questions]);

  useEffect(() => {
    if (!test) return;
    const perQuestionSeconds = 2 * 60;
    setTimeLeft(Math.max(5 * 60, orderedQuestions.length * perQuestionSeconds));
  }, [test, orderedQuestions.length]);

  useEffect(() => {
    if (!test) return;
    if (timeLeft <= 0) {
      void handleSubmit(true);
      return;
    }
    const timerId = window.setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => window.clearInterval(timerId);
  }, [timeLeft, test]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(Math.max(0, seconds) / 60);
    const remainder = Math.max(0, seconds % 60);
    return `${minutes}:${remainder.toString().padStart(2, '0')}`;
  };

  const getErrorMessage = (err: unknown, fallback: string) => {
    const message = (err as { data?: { message?: string | string[] } })?.data
      ?.message;
    if (Array.isArray(message)) return message[0] ?? fallback;
    if (typeof message === 'string' && message.trim()) return message;
    return fallback;
  };

  const handleSubmit = async (fromTimer = false) => {
    if (!test) return;
    const applicantUserId = pendingMember?.userId;
    if (!applicantUserId || !hasMatchingPendingClub) {
      setSubmitError('Missing member application session. Please restart from club join.');
      return;
    }

    const unanswered = orderedQuestions.filter((q) => !answers[q.id]?.trim());
    if (!fromTimer && unanswered.length > 0) {
      setSubmitError('Please answer all questions before submitting.');
      return;
    }

    setSubmitError('');
    try {
      const result = await submitMemberTest({
        userId: applicantUserId,
        testId: test.id,
        answers,
        purpose: 'JOIN_CLUB',
        targetClubId: id,
      }).unwrap();

      const answeredCount = Object.values(answers).filter(
        (value) => value && value.trim().length > 0,
      ).length;
      const resultPayload = {
        score: result.score ?? 0,
        totalQuestions: orderedQuestions.length,
        attemptedAll: answeredCount === orderedQuestions.length,
        answeredCount,
      };

      sessionStorage.setItem('clubTestResult', JSON.stringify(resultPayload));
      stopAllProctoring();
      navigate(`/clubs/${id}/test/results`, { state: resultPayload });
    } catch (err) {
      setSubmitError(getErrorMessage(err, 'Unable to submit test.'));
    }
  };

  return (
    <MemberPageLayout>
      <div className="w-full overflow-x-hidden bg-slate-50 min-h-screen flex flex-col">
        <Header />

      <div className="relative w-full h-[250px] md:h-[280px] flex items-start justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-cover bg-center opacity-0 animate-fade-in-out" style={{backgroundImage: `url(${bg1})`, animationDelay: '0s'}}></div>
          <div className="absolute inset-0 bg-cover bg-center opacity-0 animate-fade-in-out" style={{backgroundImage: `url(${bg2})`, animationDelay: '4s'}}></div>
          <div className="absolute inset-0 bg-cover bg-center opacity-0 animate-fade-in-out" style={{backgroundImage: `url(${bg3})`, animationDelay: '8s'}}></div>
        </div>
        <div className="absolute inset-0 z-[1]"></div>
        <div className="relative z-10 text-left text-white w-full max-w-7xl px-5 sm:px-6 lg:px-8 pt-20">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-3 tracking-tight">Club Test</h1>
          <Link to={`/clubs/${id}`} className="inline-flex items-center gap-2 text-blue-200 hover:text-white transition-colors">
            <span>{'<'}</span>
            <span>Home</span>
          </Link>
        </div>
      </div>

      <div className="flex-1 relative w-full py-12">
        <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-slate-200 bg-white p-4 flex items-center justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Time Remaining
              </p>
              <p
                className={`text-lg font-semibold ${timeLeft <= 60 ? 'text-red-700' : 'text-blue-900'}`}
              >
                {formatTime(timeLeft)}
              </p>
            </div>
            <div className="text-xs text-slate-500">
              {orderedQuestions.length} questions
            </div>
          </div>

          {isLoading && (
            <div className="rounded-lg border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
              Loading club test...
            </div>
          )}

          {isError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              No test is available for this club yet. Ask the leader to generate
              club questions first.
            </div>
          )}

          {!isLoading && !isError && (!pendingMember?.userId || !hasMatchingPendingClub) && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
              Missing member application session. Please go back to the club page,
              fill the join form, then start the test again.
            </div>
          )}

          {!isLoading && !isError && orderedQuestions.length > 0 && (
            <div className="space-y-6">
              {orderedQuestions.map((question, idx) => (
                <div key={question.id} className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                  <h3 className="text-lg font-bold text-blue-900 mb-3">
                    Question {idx + 1}
                  </h3>
                  <p className="text-slate-900 mb-4 font-medium">{question.question}</p>

                  {Array.isArray(question.options) && question.options.length > 0 ? (
                    <div className="space-y-3">
                      {question.options.map((option) => (
                        <label
                          key={option}
                          className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded transition-colors"
                        >
                          <input
                            type="radio"
                            name={question.id}
                            value={option}
                            checked={answers[question.id] === option}
                            onChange={(event) =>
                              setAnswers((prev) => ({
                                ...prev,
                                [question.id]: event.target.value,
                              }))
                            }
                            className="w-4 h-4 text-blue-900 focus:ring-blue-900"
                          />
                          <span className="text-slate-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <textarea
                      value={answers[question.id] ?? ''}
                      onChange={(event) =>
                        setAnswers((prev) => ({
                          ...prev,
                          [question.id]: event.target.value,
                        }))
                      }
                      className="w-full min-h-[120px] rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                      placeholder="Write your answer..."
                    />
                  )}
                </div>
              ))}

              {submitError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {submitError}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => void handleSubmit(false)}
                  disabled={isSubmitting}
                  className={`px-10 py-3 font-semibold rounded-lg transition-colors ${
                    isSubmitting
                      ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                      : 'bg-blue-900 text-white hover:bg-blue-700'
                  }`}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Test'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

        <Footer />
      </div>
    </MemberPageLayout>
  );
}
