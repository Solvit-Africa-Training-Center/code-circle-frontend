import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import bg1 from '@/assets/home_11.jpeg';
import bg2 from '@/assets/home_1111.jpeg';
import bg3 from '@/assets/home_11111.jpeg';
import { getCameraStream, getScreenStream } from '@/utils/testProctoring';

type LeaderAnswers = {
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string;
  q6: string;
};

export default function LeaderApplyTestPage() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<LeaderAnswers>({
    q1: '',
    q2: '',
    q3: '',
    q4: '',
    q5: '',
    q6: ''
  });

  const totalTimeSeconds = 12 * 60;
  const [timeLeft, setTimeLeft] = useState(totalTimeSeconds);
  const [submitted, setSubmitted] = useState(false);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const hasCamera = Boolean(getCameraStream());
  const hasScreen = Boolean(getScreenStream());
  const canTakeTest = hasCamera && hasScreen;

  useEffect(() => {
    if (submitted) return;
    if (timeLeft <= 0) {
      handleSubmit(true);
      return;
    }
    const timerId = window.setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => window.clearInterval(timerId);
  }, [submitted, timeLeft]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainder = Math.max(0, seconds % 60);
    return `${minutes}:${remainder.toString().padStart(2, '0')}`;
  };

  const questions = [
    {
      id: 'q1',
      number: 1,
      question: 'Which trait is most important for a club leader?',
      options: [
        'Strictness',
        'Clear communication',
        'Doing all tasks alone',
        'Avoiding feedback'
      ]
    },
    {
      id: 'q2',
      number: 2,
      question: 'How should a leader handle a struggling member?',
      options: [
        'Ignore them',
        'Offer support and guidance',
        'Remove them immediately',
        'Assign harder tasks'
      ]
    },
    {
      id: 'q3',
      number: 3,
      question: 'What is the best way to set expectations for a club project?',
      options: [
        'Keep it informal',
        'Document goals, timeline, and roles',
        'Only tell senior members',
        'Decide after the deadline'
      ]
    },
    {
      id: 'q4',
      number: 4,
      question: 'How should conflicts be resolved in a team?',
      options: [
        'Let it escalate',
        'Hold a respectful discussion',
        'Pick a favorite side',
        'Avoid addressing it'
      ]
    },
    {
      id: 'q5',
      number: 5,
      question: 'What is a good practice for ensuring quality work?',
      options: [
        'Skip reviews',
        'Use peer reviews and checkpoints',
        'Wait until the end',
        'Only review when issues appear'
      ]
    },
    {
      id: 'q6',
      number: 6,
      question: 'How should a leader track progress on weekly goals?',
      options: [
        'No tracking',
        'Weekly check-ins and updates',
        'Wait until the final week',
        'Only track attendance'
      ]
    }
  ];

  const correctAnswers = {
    q1: 'Clear communication',
    q2: 'Offer support and guidance',
    q3: 'Document goals, timeline, and roles',
    q4: 'Hold a respectful discussion',
    q5: 'Use peer reviews and checkpoints',
    q6: 'Weekly check-ins and updates'
  };

  const handleAnswerChange = (questionId: keyof LeaderAnswers, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = (fromTimer = false) => {
    if (submitted) return;
    setSubmitted(true);
    if (fromTimer) {
      setAutoSubmitted(true);
    }

    let score = 0;
    Object.entries(answers).forEach(([key, answer]) => {
      if (correctAnswers[key as keyof typeof correctAnswers] === answer) {
        score++;
      }
    });

    const answeredCount = Object.values(answers).filter(Boolean).length;
    const attemptedAll = answeredCount === questions.length;

    const resultPayload = {
      score,
      totalQuestions: questions.length,
      attemptedAll,
      answeredCount
    };

    sessionStorage.setItem('leaderApplyResult', JSON.stringify(resultPayload));

    const formRaw = sessionStorage.getItem('leaderApplyForm');
    const formPayload = formRaw ? JSON.parse(formRaw) : null;
    const existingApps = (() => {
      try {
        const raw = localStorage.getItem('leaderApplications');
        return raw ? (JSON.parse(raw) as unknown[]) : [];
      } catch {
        return [];
      }
    })();

    if (formPayload) {
      const nextApp = {
        id: `${Date.now()}`,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        testResult: resultPayload,
        ...formPayload
      };
      const filtered = existingApps.filter((app) => {
        const typed = app as { email?: string };
        return typed.email !== formPayload.email;
      });
      localStorage.setItem('leaderApplications', JSON.stringify([nextApp, ...filtered]));
    }

    navigate('/leader/apply/result', {
      state: resultPayload
    });
  };

  return (
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
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-3 tracking-tight">Leader Test</h1>
          <Link to="/leader/apply/form" className="inline-flex items-center gap-2 text-blue-200 hover:text-white transition-colors">
            <span>{'<'}</span>
            <span>Back</span>
          </Link>
        </div>
      </div>

      <div className="flex-1 relative w-full py-12">
        <div className="mx-auto max-w-4xl px-5 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <div className="rounded-lg border border-slate-200 bg-white p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Time Remaining</p>
                <p className={`text-lg font-semibold ${timeLeft <= 60 ? 'text-red-700' : 'text-blue-900'}`}>
                  {formatTime(timeLeft)}
                </p>
              </div>
              <div className="text-xs text-slate-500">
                Multiple-choice only
              </div>
            </div>

            {!canTakeTest && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                Please complete the test protocol (camera and screen share) before starting.
                <Link to="/leader/apply/protocol" className="ml-2 font-semibold text-blue-900 underline">
                  Go to protocol
                </Link>
              </div>
            )}

            {autoSubmitted && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                Time is up. Your answers have been submitted automatically.
              </div>
            )}

            {questions.map((q) => (
              <div key={q.id} className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-blue-900 mb-4">Question {q.number}</h3>
                <p className="text-slate-900 mb-4 font-medium">{q.question}</p>

                <div className="space-y-3">
                  {q.options.map((option) => (
                    <label 
                      key={option}
                      className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded transition-colors"
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={option}
                        checked={answers[q.id as keyof LeaderAnswers] === option}
                        onChange={(e) => handleAnswerChange(q.id as keyof LeaderAnswers, e.target.value)}
                        className="w-4 h-4 text-blue-900 focus:ring-blue-900"
                        disabled={submitted}
                      />
                      <span className="text-slate-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex justify-center pt-6">
              <button
                onClick={() => handleSubmit(false)}
                className={`px-12 py-3 font-semibold rounded-lg transition-colors ${
                  submitted || !canTakeTest
                    ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                    : 'bg-blue-900 text-white hover:bg-blue-700'
                }`}
                disabled={submitted || !canTakeTest}
              >
                {submitted ? 'Submitted' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
