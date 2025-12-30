import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '../ui/Button'
import { cn } from '../../lib/utils'
import logoImg from '../../assets/logos/logo.png'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { selectCurrentUser, logout as logoutAction } from '../../features/auth/authSlice'
import { useLogoutMutation } from '../../features/auth/authApi'
import { toast } from 'sonner'

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const user = useSelector(selectCurrentUser)
    const [logoutApi] = useLogoutMutation()

    const handleLogout = async () => {
        try {
            await logoutApi().unwrap()
            dispatch(logoutAction())
            toast.success('Logged out successfully')
            navigate('/')
        } catch (err) {
            console.error('Logout failed', err)
            // Even if API fails, clear local state
            dispatch(logoutAction())
            navigate('/')
        }
    }

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

                {/* Auth Buttons */}
                <div className="hidden md:flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className={cn('text-sm font-medium', isScrolled ? 'text-foreground' : 'text-foreground/90')}>
                                Hi, {user.name.split(' ')[0]}
                            </span>
                            {/* Simple check for 'admin' role. In a real app, maybe use a permission selector */}
                            {user.role === 'admin' && (
                                <Link to="/admin">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-full px-4 border-primary text-primary hover:bg-primary hover:text-white"
                                    >
                                        Dashboard
                                    </Button>
                                </Link>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleLogout}
                                className="rounded-full px-6 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                            >
                                Logout
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link
                                to="/login"
                                className={cn(
                                    'text-sm font-medium transition-colors px-4 py-2 hover:bg-black/5 rounded-full',
                                    isScrolled ? 'text-foreground' : 'text-foreground/90'
                                )}
                            >
                                Log in
                            </Link>
                            <Link to="/register">
                                <Button
                                    variant="default"
                                    size="sm"
                                    className="rounded-full px-6 shadow-md hover:shadow-lg transition-all bg-primary hover:bg-primary/90 text-white"
                                >
                                    Get Started
                                </Button>
                            </Link>
                        </div>
                    )}
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
                        <div className="w-full h-px bg-border my-2" />
                        {user ? (
                            <Button
                                variant="outline"
                                className="w-full rounded-full border-primary text-primary"
                                size="lg"
                                onClick={() => {
                                    handleLogout()
                                    setIsMobileMenuOpen(false)
                                }}
                            >
                                Logout
                            </Button>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                    <Button variant="ghost" className="w-full rounded-full" size="lg">
                                        Log in
                                    </Button>
                                </Link>
                                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                                    <Button className="w-full rounded-full" size="lg">
                                        Get Started
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    )
}
