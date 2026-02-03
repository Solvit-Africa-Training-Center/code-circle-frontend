import { useId } from 'react'

import image1 from '@/assets/image.jpg';
import image2 from '@/assets/image1.png'; 

export default function Hero() {
    const id = useId();

    return (
        <section className="
        min-h-screen
        pt-28 md:pt-[7rem] lg:pt-[8rem]
        pb-20 md:pb-24
        overflow-hidden
        ">
            <div className="absolute inset-0 -z-30 bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900" />

            <div
                className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat opacity-20 animate-slow-pan origin-center"
                style={{ backgroundImage: `url(${image1})`, willChange: 'transform, background-position' }}
            />
            <div
                className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat opacity-15 animate-slow-pan-reverse origin-center"
                style={{ backgroundImage: `url(${image2})`, willChange: 'transform, background-position' }}
            />

            <div className="relative mx-auto max-w-6xl px-5 text-left">
                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl leading-tight">
                    <span className="text-white">Create & Join</span>
                    <br />
                    <span className="text-white">
                        Verified Coding Clubs
                    </span>
                </h1>
                <p className="mt-5 text-sm text-sky-300 sm:text-base md:mt-8 max-w-lg">
                    Build Your Coding Community With skill-Verified admins and members.
                </p>

                {/* actions */}
                <div className="flex flex-col items-start gap-4 sm:mt-12 sm:flex-row sm:gap-6">
                    <a
                        href="#"
                        className="inline-flex items-center justify-center rounded-md border border-sky-500 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-sky-700/20"
                    >
                        Explore Clubs
                    </a>
                    <a
                        href="#"
                        className="inline-flex items-center justify-center rounded-md border border-sky-500 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-sky-700/20"
                    >
                        Create Club
                    </a>
                </div>
                {/* stats */}

                <div className="mt-12 flex items-center gap-4 sm:mt-16">
                    {[
                        { value: '0+', label: 'Active Clubs' },
                        { value: '0+', label: 'Verified members' },
                        { value: '0+', label: 'Success rate' }
                    ].map((stat, i) => (
                        <div
                            key={i}
                            className="min-w-[120px] rounded-lg bg-sky-700/90 px-6 py-4 text-center text-white shadow-md"
                        >
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <div className="mt-1 text-xs opacity-90">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

        </section>
    )
}