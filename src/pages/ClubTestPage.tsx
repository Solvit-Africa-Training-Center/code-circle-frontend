import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import bg1 from '@/assets/home_11.jpeg';
import bg2 from '@/assets/home_1111.jpeg';
import bg3 from '@/assets/home_11111.jpeg';

export default function ClubTestPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Sample test data
  const test = {
    id: id || '1',
    name: 'ML Innovators - Machine Learning Test',
    duration: '10 Minutes',
    points: '10 Points',
    guidelines: [
      'This test evaluates your basic readiness for the selected club.',
      'You must score 70% or higher to pass.',
      'The test contains multiple-choice questions only.',
      'You have one attempt per test session.',
      'If you fail, recommended learning resources will be provided.',
      'You may retake the test after 7 days.',
      'Cheating or external assistance is not allowed.',
      'Turn on your camera',
      'Your screen should be shared'
    ]
  };

  return (
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
  );
}
