import Image from '@/assets/image5.jpg';

export default function EmpoweringSection() {
    return (
        <section className="relative py-20 md:py-28 overflow-hidden">
            <div className="relative w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch px-8 md:px-16">
                    
                    <div className="lg:col-span-7 flex flex-col h-full">
                        <h2 className="text-3xl md:text-4xl lg:text-3xl font-semibold tracking-tight text-blue-900 text-left">
                            Empowering the Next Generation of
                            <br />
                            Coders
                        </h2>
                        <p className="mt-6 text-base md:text-lg text-slate-500 max-w-2xl text-left">
                            CodeCircle is an innovative platform designed to enhance the coding
                            education experience through verified skill assessment and
                            collaborative learning environments.
                        </p>
                        <p className="mt-4 text-base md:text-lg text-slate-500 max-w-2xl text-left">
                            We believe in quality over quantity. Every club admin and member
                            goes through our AI-powered verification process, ensuring a
                            professional and skilled community where real learning happens.
                        </p>

                        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
                            {/* Verified Skills Card */}
                            <div className="flex flex-col items-center gap-2 rounded-2xl bg-white p-6 shadow-sm text-center">
                                <div className="shrink-0 h-12 w-12 mb-2 rounded-lg bg-sky-50 flex items-center justify-center text-sky-700 mx-auto">
                                    {/* Shield Icon */}
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect width="24" height="24" fill="none"/>
                                        <path d="M12 3L4 6V11C4 16.52 7.58 21.36 12 23C16.42 21.36 20 16.52 20 11V6L12 3Z" stroke="#2563eb" strokeWidth="2" strokeLinejoin="round"/>
                                        <path d="M9.5 12.5L11 14L14.5 10.5" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">Verified Skills</h3>
                                <p className="text-sm text-slate-500">AI- powered assessment ensures quality</p>
                            </div>

                            {/* Community First Card */}
                            <div className="flex flex-col items-center gap-2 rounded-2xl bg-white p-6 shadow-sm text-center">
                                <div className="shrink-0 h-12 w-12 mb-2 rounded-lg bg-sky-50 flex items-center justify-center text-sky-700 mx-auto">
                                    {/* Group/People Icon */}
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect width="24" height="24" fill="none"/>
                                        <circle cx="8" cy="10" r="3" stroke="#2563eb" strokeWidth="2"/>
                                        <circle cx="16" cy="10" r="3" stroke="#2563eb" strokeWidth="2"/>
                                        <path d="M2 20C2 16.6863 5.13401 14 8.5 14C11.866 14 15 16.6863 15 20" stroke="#2563eb" strokeWidth="2"/>
                                        <path d="M22 20C22 17.2386 19.3137 15 16 15" stroke="#2563eb" strokeWidth="2"/>
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">Community first</h3>
                                <p className="text-sm text-slate-500">Build lasting connections with peers</p>
                            </div>
                        </div>
                    </div>

                    {/* Right column - Image filling height */}
                    <div className="lg:col-span-5 flex justify-end items-stretch">
                        <div className="relative w-full h-full min-h-125">
                            <img src={Image} alt="group coding" className="w-full h-full rounded-2xl shadow-lg object-cover" />

                            <div className="absolute left-4 -bottom-6 bg-white rounded-xl px-6 py-4 shadow-lg flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-sky-50 flex items-center justify-center">
                                    {/* Checkmark Circle Icon */}
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="12" cy="12" r="10" stroke="#2563eb" strokeWidth="2"/>
                                        <path d="M8 12.5L11 15.5L16 10.5" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                                <div>
                                    <div className="text-3xl font-extrabold text-slate-900 leading-none">98%</div>
                                    <div className="text-base text-slate-600 font-medium">Success rate</div>
                                    <p className="text-xs text-slate-500 mt-1">Members achieved their coding goals</p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
