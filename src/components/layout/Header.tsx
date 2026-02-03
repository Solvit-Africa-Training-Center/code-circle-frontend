import {useState} from 'react';
import {Menu, X} from 'lucide-react';

const navItems = [
    {label:'Home', href: '#'},
    {label: 'About', href: '#about'},
    {label: 'Our Clubs', href: '#'},
    {label: 'How It Works', href: '#'},
    {label: 'Contact', href: '#'},
];

export default function Header(){
    const [isOpen, setIsOpen] = useState(false);

    return(
        <header className="
            fixed top-0 z-50 w-full
            h-16 md:h-20  
            backdrop-blur-xl
            
           "
            
        >
            <div className="max auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8 lg:px-10">
            <a href='#' className="flex items-center gap-2 text-2xl font-bold text-white">
                <span>&lt;/&gt;</span>
                CODECIRCLE
            </a>

            <div className="hidden items-center gap-10 md:flex ">
               <nav className="flex gap-8"> {navItems.map(item =>(
                    <a 
                    key={item.label}
                    href={item.href}
                    className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
                    >{item.label}</a>
                ))}
                </nav> 

                <a href="#"
                className="rounded-lg border border-blue-300 px-6 py-2.5 text-sm font-medium text-blue-500 transition-all hover:from-blue-400 hover:shadow-lg hover:shadow-cyan-500/30 hover:text-white">
                    Apply Now
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
                            href={item.href}
                            className="text-lg font-medium text-slate-200 transition hover:text-white"
                            onClick={() => setIsOpen(false)}
                            >{item.label}</a>
                        ))}
                        <a
                        href="#"
                        className="mt-3 rounded-lg border border-blue-300 py-3.5 text-center font-medium text-white"
                        onClick={() => setIsOpen(false)}> 
                        Apply Now</a>
                    </div>
                </div>
            )}


        </header>
    )
}