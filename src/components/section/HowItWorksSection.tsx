import { useState } from 'react';
import laptopImg from '@/assets/home_11.jpeg';
import verifiedImg from '@/assets/home_1111.jpeg';
import communityImg from '@/assets/home_11111.jpeg';

export default function HowItWorksSection() {
  const [activeTab, setActiveTab] = useState('creator');

  const steps = {
    creator: [
      {
        number: '1',
        title: 'Sign up & Take Admin Test',
        description: 'Create your account and pass our admin verification test',
        image: laptopImg
      },
      {
        number: '2',
        title: 'Get Verified',
        description: 'Receive your verified badge upon successful completion',
        image: verifiedImg
      },
      {
        number: '3',
        title: 'Create Your Club',
        description: 'Start your own coding club and invite members',
        image: communityImg
      }
    ],
    member: [
      {
        number: '1',
        title: 'Join a Club',
        description: 'Browse and join clubs that match your interests',
        image: laptopImg
      },
      {
        number: '2',
        title: 'Get Verified',
        description: 'Pass the member verification test',
        image: verifiedImg
      },
      {
        number: '3',
        title: 'Start Learning',
        description: 'Collaborate and grow with your club members',
        image: communityImg
      }
    ]
  };

  const currentSteps = steps[activeTab as keyof typeof steps];
  const slidingSteps = [...currentSteps, ...currentSteps];

  return (
    <section className="relative py-20 md:py-28 overflow-hidden bg-white">
      <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-blue-900">
            How It Works?
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-16">
          <button
            onClick={() => setActiveTab('creator')}
            className={`px-8 py-3 rounded-full font-semibold transition-all ${
              activeTab === 'creator'
                ? 'bg-blue-900 text-white'
                : 'bg-blue-50 text-blue-900 border-2 border-blue-200 hover:border-blue-400'
            }`}
          >
            Club Creator
          </button>
          <button
            onClick={() => setActiveTab('member')}
            className={`px-8 py-3 rounded-full font-semibold transition-all ${
              activeTab === 'member'
                ? 'bg-blue-900 text-white'
                : 'bg-blue-50 text-blue-900 border-2 border-blue-200 hover:border-blue-400'
            }`}
          >
            Club Member
          </button>
        </div>

        {/* Steps */}
        <div className="mb-12 overflow-hidden">
          <div className="flex gap-6 w-max how-it-works-track">
            {slidingSteps.map((step, index) => (
              <div
                key={`${step.number}-${index}`}
                className="relative min-w-[260px] md:min-w-[300px] lg:min-w-[320px]"
              >
                <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-blue-900 to-blue-800 p-8 min-h-[320px] flex flex-col relative">
                  <div className="absolute top-6 left-6 w-12 h-12 rounded-full bg-blue-400 flex items-center justify-center">
                    <span className="text-xl font-bold text-white">{step.number}</span>
                  </div>

                  <div className="flex-1 flex items-center justify-center mb-6 mt-8">
                    <img
                      src={step.image}
                      alt={step.title}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-sm text-blue-100 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center">
          <button className="px-12 py-3 rounded-full bg-blue-900 text-white font-semibold hover:bg-blue-700 transition-colors text-base">
            {activeTab === 'creator' ? 'Create Club' : 'Join Club'}
          </button>
        </div>
      </div>

      <style>
        {`
          @keyframes howItWorksScroll {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
          .how-it-works-track {
            animation: howItWorksScroll 20s linear infinite;
          }
        `}
      </style>
    </section>
  );
}
