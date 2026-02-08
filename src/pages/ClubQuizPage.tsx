import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import bg1 from '@/assets/home_11.jpeg';
import bg2 from '@/assets/home_1111.jpeg';
import bg3 from '@/assets/home_11111.jpeg';

export default function ClubQuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [answers, setAnswers] = useState({
    q1: '',
    q2: '',
    q3: '',
    q4: '',
    q5: ''
  });

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
    }
  ];

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers({
      ...answers,
      [questionId]: answer
    });
  };

  const handleSubmit = () => {
    // Define correct answers
    const correctAnswers = {
      q1: 'Making computers learn from data',
      q2: 'Python',
      q3: 'A collection of data used for training models',
      q4: 'Predicting house prices using labeled data',
      q5: 'To learn patterns for accurate predictions'
    };

    // Calculate score
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

    // Persist for refresh-safe results
    sessionStorage.setItem('clubTestResult', JSON.stringify(resultPayload));

    // Navigate to results page with score
    navigate(`/clubs/${id}/test/results`, {
      state: resultPayload
    });
  };

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
            <span>«</span>
            <span>Home</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative w-full py-12">
        <div className="mx-auto max-w-4xl px-5 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {/* Questions */}
            {questions.map((q) => (
              <div key={q.id} className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-blue-900 mb-4">Question {q.number}</h3>
                <p className="text-slate-900 mb-4 font-medium">{q.question}</p>
                
                <div className="space-y-3">
                  {q.options.map((option, idx) => (
                    <label 
                      key={idx}
                      className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded transition-colors"
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={option}
                        checked={answers[q.id as keyof typeof answers] === option}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        className="w-4 h-4 text-blue-900 focus:ring-blue-900"
                      />
                      <span className="text-slate-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <button
                onClick={handleSubmit}
                className="px-12 py-3 bg-blue-900 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
