import Header from '../components/layout/Header'
import Hero from '../components/landing/Hero'
import EmpoweringSection from '../components/section/EmpoweringSection'
import ServicesSection from '../components/section/ServicesSection'
import WhyChooseSection from '../components/section/WhyChooseSection'
import ClubsSection from '../components/section/ClubsSection'
import HowItWorksSection from '../components/section/HowItWorksSection'
import Footer from '../components/layout/Footer'


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