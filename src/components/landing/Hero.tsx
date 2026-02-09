import { Link } from 'react-router-dom'
import bg1 from '../../assets/home_11.jpeg'
import bg2 from '../../assets/home_1111.jpeg'
import bg3 from '../../assets/home_11111.jpeg'

export default function Hero() {
  return (
    <section className="relative w-full h-[550px] md:h-[650px] lg:h-[700px] flex items-center justify-start overflow-hidden">
      {/* Background Images Container */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-cover bg-center opacity-0 animate-fade-in-out" style={{backgroundImage: `url(${bg1})`, animationDelay: '0s'}}></div>
        <div className="absolute inset-0 bg-cover bg-center opacity-0 animate-fade-in-out" style={{backgroundImage: `url(${bg2})`, animationDelay: '4s'}}></div>
        <div className="absolute inset-0 bg-cover bg-center opacity-0 animate-fade-in-out" style={{backgroundImage: `url(${bg3})`, animationDelay: '8s'}}></div>
      </div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 z-[1]"></div>

      {/* Content */}
      <div className="relative z-10 text-left text-white max-w-2xl px-8 md:px-16 pt-20">
        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-4 tracking-tight whitespace-nowrap">
          Create & Join <br/>Verified Coding Clubs
        </h1>
        <p className="text-base md:text-lg font-normal mb-8 text-blue-300 leading-relaxed whitespace-nowrap">
          Build Your Coding Community With skill-Verified admins and members.
        </p>

        {/* Buttons */}
        <div className="flex gap-4 mb-12">
          <Link
            to="/clubs"
            className="px-6 py-2 border-2 border-blue-400 text-blue-400 rounded-md font-semibold text-sm hover:bg-blue-400 hover:text-white transition-all duration-300"
          >
            Explore Clubs
          </Link>
          <Link
            to="/leader/apply"
            className="px-6 py-2 border-2 border-blue-400 text-blue-400 rounded-md font-semibold text-sm hover:bg-blue-400 hover:text-white transition-all duration-300"
          >
            Apply to Lead
          </Link>
        </div>

        {/* Stats */}
        <div className="flex gap-4 flex-wrap max-w-lg">
          <div className="bg-blue-900 px-8 py-4 rounded-lg text-center flex-1 min-w-[140px]">
            <div className="text-3xl font-bold text-white">0+</div>
            <div className="text-sm text-white font-medium mt-1">Active Clubs</div>
          </div>
          <div className="bg-blue-900 px-8 py-4 rounded-lg text-center flex-1 min-w-[140px]">
            <div className="text-3xl font-bold text-white">0+</div>
            <div className="text-sm text-white font-medium mt-1">Verified members</div>
          </div>
          <div className="bg-blue-900 px-8 py-4 rounded-lg text-center flex-1 min-w-[140px]">
            <div className="text-3xl font-bold text-white">0+</div>
            <div className="text-sm text-white font-medium mt-1">Success rate</div>
          </div>
        </div>
      </div>
    </section>
  )
}
