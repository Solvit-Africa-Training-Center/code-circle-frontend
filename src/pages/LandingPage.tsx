import Header from '../components/layout/Header'
import Hero from '../components/landing/Hero'
import EmpoweringSection from '../components/section/EmpoweringSection'
import ServicesSection from '../components/section/ServicesSection'
import WhyChooseSection from '../components/section/WhyChooseSection'
import ClubsSection from '../components/section/ClubsSection'
import Footer from '../components/layout/Footer'


export default function LandingPage() {
    return(
        <>
        <Header />
        <Hero />
        <EmpoweringSection
        />
        <ServicesSection/>
        <WhyChooseSection/>
        < ClubsSection/>
        <Footer/>
        </>

    )
}