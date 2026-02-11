import { useEffect, useState } from 'react';
import {Menu, X} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import CodeCircleLogo from '@/components/common/CodeCircleLogo';

const navItems = [
    {label:'Home', href: '#home', sectionId: 'home'},
    {label: 'About', href: '#about', sectionId: 'about'},
    {label: 'Our Clubs', href: '#clubs', sectionId: 'clubs'},
    {label: 'How It Works', href: '#how-it-works', sectionId: 'how-it-works'},
    {label: 'Contact', href: '#contact', sectionId: 'contact'},
];

export default function Header(){
    const [isOpen, setIsOpen] = useState(false);
    const [isHidden, setIsHidden] = useState(false);
    const [showBg, setShowBg] = useState(false);
    const [activeSection, setActiveSection] = useState('home');
    const location = useLocation();

    useEffect(() => {
        const isLeader = location.pathname.startsWith('/leader');
        const isLeaderApply =
            location.pathname === '/leader/apply' || location.pathname.startsWith('/leader/apply/');
        const isLeaderChangePassword = location.pathname === '/leader/change-password';
        if (isLeaderChangePassword) {
            setIsHidden(false);
            setShowBg(true);
            return;
        }
        if (isLeader && !isLeaderApply) {
            setIsHidden(false);
            setShowBg(false);
            return;
        }

        let lastScrollY = window.scrollY;
        const onScroll = () => {
            const currentY = window.scrollY;
            if (currentY > lastScrollY && currentY > 80) {
                setIsHidden(true);
            } else {
                setIsHidden(false);
            }

            if (currentY === 0) {
                setShowBg(false);
            } else if (currentY < lastScrollY) {
                setShowBg(true);
            } else {
                setShowBg(false);
            }

            lastScrollY = currentY;
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [location.pathname]);

    useEffect(() => {
        if (location.pathname !== '/') {
            setActiveSection('');
            return;
        }

        const sectionIds = navItems.map((item) => item.sectionId);
        const observer = new IntersectionObserver(
            (entries) => {
                let bestMatch: { id: string; ratio: number } | null = null;
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    const id = entry.target.id;
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

        sectionIds.forEach((id) => {
            const section = document.getElementById(id);
            if (section) observer.observe(section);
        });

        return () => observer.disconnect();
    }, [location.pathname]);

    const resolveHref = (href: string) => {
        if (href.startsWith('#')) {
            return location.pathname === '/' ? href : `/${href}`;
        }
        return href;
    };

    return(
        <header className={`
            fixed top-0 z-50 w-full
            h-16 md:h-20
            transition-transform duration-300
            ${showBg ? 'bg-blue-900/80 backdrop-blur-md border-b border-blue-800/50' : 'bg-transparent border-transparent'}
           `}
            style={{ transform: isHidden ? 'translateY(-100%)' : 'translateY(0)' }}

        >
            <div className="flex h-16 w-full items-center justify-between px-5 sm:px-8 md:px-16">
            <CodeCircleLogo
                asLink
                className="text-white text-2xl"
                iconClassName="text-2xl text-blue-400"
                textClassName="tracking-wide"
            />

            <div className="hidden items-center gap-10 md:flex">
               <nav className="flex gap-8"> {navItems.map(item =>(
                    <a 
                    key={item.label}
                    href={resolveHref(item.href)}
                    className={`text-sm font-medium transition-colors ${
                        location.pathname === '/' && activeSection === item.sectionId
                            ? 'text-white'
                            : 'text-slate-300 hover:text-white'
                    }`}
                    >{item.label}</a>
                ))}
                </nav> 

                <a href="/login"
                className="rounded-lg border border-blue-300 px-6 py-2.5 text-sm font-medium text-blue-500 transition-all hover:from-blue-400 hover:shadow-lg hover:shadow-cyan-500/30 hover:text-white">
                    Login
                </a>
                
            </div>
            <button
            className="md:hidden text-white"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            >
             {isOpen ? <X size={28} /> : <Menu size={28} />}

            </button>
            </div>

            {isOpen && (
                <div className="border-b border-blue-950/50 bg-slate-950/95 md:hidden">
                    <div className="flex flex-col gap-5 px-5 py-6">
                        {navItems.map(item =>(
                            <a 
                            key={item.label}
                            href={resolveHref(item.href)}
                            className={`text-lg font-medium transition ${
                                location.pathname === '/' && activeSection === item.sectionId
                                    ? 'text-white'
                                    : 'text-slate-200 hover:text-white'
                            }`}
                            onClick={() => setIsOpen(false)}
                            >{item.label}</a>
                        ))}
                        <a
                        href="/login"
                        className="mt-3 rounded-lg border border-blue-300 py-3.5 text-center font-medium text-white"
                        onClick={() => setIsOpen(false)}> 
                        Login</a>
                    </div>
                </div>
            )}


        </header>
    )
}
