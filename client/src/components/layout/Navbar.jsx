import { useState, useEffect, useRef } from 'react'
import { Menu, X, LogOut, LayoutDashboard } from 'lucide-react'
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
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const user = useSelector(selectCurrentUser)
    const [logoutApi] = useLogoutMutation()
    const userMenuRef = useRef(null)

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

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
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

    // Get user initials
    const getUserInitials = (name) => {
        if (!name) return 'U'
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    }

    return (
        <nav
            className={cn(
                'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out px-6 py-4',
                isScrolled
                    ? 'bg-white/80 backdrop-blur-md shadow-md py-3'
                    : 'bg-transparent'
            )}
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 group">
                    <img
                        src={logoImg}
                        alt="Serenity Yoga Logo"
                        className={cn(
                            "w-10 h-10 object-contain group-hover:scale-105 transition-transform duration-300",
                            !isScrolled && "brightness-0 invert"
                        )}
                    />
                    <span
                        className={cn(
                            'text-xl md:text-2xl font-display font-medium tracking-tight transition-colors duration-300',
                            isScrolled ? 'text-foreground' : 'text-white'
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
                                        'text-base font-medium transition-colors relative after:content-[""] after:absolute after:left-0 after:bottom-[-4px] after:h-[2px] after:w-0 after:transition-all after:duration-300 hover:after:w-full',
                                        isScrolled
                                            ? 'text-foreground hover:text-primary after:bg-primary'
                                            : 'text-white/90 hover:text-white after:bg-white'
                                    )}
                                >
                                    {link.name}
                                </a>
                            ) : (
                                <Link
                                    to={link.href}
                                    className={cn(
                                        'text-base font-medium transition-colors relative after:content-[""] after:absolute after:left-0 after:bottom-[-4px] after:h-[2px] after:w-0 after:transition-all after:duration-300 hover:after:w-full',
                                        isActive(link.href)
                                            ? (isScrolled ? 'text-primary after:w-full after:bg-primary' : 'text-white after:w-full after:bg-white')
                                            : (isScrolled
                                                ? 'text-foreground hover:text-primary after:bg-primary'
                                                : 'text-white/90 hover:text-white after:bg-white')
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
                            <Link to={user.role === 'admin' ? "/admin" : "/dashboard"}>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={cn(
                                        "rounded-full px-4 border-primary text-primary hover:bg-primary hover:text-white transition-all",
                                        !isScrolled && "bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:text-white"
                                    )}
                                >
                                    Dashboard
                                </Button>
                            </Link>

                            <div className="relative" ref={userMenuRef}>
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className={cn(
                                        "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer",
                                        isScrolled
                                            ? "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
                                            : "bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
                                    )}
                                >
                                    <span className={cn(
                                        "font-bold text-sm",
                                        isScrolled ? "text-foreground" : "text-white"
                                    )}>
                                        {getUserInitials(user.name)}
                                    </span>
                                </button>

                                {/* Dropdown Popover */}
                                {isUserMenuOpen && (
                                    <div className="absolute right-0 mt-3 w-60 bg-white rounded-xl shadow-xl border border-border/50 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                        <div className="px-4 py-3 border-b border-border/50 bg-muted/30">
                                            <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                        </div>

                                        <div className="p-2 flex flex-col gap-1">
                                            <Link
                                                to={user.role === 'admin' ? "/admin" : "/dashboard"}
                                                onClick={() => setIsUserMenuOpen(false)}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                                            >
                                                <LayoutDashboard size={18} />
                                                Dashboard
                                            </Link>

                                            <button
                                                onClick={() => {
                                                    handleLogout()
                                                    setIsUserMenuOpen(false)
                                                }}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-left"
                                            >
                                                <LogOut size={18} />
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link
                                to="/login"
                                className={cn(
                                    'text-sm font-medium transition-colors px-4 py-2 hover:bg-white/10 rounded-full',
                                    isScrolled ? 'text-foreground hover:bg-black/5' : 'text-white'
                                )}
                            >
                                Log in
                            </Link>
                            <Link to="/register">
                                <Button
                                    variant="default"
                                    size="sm"
                                    className={cn(
                                        "rounded-full px-6 shadow-md hover:shadow-lg transition-all",
                                        isScrolled
                                            ? "bg-primary hover:bg-primary/90 text-white"
                                            : "bg-white text-primary hover:bg-white/90"
                                    )}
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
                        isScrolled ? 'text-foreground' : 'text-white'
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
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-center gap-3 py-2">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                                        {getUserInitials(user.name)}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-sm">{user.name}</span>
                                        <span className="text-xs text-muted-foreground">{user.email}</span>
                                    </div>
                                </div>
                                <Link
                                    to={user.role === 'admin' ? "/admin" : "/dashboard"}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <Button
                                        variant="outline"
                                        className="w-full rounded-full border-primary text-primary hover:bg-primary hover:text-white"
                                        size="lg"
                                    >
                                        <LayoutDashboard size={18} className="mr-2" />
                                        Dashboard
                                    </Button>
                                </Link>
                                <Button
                                    variant="outline"
                                    className="w-full rounded-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                                    size="lg"
                                    onClick={() => {
                                        handleLogout()
                                        setIsMobileMenuOpen(false)
                                    }}
                                >
                                    <LogOut size={18} className="mr-2" />
                                    Logout
                                </Button>
                            </div>
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
