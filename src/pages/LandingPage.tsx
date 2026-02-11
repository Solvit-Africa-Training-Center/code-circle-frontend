import { useEffect, useMemo, useRef, useState } from 'react';
import Header from '../components/layout/Header';
import Hero from '../components/landing/Hero';
import EmpoweringSection from '../components/section/EmpoweringSection';
import ServicesSection from '../components/section/ServicesSection';
import WhyChooseSection from '../components/section/WhyChooseSection';
import ClubsSection from '../components/section/ClubsSection';
import HowItWorksSection from '../components/section/HowItWorksSection';
import Footer from '../components/layout/Footer';

type SectionId =
  | 'home'
  | 'about'
  | 'services'
  | 'why-choose'
  | 'clubs'
  | 'how-it-works'
  | 'contact';

const sectionMeta: Array<{ id: SectionId; label: string }> = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'services', label: 'Services' },
  { id: 'why-choose', label: 'Why Choose Us' },
  { id: 'clubs', label: 'Our Clubs' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'contact', label: 'Contact' }
];

export default function LandingPage() {
  const [activeSection, setActiveSection] = useState<SectionId>('home');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [visibleSections, setVisibleSections] = useState<Record<SectionId, boolean>>({
    home: true,
    about: false,
    services: false,
    'why-choose': false,
    clubs: false,
    'how-it-works': false,
    contact: true
  });

  const sectionRefs = useRef<Record<SectionId, HTMLElement | null>>({
    home: null,
    about: null,
    services: null,
    'why-choose': null,
    clubs: null,
    'how-it-works': null,
    contact: null
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        let bestMatch: { id: SectionId; ratio: number } | null = null;

        entries.forEach((entry) => {
          const id = entry.target.id as SectionId;
          if (!entry.isIntersecting) return;

          if (!bestMatch || entry.intersectionRatio > bestMatch.ratio) {
            bestMatch = { id, ratio: entry.intersectionRatio };
          }
        });

        if (bestMatch) {
          setActiveSection(bestMatch.id);
        }
      },
      {
        threshold: [0.2, 0.4, 0.6],
        rootMargin: '-18% 0px -45% 0px'
      }
    );

    sectionMeta.forEach(({ id }) => {
      const el = sectionRefs.current[id];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updateProgress = () => {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollableHeight <= 0) {
        setScrollProgress(0);
        return;
      }
      const value = Math.min(100, Math.max(0, (window.scrollY / scrollableHeight) * 100));
      setScrollProgress(value);
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, []);

  const activeLabel = useMemo(
    () => sectionMeta.find((section) => section.id === activeSection)?.label ?? 'Home',
    [activeSection]
  );

  const sectionClass = (id: SectionId) =>
    `transition-all duration-700 ease-out ${
      visibleSections[id] ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
    }`;

  return (
    <div className="relative w-full overflow-x-hidden bg-white">
      <div
        className="fixed left-0 top-0 z-[70] h-1 bg-blue-600 transition-[width] duration-150"
        style={{ width: `${scrollProgress}%` }}
      />

      <div className="pointer-events-none fixed bottom-4 right-4 z-[60] hidden rounded-full border border-blue-200 bg-white/90 px-4 py-2 text-xs font-semibold text-blue-900 shadow-lg backdrop-blur sm:flex sm:items-center sm:gap-3">
        <span>Now Viewing: {activeLabel}</span>
        <span className="text-blue-500">{Math.round(scrollProgress)}%</span>
      </div>

      <section
        id="home"
        ref={(el) => {
          sectionRefs.current.home = el;
        }}
        className="transition-all duration-700 ease-out"
      >
        <Header />
        <Hero />
      </section>

      <section
        id="about"
        ref={(el) => {
          sectionRefs.current.about = el;
        }}
        className="transition-all duration-700 ease-out"
      >
        <EmpoweringSection />
      </section>

      <section
        id="services"
        ref={(el) => {
          sectionRefs.current.services = el;
        }}
        className="transition-all duration-700 ease-out"
      >
        <ServicesSection />
      </section>

      <section
        id="why-choose"
        ref={(el) => {
          sectionRefs.current['why-choose'] = el;
        }}
        className="transition-all duration-700 ease-out"
      >
        <WhyChooseSection />
      </section>

      <section
        id="clubs"
        ref={(el) => {
          sectionRefs.current.clubs = el;
        }}
        className="transition-all duration-700 ease-out"
      >
        <ClubsSection />
      </section>

      <section
        id="how-it-works"
        ref={(el) => {
          sectionRefs.current['how-it-works'] = el;
        }}
        className="transition-all duration-700 ease-out"
      >
        <HowItWorksSection />
      </section>

      <section
        id="contact"
        ref={(el) => {
          sectionRefs.current.contact = el;
        }}
        className="transition-all duration-700 ease-out"
      >
        <Footer />
      </section>
    </div>
  );
}
