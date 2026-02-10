import { useEffect, useMemo, useState } from 'react';

export default function ServicesSection() {
  const services = [
    {
      id: 1,
      title: 'Collaborative Coding Clubs',
      description: 'Create or join verified coding clubs with like-minded developers. Share knowledge, work on projects, and grow together in a structured environment.',
      features: ['Club management', 'Member tracking', 'Progress monitoring'],
      icon: (
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3m0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
        </svg>
      )
    },
    {
      id: 2,
      title: 'Comprehensive Course Library',
      description: 'Access a wide range of coding courses from beginner to advanced levels. Structured learning paths designed by industry experts.',
      features: ['Video tutorials', 'Hands-on projects', 'Certification programs'],
      icon: (
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6.18L23 9 12 3z" />
        </svg>
      )
    },
    {
      id: 3,
      title: 'Hackathons & Competitions',
      description: 'Participate in regular coding challenges and hackathons. Test your skills, win prizes, and showcase your talent to potential employers.',
      features: ['Weekly challenges', 'Prize pool', 'Leaderboards'],
      icon: (
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
        </svg>
      )
    },
    {
      id: 4,
      title: 'Professional Dashboards',
      description: 'Intuitive dashboards for both admins and members. Track progress, manage clubs, monitor learning paths, and analyze performance metrics.',
      features: ['Analytics & insights', 'Real-time monitoring', 'Custom reports'],
      icon: (
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 13h8v8H3zm10-8h8v16h-8zm-10-2h8v6H3z" />
        </svg>
      )
    },
    {
      id: 5,
      title: 'Peer Review System',
      description: 'Get constructive feedback from verified community members. Improve your code quality, learn best practices, and grow your skills collaboratively.',
      features: ['Code reviews', 'Feedback loop', 'Best practices'],
      icon: (
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      )
    },
    {
      id: 6,
      title: 'Mentorship & Guidance',
      description: 'Connect with experienced mentors to get personalized guidance, career advice, and code reviews tailored to your goals.',
      features: ['1:1 mentoring', 'Career guidance', 'Portfolio reviews'],
      icon: (
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 3a9 9 0 1 0 9 9 9.01 9.01 0 0 0-9-9m-1 5h2v4h-2zm0 6h2v2h-2z" />
        </svg>
      )
    }
  ];

  const [pairIndex, setPairIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setIsAnimating(true);
    }, 30000);
    return () => clearInterval(id);
  }, []);

  const getService = (i: number) => services[((i % services.length) + services.length) % services.length];
  const currentPair = useMemo(() => {
    if (pairIndex === services.length - 1) {
      return [services[pairIndex]];
    }
    return [services[pairIndex], services[pairIndex + 1]];
  }, [pairIndex, services]);
  const nextPair = useMemo(
    () => [getService(pairIndex + 2), getService(pairIndex + 3)],
    [pairIndex]
  );

  const handleTransitionEnd = () => {
    if (!isAnimating) return;
    setIsAnimating(false);
    setPairIndex((prev) => (prev + 2) % services.length);
  };

  return (
    <section className="relative py-20 md:py-28 overflow-hidden bg-white">
      <div className="relative w-full px-8 md:px-16">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-blue-900 uppercase tracking-wide">Our Services</p>
          <h2 className="mt-2 text-4xl md:text-5xl font-bold tracking-tight text-blue-900">
            Wide Range of Services
          </h2>
        </div>

        {/* Sliding Cards Container - Shows exactly 2 cards at a time */}
        <div className="relative overflow-hidden">
          <div
            className={`flex w-[200%] ${
              isAnimating
                ? 'transition-transform duration-700 ease-in-out -translate-x-1/2'
                : 'transition-none translate-x-0'
            }`}
            onTransitionEnd={handleTransitionEnd}
          >
            <div className="grid w-1/2 grid-cols-1 gap-6 sm:grid-cols-2">
              {currentPair.map((service) => (
                <div
                  key={service.id}
                  className="rounded-2xl bg-blue-900 p-8 min-h-96 h-full flex flex-col justify-between transition-all hover:shadow-lg w-full"
                >
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-600 text-white mb-6">
                    {service.icon}
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold text-white">{service.title}</h3>
                    <p className="mt-4 text-sm text-slate-300">{service.description}</p>
                  </div>
                  <ul className="mt-6 pt-4 border-t border-blue-800 space-y-1">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="text-sm text-slate-300">
                        <span className="text-slate-400">*</span>{feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="grid w-1/2 grid-cols-1 gap-6 sm:grid-cols-2">
              {nextPair.map((service) => (
                <div
                  key={`next-${service.id}`}
                  className="rounded-2xl bg-blue-900 p-8 min-h-96 h-full flex flex-col justify-between transition-all hover:shadow-lg w-full"
                >
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-600 text-white mb-6">
                    {service.icon}
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold text-white">{service.title}</h3>
                    <p className="mt-4 text-sm text-slate-300">{service.description}</p>
                  </div>
                  <ul className="mt-6 pt-4 border-t border-blue-800 space-y-1">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="text-sm text-slate-300">
                        <span className="text-slate-400">*</span>{feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
