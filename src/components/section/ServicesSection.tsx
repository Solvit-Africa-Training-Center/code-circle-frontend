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
          <path d="M3 13h2v8H3zm4-8h2v16H7zm4-2h2v18h-2zm4-2h2v20h-2zm4 4h2v16h-2z" />
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
    }
  ];

  return (
    <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-b from-white to-slate-50">
      <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-sky-600 uppercase tracking-wide">Our Services</p>
          <h2 className="mt-2 text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
            Wide Range of Services
          </h2>
        </div>

        {/* Sliding Cards Container */}
        <div className="relative overflow-hidden">
          <div className="flex gap-6 animate-slide">
            {services.map((service) => (
              <div
                key={service.id}
                className="flex-shrink-0 w-full sm:w-96 rounded-2xl border border-slate-800 bg-slate-900 p-8 transition-all hover:shadow-lg hover:border-blue-500/50"
              >
                {/* Icon */}
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-600 text-white mb-6">
                  {service.icon}
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-white">{service.title}</h3>

                {/* Description */}
                <p className="mt-3 text-sm text-slate-300">{service.description}</p>

                {/* Features */}
                <ul className="mt-6 space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-400">
                      <span className="text-blue-400 font-bold mt-0.5">*</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {/* Duplicate for infinite loop */}
            {services.map((service) => (
              <div
                key={`duplicate-${service.id}`}
                className="flex-shrink-0 w-full sm:w-96 rounded-2xl border border-slate-800 bg-slate-900 p-8 transition-all hover:shadow-lg hover:border-blue-500/50"
              >
                {/* Icon */}
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-600 text-white mb-6">
                  {service.icon}
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-white">{service.title}</h3>

                {/* Description */}
                <p className="mt-3 text-sm text-slate-300">{service.description}</p>

                {/* Features */}
                <ul className="mt-6 space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-400">
                      <span className="text-blue-400 font-bold mt-0.5">*</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-slide {
          animation: slide 30s linear infinite;
        }

        .animate-slide:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
