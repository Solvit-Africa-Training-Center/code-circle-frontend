import Image from '@/assets/image5.jpg';

export default function EmpoweringSection() {
    return (
        <section className="relative py-20 md:py-28 overflow-hidden">
            <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                    
                    <div className="lg:col-span-7 flex flex-col h-full">
                        <h2 className="text-3xl md:text-4xl lg:text-3xl font-semibold tracking-tight text-sky-700 text-left">
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
                            <div className="flex items-start gap-4 rounded-2xl bg-white p-4 shadow-sm">
                                <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-sky-600 flex items-center justify-center text-white">
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-800">Verified Skills</h3>
                                    <p className="mt-1 text-xs text-slate-500">AI-powered assessment ensures quality</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 rounded-2xl bg-white p-4 shadow-sm">
                                <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-sky-600 flex items-center justify-center text-white">
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4m0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-800">Community first</h3>
                                    <p className="mt-1 text-xs text-slate-500">Build lasting connections with peers</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right column - Image filling height */}
                    <div className="lg:col-span-5 flex justify-end items-stretch">
                        <div className="relative w-full h-full min-h-[500px]">
                            <img src={Image} alt="group coding" className="w-full h-full rounded-2xl shadow-lg object-cover" />

                            <div className="absolute left-4 -bottom-6 bg-white rounded-xl px-4 py-3 shadow-lg flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-600 font-semibold"> </div>
                                <div>
                                    <div className="text-2xl font-bold text-slate-800">98%</div>
                                    <div className="text-xs text-slate-500">Success rate</div>
                                    <p className="text-xs text-slate-800 font-medium">Members achieved their coding goals</p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}