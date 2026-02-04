import Image from '../../assets/image2.jpg';

export default function WhyChooseSection() {
  const reasons = [
    {
      number: '01',
      description: 'By allowing only qualified creators to form clubs and prequalified members to join, CodeCircle builds focused, goal-driven communities that encourage meaningful collaboration, peer learning, and real project experiences.'
    },
    {
      number: '02',
      description: 'If you\'re not ready yet, CodeCircle doesn\'t block you—it guides you. Personalized learning recommendations and retake opportunities ensure continuous improvement and fair access to growth.'
    },
    {
      number: '03',
      description: 'CodeCircle brings skill verification, learning resources, coding clubs, and hackathons into a single platform—eliminating fragmentation and giving users a clear, structured path from learning to collaboration and real-world experience.'
    }
  ];

  return (
    <section className="relative w-full py-20 md:py-28 overflow-hidden bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-[500px] md:min-h-[600px] px-8 md:px-16">
        {/* Left - Image */}
        <div className="flex justify-start items-stretch overflow-hidden">
          <img
            src={Image}
            alt="Why Choose CodeCircle"
            className="w-full h-full rounded-tr-[80px] shadow-lg object-cover"
          />
        </div>

        {/* Right - Content */}
        <div className="flex flex-col justify-center py-12 md:py-0 pl-0 md:pl-12">
          <div className="max-w-lg">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-blue-900">
              Why Choose CodeCircle
            </h2>

            <div className="mt-12 space-y-8 text-left">
              {reasons.map((reason) => (
                <div key={reason.number} className="flex gap-6">
                  <div className="flex-shrink-0">
                    <span className="text-4xl md:text-5xl font-bold text-blue-900">
                      {reason.number}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-base md:text-lg text-slate-600 leading-relaxed">
                      {reason.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
