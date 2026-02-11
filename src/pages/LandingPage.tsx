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
    return(
        <div className="w-full overflow-x-hidden bg-white">
            <Header />
            <Hero />
            <EmpoweringSection />
            <ServicesSection/>
            <WhyChooseSection/>
            <ClubsSection/>
            <HowItWorksSection/>
            <Footer/>
        </div>
    )
}
