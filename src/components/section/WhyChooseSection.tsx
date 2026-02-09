import Image from '../../assets/image2.jpg';

export default function WhyChooseSection() {
  const reasons = [
    {
      number: '01',
      description:
        'By allowing only qualified creators to form clubs and prequalified members to join, CodeCircle builds focused, goal-driven communities that encourage meaningful collaboration, peer learning, and real project experiences.'
    },
    {
      number: '02',
      description:
        "If you're not ready yet, CodeCircle doesn't block you—it guides you. Personalized learning recommendations and retake opportunities ensure continuous improvement and fair access to growth."
    },
    {
      number: '03',
      description:
        'CodeCircle brings skill verification, learning resources, coding clubs, and hackathons into a single platform—eliminating fragmentation and giving users a clear, structured path from learning to collaboration and real-world experience.'
    }
  ];

  return (
    <section className="relative w-full py-20 md:py-28 overflow-hidden bg-white">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left - Image */}
          <div className="relative">
            <div className="overflow-hidden rounded-[10px] lg:rounded-[12px] rounded-tr-[96px] lg:rounded-tr-[140px] shadow-xl w-full max-w-[440px] md:max-w-[480px]">
              <img
                src={Image}
                alt="Why Choose CodeCircle"
                className="w-full h-[320px] md:h-[420px] lg:h-[480px] object-cover"
              />
            </div>
          </div>

          {/* Right - Content */}
          <div className="flex flex-col justify-center items-start">
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-blue-900">
                Why Choose CodeCircle
              </h2>

              <div className="mt-10 space-y-10 text-left pl-0">
                {reasons.map((reason) => (
                  <div key={reason.number} className="flex gap-8">
                    <div className="flex-shrink-0">
                      <span className="text-3xl md:text-4xl font-semibold text-blue-900">
                        {reason.number}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                        {reason.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
