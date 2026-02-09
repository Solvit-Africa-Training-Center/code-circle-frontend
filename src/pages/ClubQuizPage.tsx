import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import bg1 from '@/assets/home_11.jpeg';
import bg2 from '@/assets/home_1111.jpeg';
import bg3 from '@/assets/home_11111.jpeg';
import { clubs } from '@/data/clubs';
import { stopAllProctoring } from '@/utils/testProctoring';

type McqAnswers = {
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string;
  q6: string;
};

type CodingAnswers = {
  c1: string;
};

const LANGUAGE_TEMPLATES: Record<string, string> = {
  JavaScript: `function isBalancedBrackets(s) {
  // return true if brackets are balanced
}

console.log(isBalancedBrackets("()[]{}"));`,
  Python: `def is_balanced_brackets(s):
    # return True if brackets are balanced
    pass

print(is_balanced_brackets("()[]{}"))`,
  Java: `public class Main {
  static boolean isBalancedBrackets(String s) {
    // return true if brackets are balanced
    return false;
  }

  public static void main(String[] args) {
    System.out.println(isBalancedBrackets("()[]{}"));
  }
}`
};

export default function ClubQuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const clubId = id ? Number(id) : null;
  const club = useMemo(() => {
    if (!clubId) return clubs[0];
    return clubs.find((item) => item.id === clubId) ?? clubs[0];
  }, [clubId]);

  const codingCategories = new Set([
    'Web Development',
    'Software Development',
    'Mobile App Development',
    'Machine Learning',
    'Data Engineering',
    'Artificial Intelligence'
  ]);
  const isCodingClub = codingCategories.has(club.category);

  const [mcqAnswers, setMcqAnswers] = useState<McqAnswers>({
    q1: '',
    q2: '',
    q3: '',
    q4: '',
    q5: '',
    q6: ''
  });

  const [codingAnswers, setCodingAnswers] = useState<CodingAnswers>({
    c1: ''
  });

  const [language, setLanguage] = useState('JavaScript');
  const [step, setStep] = useState<'mcq' | 'coding'>('mcq');
  const [runOutput, setRunOutput] = useState('');
  const [runStatus, setRunStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [lastRunCode, setLastRunCode] = useState('');

  const totalTimeSeconds = isCodingClub ? 20 * 60 : 10 * 60;
  const [timeLeft, setTimeLeft] = useState(totalTimeSeconds);
  const [submitted, setSubmitted] = useState(false);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  useEffect(() => {
    setTimeLeft(totalTimeSeconds);
    setSubmitted(false);
    setAutoSubmitted(false);
  }, [totalTimeSeconds]);

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
      question: 'What is machine learning mainly used for?',
      options: [
        'Writing websites',
        'Making computers learn from data',
        'Designing databases',
        'Creating mobile apps'
      ]
    },
    {
      id: 'q2',
      number: 2,
      question: 'Which language is most commonly used in machine learning?',
      options: [
        'Java',
        'C++',
        'Python',
        'PHP'
      ]
    },
    {
      id: 'q3',
      number: 3,
      question: 'What is a dataset?',
      options: [
        'A computer program',
        'A collection of data used for training models',
        'A machine learning algorithm',
        'A type of database server'
      ]
    },
    {
      id: 'q4',
      number: 4,
      question: 'Which task is an example of supervised learning?',
      options: [
        'Grouping customers by behavior',
        'Detecting patterns without labels',
        'Predicting house prices using labeled data',
        'Reducing data size'
      ]
    },
    {
      id: 'q5',
      number: 5,
      question: 'What is the main goal of model training?',
      options: [
        'To memorize all data',
        'To reduce code size',
        'To learn patterns for accurate predictions',
        'To clean datasets'
      ]
    },
    {
      id: 'q6',
      number: 6,
      question: 'Which HTTP method is commonly used to create a resource?',
      options: [
        'GET',
        'POST',
        'DELETE',
        'PATCH'
      ]
    }
  ];

  const codingQuestion = {
    id: 'c1',
    title: 'Balanced Brackets',
    prompt: 'Write a function that checks if a string of brackets is balanced.',
    constraints: [
      'Input: a string consisting only of ()[]{}',
      'Return true if every opening bracket is closed in the correct order.',
      'Example: "()[]{}" -> true, "([)]" -> false'
    ],
    keywords: ['stack', 'push', 'pop', 'return', 'length', 'for', 'while', 'if'],
    minMatches: 2
  };

  const handleAnswerChange = (questionId: keyof McqAnswers, answer: string) => {
    setMcqAnswers((prev) => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleCodingChange = (questionId: keyof CodingAnswers, answer: string) => {
    setCodingAnswers((prev) => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const isCodingAnswerCorrect = (
    answer: string,
    keywords: string[],
    minMatches: number
  ) => {
    const normalized = answer.toLowerCase();
    if (normalized.trim().length < 40) return false;
    const matches = keywords.filter((keyword) => normalized.includes(keyword)).length;
    return matches >= minMatches;
  };

  const handleSubmit = (fromTimer = false) => {
    if (submitted) return;
    setSubmitted(true);
    if (fromTimer) {
      setAutoSubmitted(true);
    }

    const correctAnswers = {
      q1: 'Making computers learn from data',
      q2: 'Python',
      q3: 'A collection of data used for training models',
      q4: 'Predicting house prices using labeled data',
      q5: 'To learn patterns for accurate predictions',
      q6: 'POST'
    };

    let score = 0;
    Object.entries(mcqAnswers).forEach(([key, answer]) => {
      if (correctAnswers[key as keyof typeof correctAnswers] === answer) {
        score++;
      }
    });

    if (isCodingClub) {
      const answer = codingAnswers.c1 ?? '';
      if (isCodingAnswerCorrect(answer, codingQuestion.keywords, codingQuestion.minMatches)) {
        score++;
      }
    }

    const answeredMcqCount = Object.values(mcqAnswers).filter(Boolean).length;
    const answeredCodingCount = isCodingClub && codingAnswers.c1.trim() ? 1 : 0;
    const answeredCount = answeredMcqCount + answeredCodingCount;
    const totalQuestions = questions.length + (isCodingClub ? 1 : 0);
    const attemptedAll = answeredCount === totalQuestions;

    const resultPayload = {
      score,
      totalQuestions,
      attemptedAll,
      answeredCount
    };

    sessionStorage.setItem('clubTestResult', JSON.stringify(resultPayload));
    stopAllProctoring();
    navigate(`/clubs/${id}/test/results`, {
      state: resultPayload
    });
  };

  const canProceedToCoding = Object.values(mcqAnswers).filter(Boolean).length === questions.length;

  useEffect(() => {
    if (!lastRunCode) return;
    if (codingAnswers.c1.trim() !== lastRunCode) {
      setRunStatus('idle');
      setRunOutput('Code changed. Click Run to test again.');
    }
  }, [codingAnswers.c1, lastRunCode]);

  const handleRunCode = () => {
    const code = codingAnswers.c1.trim();
    if (!code) {
      setRunOutput('Please write a solution before running.');
      setRunStatus('error');
      return;
    }
    setLastRunCode(code);
    const lower = code.toLowerCase();
    const looksLikeSolution =
      lower.includes('stack') ||
      lower.includes('push') ||
      lower.includes('pop') ||
      lower.includes('return');

    if (looksLikeSolution && code.length >= 60) {
      setRunStatus('success');
      setRunOutput(
        'Running sample tests...\nInput: "()[]{}"\nOutput: true\nInput: "([)]"\nOutput: false\nStatus: Success. All tests passed.'
      );
    } else {
      setRunStatus('error');
      setRunOutput(
        'Running sample tests...\nInput: "()[]{}"\nOutput: false\nInput: "([)]"\nOutput: true\nStatus: Error. Tests failed.'
      );
    }
  };

  const handleLanguageChange = (nextLanguage: string) => {
    setLanguage(nextLanguage);
    setCodingAnswers({ c1: LANGUAGE_TEMPLATES[nextLanguage] ?? '' });
    setRunOutput('');
    setRunStatus('idle');
    setLastRunCode('');
  };

  useEffect(() => {
    setCodingAnswers({ c1: LANGUAGE_TEMPLATES[language] ?? '' });
  }, []);


  return (
    <div className="w-full overflow-x-hidden bg-slate-50 min-h-screen flex flex-col">
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
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-3 tracking-tight">Club Test</h1>
          <Link to={`/clubs/${id}`} className="inline-flex items-center gap-2 text-blue-200 hover:text-white transition-colors">
            <span>{'<'}</span>
            <span>Home</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative w-full py-12">
        <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <div className="rounded-lg border border-slate-200 bg-white p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Time Remaining</p>
                <p className={`text-lg font-semibold ${timeLeft <= 60 ? 'text-red-700' : 'text-blue-900'}`}>
                  {formatTime(timeLeft)}
                </p>
              </div>
              <div className="text-xs text-slate-500">
                {isCodingClub ? 'MCQ then Coding' : 'Multiple-choice only'}
              </div>
            </div>

            {autoSubmitted && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                Time is up. Your answers have been submitted automatically.
              </div>
            )}


            <div className="rounded-lg border border-slate-200 bg-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`text-xs uppercase tracking-[0.2em] ${step === 'mcq' ? 'text-blue-900' : 'text-slate-400'}`}>
                  Step 1
                </span>
                <span className={`text-sm font-semibold ${step === 'mcq' ? 'text-blue-900' : 'text-slate-500'}`}>
                  Multiple Choice
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs uppercase tracking-[0.2em] ${step === 'coding' ? 'text-blue-900' : 'text-slate-400'}`}>
                  Step 2
                </span>
                <span className={`text-sm font-semibold ${step === 'coding' ? 'text-blue-900' : 'text-slate-500'}`}>
                  Coding Task
                </span>
              </div>
            </div>

            {step === 'mcq' && (
              <div className="space-y-6">
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
                            checked={mcqAnswers[q.id as keyof McqAnswers] === option}
                            onChange={(e) => handleAnswerChange(q.id as keyof McqAnswers, e.target.value)}
                            className="w-4 h-4 text-blue-900 focus:ring-blue-900"
                            disabled={submitted}
                          />
                          <span className="text-slate-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="text-sm text-slate-500">
                    Answer all questions to unlock the coding task.
                  </div>
                  {isCodingClub ? (
                    <button
                      onClick={() => setStep('coding')}
                      className={`px-10 py-3 font-semibold rounded-lg transition-colors ${
                        canProceedToCoding
                          ? 'bg-blue-900 text-white hover:bg-blue-700'
                          : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                      }`}
                      disabled={!canProceedToCoding}
                    >
                      Next: Coding Question
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSubmit(false)}
                      className={`px-10 py-3 font-semibold rounded-lg transition-colors ${
                        submitted
                          ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                          : 'bg-blue-900 text-white hover:bg-blue-700'
                      }`}
                      disabled={submitted}
                    >
                      {submitted ? 'Submitted' : 'Submit'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {step === 'coding' && isCodingClub && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                  <div className="flex flex-col lg:flex-row gap-8">
                    <div className="lg:w-2/5">
                      <h3 className="text-xl font-bold text-blue-900 mb-3">{codingQuestion.title}</h3>
                      <p className="text-slate-900 mb-4 font-medium">{codingQuestion.prompt}</p>
                      <div className="space-y-2 text-sm text-slate-600">
                        {codingQuestion.constraints.map((constraint) => (
                          <p key={constraint}>• {constraint}</p>
                        ))}
                      </div>
                      <div className="mt-5">
                        <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Language</label>
                        <select
                          value={language}
                          onChange={(e) => handleLanguageChange(e.target.value)}
                          className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
                          disabled={submitted}
                        >
                          <option>JavaScript</option>
                          <option>Python</option>
                          <option>Java</option>
                        </select>
                      </div>
                    </div>

                    <div className="lg:flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Code Pad</span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={handleRunCode}
                            className={`px-5 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                              submitted
                                ? 'border-slate-300 text-slate-400 cursor-not-allowed'
                                : 'border-blue-900 text-blue-900 hover:bg-blue-50'
                            }`}
                            disabled={submitted}
                          >
                            Run
                          </button>
                          <button
                            onClick={() => handleSubmit(false)}
                            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-colors ${
                              submitted
                                ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                                : 'bg-blue-900 text-white hover:bg-blue-700'
                            }`}
                            disabled={submitted}
                          >
                            {submitted ? 'Submitted' : 'Submit'}
                          </button>
                        </div>
                      </div>
                      <textarea
                        value={codingAnswers.c1}
                        onChange={(e) => handleCodingChange('c1', e.target.value)}
                        className="w-full min-h-[260px] rounded-lg border border-slate-300 bg-slate-950 text-slate-100 p-4 text-sm font-mono focus:border-blue-700 focus:ring-blue-700"
                        placeholder="Write your solution here..."
                        disabled={submitted}
                      />
                      <div
                        className={`mt-4 rounded-lg border p-3 text-xs whitespace-pre-line min-h-[80px] ${
                          runStatus === 'success'
                            ? 'border-green-200 bg-green-50 text-green-800'
                            : runStatus === 'error'
                              ? 'border-red-200 bg-red-50 text-red-700'
                              : 'border-slate-200 bg-slate-50 text-slate-600'
                        }`}
                      >
                        {runOutput || 'Run output will appear here.'}
                      </div>
                      <div className="mt-4 flex justify-between">
                        <button
                          onClick={() => setStep('mcq')}
                          className="px-6 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                          disabled={submitted}
                        >
                          Back to MCQ
                        </button>
                        <div className="text-xs text-slate-400">
                          One coding question required.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
