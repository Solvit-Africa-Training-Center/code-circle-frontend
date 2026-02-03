import img1 from '@/assets/image.jpg';
import img2 from '@/assets/image1.png';
import img3 from '@/assets/image2.jpg';
import img4 from '@/assets/image3.png';
import img5 from '@/assets/image4.jpg';
import img6 from '@/assets/image5.jpg';

export default function ClubsSection() {
  const clubs = [
    {
      id: 1,
      name: 'CodeCraft Club',
      category: 'Software Development',
      image: img1,
      admins: ['Brian Kim'],
      adminCount: 1,
      members: 8,
      weeks: 4
    },
    {
      id: 2,
      name: 'ML Innovators',
      category: 'Machine Learning',
      image: img2,
      admins: ['Alex Chen'],
      adminCount: 1,
      members: 10,
      weeks: 6
    },
    {
      id: 3,
      name: 'Web Wizards',
      category: 'Web Development',
      image: img3,
      admins: ['Clara Singh'],
      adminCount: 1,
      members: 6,
      weeks: 5
    },
    {
      id: 4,
      name: 'AI Pioneers',
      category: 'AI Research',
      image: img4,
      admins: ['David Lee'],
      adminCount: 1,
      members: 7,
      weeks: 3
    },
    {
      id: 5,
      name: 'Data Explorers',
      category: 'Data Science',
      image: img5,
      admins: ['Emily Roberts'],
      adminCount: 1,
      members: 5,
      weeks: 4
    },
    {
      id: 6,
      name: 'CyberGuardians',
      category: 'Cybersecurity',
      image: img6,
      admins: ['Frank Merrith'],
      adminCount: 1,
      members: 9,
      weeks: 5
    }
  ];

  return (
    <section className="relative py-20 md:py-28 overflow-hidden bg-slate-50">
      <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-sky-600 uppercase tracking-wide">Our Clubs</p>
          <h2 className="mt-2 text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
            Join a Club Gain Skills
          </h2>
        </div>

        {/* Clubs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((club) => (
            <div
              key={club.id}
              className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-lg transition-shadow"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden bg-slate-200">
                <img
                  src={club.image}
                  alt={club.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Club Name */}
                <h3 className="text-lg font-semibold text-slate-900">{club.name}</h3>
                <p className="text-sm text-sky-600 font-medium mt-1">{club.category}</p>

                {/* Divider */}
                <hr className="my-4 border-slate-200" />

                {/* Admin Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="h-4 w-4 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4m0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                    <span className="text-slate-700">{club.admins[0]}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="h-4 w-4 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                    <span className="text-slate-700">{club.members} weeks</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-2 mb-4 text-xs text-slate-600">
                  <span>📌 {club.members} members</span>
                </div>

                {/* Join Button */}
                <button className="w-full rounded-lg bg-blue-600 text-white py-2.5 font-semibold hover:bg-blue-700 transition-colors">
                  Join
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
