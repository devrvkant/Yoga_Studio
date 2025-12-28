import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '../ui/Button'
import { cn } from '../../lib/utils'
import logoImg from '../../assets/logos/logo.png'
import { Link, useLocation } from 'react-router-dom'

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const location = useLocation()

    useEffect(() => {
        const handleScroll = () => {
            // Trigger background when scrolled past navbar height (~80px)
            setIsScrolled(window.scrollY > 80)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Helper to check if link is active
    const isActive = (path) => {
        if (path === '/' && location.pathname === '/') return true
        if (path !== '/' && location.pathname.startsWith(path)) return true
        return false
    }

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'About', href: '/about' },
        { name: 'Classes', href: '/classes' },
        { name: 'Courses', href: '/courses' },
        { name: 'Contact', href: '/contact' },
    ]

    return (
        <nav
            className={cn(
                'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out px-6 py-4',
                isScrolled
                    ? 'bg-white shadow-md py-3'
                    : 'bg-transparent'
            )}
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3">
                    <img src={logoImg} alt="Serenity Yoga Logo" className="w-10 h-10 object-contain" />
                    <span
                        className={cn(
                            'text-xl md:text-2xl font-display font-medium tracking-tight transition-colors duration-300',
                            isScrolled ? 'text-foreground' : 'text-foreground'
                        )}
                    >
                        Serenity Yoga
                    </span>
                </Link>

                {/* Desktop Nav Links */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <div key={link.name}>
                            {link.href.startsWith('/#') ? (
                                <a
                                    href={link.href}
                                    className={cn(
                                        'text-base font-medium transition-colors',
                                        isScrolled
                                            ? 'text-foreground hover:text-primary'
                                            : 'text-foreground/90 hover:text-primary'
                                    )}
                                >
                                    {link.name}
                                </a>
                            ) : (
                                <Link
                                    to={link.href}
                                    className={cn(
                                        'text-base font-medium transition-colors',
                                        isActive(link.href)
                                            ? 'text-primary underline underline-offset-4 decoration-2 decoration-primary'
                                            : isScrolled
                                                ? 'text-foreground hover:text-primary'
                                                : 'text-foreground/90 hover:text-primary'
                                    )}
                                >
                                    {link.name}
                                </Link>
                            )}
                        </div>
                    ))}
                </div>

                {/* Book Now Button */}
                <div className="hidden md:flex">
                    <Button
                        variant="default"
                        size="sm"
                        className="rounded-full px-6 shadow-md hover:shadow-lg transition-all bg-primary hover:bg-primary/90 text-white"
                    >
                        Book Now
                    </Button>
                </div>

                {/* Mobile Toggle */}
                <button
                    className={cn(
                        'md:hidden p-2 transition-colors',
                        isScrolled ? 'text-foreground' : 'text-foreground'
                    )}
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 bg-white border-b border-border-soft p-6 md:hidden shadow-lg animate-in slide-in-from-top-5">
                    <div className="flex flex-col gap-4">
                        {navLinks.map((link) => (
                            link.href.startsWith('/#') ? (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    className='text-lg font-medium transition-colors text-center py-2 text-foreground hover:text-primary'
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {link.name}
                                </a>
                            ) : (
                                <Link
                                    key={link.name}
                                    to={link.href}
                                    className={cn(
                                        'text-lg font-medium transition-colors text-center py-2',
                                        isActive(link.href) ? 'text-primary underline underline-offset-4 decoration-2 decoration-primary' : 'text-foreground hover:text-primary'
                                    )}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            )
                        ))}
                        <Button className="w-full rounded-full mt-2" size="lg">
                            Book Now
                        </Button>
                    </div>
                </div>
            )}
        </nav>
    )
}
