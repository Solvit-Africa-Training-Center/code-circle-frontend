import { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  stopCameraStream as stopPersistedCamera,
  stopScreenStream as stopPersistedScreen
} from '@/utils/testProctoring';
import { useGetClubByIdQuery } from '@/features/ClubsApi';
import MemberPageLayout from '@/components/student/MemberPageLayout';

export default function ClubTestPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const cameraRef = useRef<HTMLVideoElement | null>(null);
  const screenRef = useRef<HTMLVideoElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(() => getCameraStream());
  const [screenStream, setScreenStream] = useState<MediaStream | null>(() => getScreenStream());
  const [mediaError, setMediaError] = useState('');

  const { data: club } = useGetClubByIdQuery(id ?? '', { skip: !id });

  const codingCategories = new Set([
    'Web Development',
    'Software Development',
    'Mobile App Development',
    'Machine Learning',
    'Data Engineering',
    'Artificial Intelligence'
  ]);
  const categoryName = club?.category?.name ?? '';
  const isCodingClub = codingCategories.has(categoryName);

  const mcqCount = 6;
  const codingCount = isCodingClub ? 2 : 0;
  const totalPoints = mcqCount + codingCount;
  const durationMinutes = isCodingClub ? 20 : 10;

  const test = {
    id: id || '1',
    name: `${club?.name ?? 'Club'} - Entry Test`,
    duration: `${durationMinutes} Minutes`,
    points: `${totalPoints} Points`,
    guidelines: [
      'This test evaluates your basic readiness for the selected club.',
      'You must score 70% or higher to pass.',
      isCodingClub
        ? 'The test includes multiple-choice questions and coding tasks.'
        : 'The test contains multiple-choice questions only.',
      'A timer will run for the entire test duration.',
      'You have one attempt per test session.',
      'If you fail, recommended learning resources will be provided.',
      'You may retake the test after 7 days.',
      'Cheating or external assistance is not allowed.',
      'Turn on your camera',
      'Your screen should be shared'
    ]
  };

  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  useEffect(() => {
    if (screenRef.current) {
      screenRef.current.srcObject = screenStream;
    }
  }, [screenStream]);

  const handleEnableCamera = async () => {
    setMediaError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setMediaError('Camera access is not supported in this browser.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      persistCameraStream(stream);
      setCameraStream(stream);
    } catch (error) {
      setMediaError('Camera access was blocked. Please allow camera permission and try again.');
    }
  };

  const handleStopCamera = () => {
    stopPersistedCamera();
    setCameraStream(null);
  };

  const handleEnableScreen = async () => {
    setMediaError('');
    if (!navigator.mediaDevices?.getDisplayMedia) {
      setMediaError('Screen sharing is not supported in this browser.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      persistScreenStream(stream);
      setScreenStream(stream);
    } catch (error) {
      setMediaError('Screen sharing was blocked. Please allow screen permission and try again.');
    }
  };

  const handleStopScreen = () => {
    stopPersistedScreen();
    setScreenStream(null);
  };

  return (
    <MemberPageLayout>
      <div className="w-full overflow-x-hidden bg-white min-h-screen flex flex-col">
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
            <span>«</span>
            <span>Home</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative w-full py-12 bg-slate-100">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          {/* Club Details Card */}
          <div className="bg-white rounded-lg border-2 border-blue-900 p-8 mb-8">
            <h2 className="text-xl font-bold text-blue-900 mb-6">Club Details</h2>
            
            {/* Test Title */}
            <div className="mb-6 pb-4 border-b border-slate-300">
              <h3 className="text-lg font-semibold text-slate-900">{test.name}</h3>
            </div>

            {/* Duration and Points */}
            <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-slate-300">
              <div>
                <p className="text-sm text-slate-600 mb-1">Duration:</p>
                <p className="text-base font-semibold text-slate-900">{test.duration}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Points:</p>
                <p className="text-base font-semibold text-slate-900">{test.points}</p>
              </div>
            </div>

            {/* Test Format */}
            <div className="mb-8">
              <p className="text-sm text-slate-600 mb-4">Test format:</p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Multiple Choice</p>
                  <p className="text-base font-semibold text-slate-900 mt-2">{mcqCount} Questions</p>
                  <p className="text-xs text-slate-500 mt-1">Core concepts and fundamentals.</p>
                </div>
                {isCodingClub && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Coding Tasks</p>
                    <p className="text-base font-semibold text-slate-900 mt-2">{codingCount} Tasks</p>
                    <p className="text-xs text-slate-500 mt-1">Short coding prompts for entry screening.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Guidelines */}
            <div className="mb-8">
              <p className="text-sm text-slate-600 mb-4">Please read carefully before starting the test:</p>
              <ul className="space-y-2">
                {test.guidelines.map((guideline, idx) => (
                  <li key={idx} className="flex gap-3 text-slate-700 text-sm">
                    <span className="text-blue-900 font-bold">•</span>
                    <span>{guideline}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Verification Setup */}
            <div className="mb-8">
              <p className="text-sm text-slate-600 mb-4">Verification setup:</p>
              {mediaError && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {mediaError}
                </div>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Web Camera</p>
                  <div className="mt-3 flex gap-3">
                    <button
                      onClick={handleEnableCamera}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        cameraStream
                          ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                          : 'bg-blue-900 text-white hover:bg-blue-700'
                      }`}
                      disabled={Boolean(cameraStream)}
                    >
                      Enable
                    </button>
                    <button
                      onClick={handleStopCamera}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        cameraStream
                          ? 'border border-slate-300 text-slate-600 hover:bg-slate-100'
                          : 'border border-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                      disabled={!cameraStream}
                    >
                      Stop
                    </button>
                  </div>
                  <div className="mt-4 rounded-lg border border-slate-200 bg-white p-2">
                    <video ref={cameraRef} autoPlay muted playsInline className="w-full h-56 md:h-64 rounded-md bg-slate-900 object-cover" />
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Screen Share</p>
                  <div className="mt-3 flex gap-3">
                    <button
                      onClick={handleEnableScreen}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        screenStream
                          ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                          : 'bg-blue-900 text-white hover:bg-blue-700'
                      }`}
                      disabled={Boolean(screenStream)}
                    >
                      Enable
                    </button>
                    <button
                      onClick={handleStopScreen}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        screenStream
                          ? 'border border-slate-300 text-slate-600 hover:bg-slate-100'
                          : 'border border-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                      disabled={!screenStream}
                    >
                      Stop
                    </button>
                  </div>
                  <div className="mt-4 rounded-lg border border-slate-200 bg-white p-2">
                    <video ref={screenRef} autoPlay muted playsInline className="w-full h-56 md:h-64 rounded-md bg-slate-900 object-cover" />
                  </div>
                </div>
              </div>
            </div>

            {/* Start Test Button */}
            <div className="flex justify-center">
              <button
                onClick={() => navigate(`/clubs/${id}/test/quiz`)}
                className="px-12 py-3 bg-blue-900 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Test
              </button>
            </div>
          </div>
        </div>
      </div>

        <Footer />
      </div>
    </MemberPageLayout>
  );
}
