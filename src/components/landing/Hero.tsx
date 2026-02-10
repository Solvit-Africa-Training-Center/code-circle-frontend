import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import bg1 from '../../assets/home_11.jpeg'
import bg2 from '../../assets/home_1111.jpeg'
import bg3 from '../../assets/home_11111.jpeg'

export default function Hero() {
  useEffect(() => {
    const sources = [bg1, bg2, bg3]
    sources.forEach((src) => {
      const img = new Image()
      img.src = src
    })
  }, [])

  return (
    <section className="relative w-full min-h-[520px] sm:min-h-[580px] md:min-h-[650px] lg:min-h-[700px] flex items-center justify-center md:justify-start overflow-hidden py-10 sm:py-12">
      {/* Background Images Container */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-cover bg-center opacity-0 animate-fade-in-out" style={{backgroundImage: `url(${bg1})`, animationDelay: '0s'}}></div>
        <div className="absolute inset-0 bg-cover bg-center opacity-0 animate-fade-in-out" style={{backgroundImage: `url(${bg2})`, animationDelay: '4s'}}></div>
        <div className="absolute inset-0 bg-cover bg-center opacity-0 animate-fade-in-out" style={{backgroundImage: `url(${bg3})`, animationDelay: '8s'}}></div>
      </div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 z-[1]"></div>

      {/* Content */}
      <div className="relative z-10 text-left text-white max-w-2xl px-5 sm:px-8 md:px-16 pt-14 sm:pt-16 md:pt-20">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-4 tracking-tight">
          <span className="block">Create & Join</span>
          <span className="block whitespace-nowrap">Verified Coding Clubs</span>
        </h1>
        <p className="text-sm sm:text-base md:text-lg font-normal mb-8 text-blue-300 leading-relaxed">
          Build Your Coding Community With skill-Verified admins and members.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-10 sm:mb-12">
          <Link
            to="/clubs"
            className="px-6 py-2 border-2 border-blue-400 text-blue-400 rounded-md font-semibold text-sm text-center hover:bg-blue-400 hover:text-white transition-all duration-300"
          >
            Explore Clubs
          </Link>
          <Link
            to="/leader/apply"
            className="px-6 py-2 border-2 border-blue-400 text-blue-400 rounded-md font-semibold text-sm text-center hover:bg-blue-400 hover:text-white transition-all duration-300"
          >
            Apply to Lead
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-lg">
          <div className="bg-blue-900 px-6 sm:px-8 py-4 rounded-lg text-center flex flex-col items-center">
            <div className="text-3xl font-bold text-white">0+</div>
            <div className="text-sm text-white font-medium mt-1">Active Clubs</div>
          </div>
          <div className="bg-blue-900 px-6 sm:px-8 py-4 rounded-lg text-center flex flex-col items-center">
            <div className="text-3xl font-bold text-white">0+</div>
            <div className="text-sm text-white font-medium mt-1 whitespace-nowrap">Verified members</div>
          </div>
          <div className="bg-blue-900 px-6 sm:px-8 py-4 rounded-lg text-center flex flex-col items-center">
            <div className="text-3xl font-bold text-white">0+</div>
            <div className="text-sm text-white font-medium mt-1">Success rate</div>
          </div>
        </div>
      </div>
    </section>
  )
}
