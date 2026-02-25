import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import bg1 from '@/assets/home_11.jpeg';
import bg2 from '@/assets/home_1111.jpeg';
import bg3 from '@/assets/home_11111.jpeg';
import {
  getCameraStream,
  getScreenStream,
  setCameraStream as persistCameraStream,
  setScreenStream as persistScreenStream,
  stopAllProctoring,
} from '@/utils/testProctoring';
import {
  useGetCreatorTestByCategoryQuery,
  useSubmitLeaderTestMutation,
  useUploadLeaderProctoringVideoMutation,
} from '@/features/LeaderApplicationApi';
import type { LeaderApplySession } from '@/types/leaderApplication';

export default function LeaderApplyTestPage() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [recordingError, setRecordingError] = useState('');
  const [mediaError, setMediaError] = useState('');
  const [submitLeaderTest, { isLoading: isSubmitting }] = useSubmitLeaderTestMutation();
  const [uploadLeaderProctoringVideo] = useUploadLeaderProctoringVideoMutation();
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  const recordingMimeTypeRef = useRef<string>('video/webm');

  const session = useMemo<LeaderApplySession | null>(() => {
    const raw = sessionStorage.getItem('leaderApplySession');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as LeaderApplySession;
    } catch {
      return null;
    }
  }, []);

  const {
    data: test,
    isLoading: isLoadingTest,
    isError: isTestError,
  } = useGetCreatorTestByCategoryQuery(session?.categoryId ?? '', {
    skip: !session?.categoryId,
  });

  const questions = useMemo(() => test?.questions ?? [], [test]);
  const totalTimeSeconds = 12 * 60;
  const [timeLeft, setTimeLeft] = useState(totalTimeSeconds);
  const isStreamActive = (stream: MediaStream | null) =>
    Boolean(
      stream &&
        stream.active &&
        stream.getVideoTracks().some((track) => track.readyState === 'live'),
    );

  const hasCamera = isStreamActive(getCameraStream());
  const hasScreen = isStreamActive(getScreenStream());
  const canTakeTest = hasCamera && hasScreen;

  const handleEnableCamera = async () => {
    setMediaError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setMediaError('Camera access is not supported in this browser.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      persistCameraStream(stream);
    } catch {
      setMediaError(
        'Camera access was blocked. Please allow camera permission and try again.',
      );
    }
  };

  const handleEnableScreen = async () => {
    setMediaError('');
    if (!navigator.mediaDevices?.getDisplayMedia) {
      setMediaError('Screen sharing is not supported in this browser.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          frameRate: 15,
        },
        audio: false,
      });
      persistScreenStream(stream);
    } catch {
      setMediaError(
        'Screen sharing was blocked. Please allow screen permission and try again.',
      );
    }
  };

  useEffect(() => {
    if (!hasScreen || submitted) return;
    if (recorderRef.current) return;

    const screenStream = getScreenStream();
    if (!screenStream) return;

    try {
      const preferredTypes = [
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm',
      ];
      const mimeType =
        preferredTypes.find((type) => MediaRecorder.isTypeSupported(type)) ??
        'video/webm';

      recordingMimeTypeRef.current = mimeType;
      recordingChunksRef.current = [];

      const recorder = new MediaRecorder(screenStream, {
        mimeType,
        // Keep file size lower so proctoring uploads reliably complete.
        videoBitsPerSecond: 600_000,
      });
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordingChunksRef.current.push(event.data);
        }
      };
      recorderRef.current = recorder;
      recorder.start(1000);
      setRecordingError('');
    } catch {
      setRecordingError('Could not start test recording. You can still submit your answers.');
    }
  }, [hasScreen, submitted]);

  useEffect(() => {
    return () => {
      const recorder = recorderRef.current;
      if (recorder && recorder.state !== 'inactive') {
        recorder.stop();
      }
      recorderRef.current = null;
      recordingChunksRef.current = [];
    };
  }, []);

  const stopRecordingAndBuildFile = async (): Promise<File | null> => {
    const recorder = recorderRef.current;
    if (!recorder) return null;

    if (recorder.state === 'inactive') {
      const chunks = recordingChunksRef.current;
      recordingChunksRef.current = [];
      recorderRef.current = null;
      if (!chunks.length) return null;

      const mimeType = recordingMimeTypeRef.current || 'video/webm';
      const blob = new Blob(chunks, { type: mimeType });
      const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
      return new File([blob], `leader-test-recording.${extension}`, {
        type: mimeType,
      });
    }

    return await new Promise<File | null>((resolve) => {
      recorder.onstop = () => {
        const chunks = recordingChunksRef.current;
        recordingChunksRef.current = [];
        recorderRef.current = null;

        if (!chunks.length) {
          resolve(null);
          return;
        }

        const mimeType = recordingMimeTypeRef.current || 'video/webm';
        const blob = new Blob(chunks, { type: mimeType });
        const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
        const file = new File([blob], `leader-test-recording.${extension}`, {
          type: mimeType,
        });
        resolve(file);
      };

      try {
        recorder.stop();
      } catch {
        resolve(null);
      }
    });
  };

  useEffect(() => {
    const protocolDone = sessionStorage.getItem('leaderApplyProtocolDone') === 'true';
    if (!session || !protocolDone) {
      navigate('/leader/apply/protocol', { replace: true });
      return;
    }
    const existingResult = sessionStorage.getItem('leaderApplyResult');
    if (existingResult) {
      navigate('/leader/apply/result', { replace: true });
    }
  }, [navigate, session]);

  useEffect(() => {
    if (submitted || !test) return;
    if (timeLeft <= 0) {
      void handleSubmit(true);
      return;
    }
    const timerId = window.setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => window.clearInterval(timerId);
  }, [submitted, timeLeft, test]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainder = Math.max(0, seconds % 60);
    return `${minutes}:${remainder.toString().padStart(2, '0')}`;
  };

  const getErrorMessage = (err: unknown) => {
    const response = err as { data?: { message?: string | string[] } };
    const message = response?.data?.message;
    if (Array.isArray(message)) return message[0] ?? 'Unable to submit test.';
    if (typeof message === 'string' && message.trim()) return message;
    return 'Unable to submit test. Please try again.';
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmit = async (fromTimer = false) => {
    if (submitted || !session || !test) return;
    if (!canTakeTest) {
      setSubmitError(
        'Camera and screen sharing must remain active until you submit. Please return to protocol and re-enable both.',
      );
      return;
    }
    setSubmitted(true);
    setSubmitError('');
    if (fromTimer) {
      setAutoSubmitted(true);
    }

    try {
      const recordedFile = await stopRecordingAndBuildFile();
      stopAllProctoring();

      const attempt = await submitLeaderTest({
        userId: session.userId,
        testId: test.id,
        answers,
        purpose: 'CREATE_CLUB',
        categoryId: session.categoryId,
      }).unwrap();

      if (recordedFile) {
        try {
          const attemptId = attempt.id || attempt.attemptId;
          if (!attemptId) {
            throw new Error('Missing attempt ID for proctoring upload');
          }
          await uploadLeaderProctoringVideo({
            attemptId,
            video: recordedFile,
          }).unwrap();
        } catch {
          setRecordingError('Test submitted, but video upload failed.');
        }
      }

      const answeredCount = Object.values(answers).filter(Boolean).length;
      const totalQuestions = questions.length;
      const resultPayload = {
        score: attempt.score,
        passed: attempt.passed,
        totalQuestions,
        answeredCount,
        attemptedAll: answeredCount === totalQuestions,
        categoryName: session.categoryName || 'Leader',
      };

      sessionStorage.setItem('leaderApplyResult', JSON.stringify(resultPayload));
      navigate('/leader/apply/result', { state: resultPayload });
    } catch (err) {
      setSubmitted(false);
      setSubmitError(getErrorMessage(err));
    }
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
              <div className="text-xs text-slate-500">Answer all questions</div>
            </div>

            {autoSubmitted && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                Time is up. Your answers have been submitted automatically.
              </div>
            )}

            {submitError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {submitError}
              </div>
            )}

            {recordingError && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                {recordingError}
              </div>
            )}

            {mediaError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {mediaError}
              </div>
            )}

            {!canTakeTest && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 space-y-3">
                <p>
                  Camera or screen sharing is no longer active. Re-enable both to continue and submit.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => void handleEnableCamera()}
                    className="rounded-md bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    Re-enable Camera
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleEnableScreen()}
                    className="rounded-md bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    Re-enable Screen Share
                  </button>
                </div>
              </div>
            )}

            {isLoadingTest && (
              <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">
                Loading test...
              </div>
            )}

            {isTestError && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
                No leader test is available yet. Please contact admin.
              </div>
            )}

            {!isLoadingTest && !isTestError && !submitted && questions.map((q, idx) => (
              <div key={q.id} className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-blue-900 mb-4">Question {idx + 1}</h3>
                <p className="text-slate-900 mb-4 font-medium">{q.question}</p>

                <div className="space-y-3">
                  {Array.isArray(q.options) && q.options.length > 0 ? (
                    q.options.map((option) => (
                      <label
                        key={option}
                        className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded transition-colors"
                      >
                        <input
                          type="radio"
                          name={q.id}
                          value={option}
                          checked={answers[q.id] === option}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                          className="w-4 h-4 text-blue-900 focus:ring-blue-900"
                          disabled={submitted}
                        />
                        <span className="text-slate-700">{option}</span>
                      </label>
                    ))
                  ) : (
                    <textarea
                      value={answers[q.id] ?? ''}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      rows={4}
                      placeholder="Type your answer..."
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900"
                      disabled={submitted}
                    />
                  )}
                </div>
              </div>
            ))}

            {submitted && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-800">
                Your test has been submitted. Redirecting to results...
              </div>
            )}

            <div className="flex justify-center pt-6">
              <button
                onClick={() => void handleSubmit(false)}
                className={`px-12 py-3 font-semibold rounded-lg transition-colors ${
                  submitted || isLoadingTest || isTestError || isSubmitting || !canTakeTest
                    ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                    : 'bg-blue-900 text-white hover:bg-blue-700'
                }`}
                disabled={submitted || isLoadingTest || isTestError || isSubmitting || !canTakeTest}
              >
                {isSubmitting ? 'Submitting...' : submitted ? 'Submitted' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
