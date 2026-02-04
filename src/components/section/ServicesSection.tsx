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
    }
  ];

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
          <div className="flex gap-6 animate-services-slide w-fit">
            {/* Original services */}
            {services.map((service) => (
              <div
                key={service.id}
                className="flex-shrink-0 w-96 rounded-2xl bg-slate-900 p-8 min-h-96 flex flex-col justify-between transition-all hover:shadow-lg"
              >
                {/* Icon */}
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-600 text-white mb-6">
                  {service.icon}
                </div>

                {/* Content */}
                <div className="flex-grow">
                  {/* Title */}
                  <h3 className="text-xl font-semibold text-white">{service.title}</h3>

                  {/* Description */}
                  <p className="mt-4 text-sm text-slate-300">{service.description}</p>
                </div>

                {/* Features list at bottom */}
                <ul className="mt-6 pt-4 border-t border-slate-700 space-y-1">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="text-sm text-slate-300">
                      <span className="text-slate-400">*</span>{feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Duplicate for seamless loop */}
            {services.map((service) => (
              <div
                key={`dup-${service.id}`}
                className="flex-shrink-0 w-96 rounded-2xl bg-slate-900 p-8 min-h-96 flex flex-col justify-between transition-all hover:shadow-lg"
              >
                {/* Icon */}
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-600 text-white mb-6">
                  {service.icon}
                </div>

                {/* Content */}
                <div className="flex-grow">
                  {/* Title */}
                  <h3 className="text-xl font-semibold text-white">{service.title}</h3>

                  {/* Description */}
                  <p className="mt-4 text-sm text-slate-300">{service.description}</p>
                </div>

                {/* Features list at bottom */}
                <ul className="mt-6 pt-4 border-t border-slate-700 space-y-1">
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

      <style>{`
        @keyframes services-slide {
          0%, 22% {
            transform: translateX(0);
          }
          23%, 44% {
            transform: translateX(-816px);
          }
          45%, 66% {
            transform: translateX(-1632px);
          }
          67%, 100% {
            transform: translateX(0);
          }
        }

        .animate-services-slide {
          animation: services-slide 48s linear infinite;
        }

        .animate-services-slide:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
