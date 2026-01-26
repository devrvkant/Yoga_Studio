import { Facebook, Instagram, Youtube, Send } from 'lucide-react'
import { Button } from '../ui/Button'
import logoImg from '../../assets/logos/logo.png'
import { Link } from 'react-router-dom'

export function Footer() {
    return (
        <footer className="bg-[#1f2937] text-gray-300 py-16">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div className="flex flex-col">
                        <Link to="/" className="flex items-center gap-2 mb-6 cursor-pointer">
                            <img src={logoImg} alt="Serenity Yoga Logo" className="w-10 h-10 object-contain" />
                            <span className="text-2xl font-display font-medium text-white">Serenity Yoga</span>
                        </Link>
                        <p className="text-sm leading-relaxed text-gray-400">
                            Find balance, find peace
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="lg:pl-8">
                        <h4 className="text-white font-semibold mb-6">Quick Links</h4>
                        <ul className="space-y-4 text-sm">
                            <li><Link to="/" className="hover:text-primary transition-colors cursor-pointer">Home</Link></li>
                            <li><Link to="/classes" className="hover:text-primary transition-colors cursor-pointer">Classes</Link></li>
                            <li><Link to="/about" className="hover:text-primary transition-colors cursor-pointer">About</Link></li>
                            <li><Link to="/courses" className="hover:text-primary transition-colors cursor-pointer">Courses</Link></li>
                            <li><Link to="/contact" className="hover:text-primary transition-colors cursor-pointer">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Connect */}
                    <div>
                        <h4 className="text-white font-semibold mb-6">Connect</h4>
                        <ul className="space-y-4 text-sm">
                            <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-2 cursor-pointer"><Instagram size={16} /> Instagram</a></li>
                            <li><a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-2 cursor-pointer"><Facebook size={16} /> Facebook</a></li>
                            <li><a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-2 cursor-pointer"><Youtube size={16} /> YouTube</a></li>
                        </ul>
                    </div>

                    {/* Philosophy */}
                    <div className="lg:pl-4">
                        <h4 className="text-white font-semibold mb-6">Our Philosophy</h4>
                        <div className="space-y-4 text-sm">
                            <blockquote className="border-l-2 border-primary pl-4 italic text-gray-300 leading-relaxed">
                                "Yoga is the journey of the self, through the self, to the self."
                            </blockquote>
                            <p className="text-gray-400 text-xs">
                                — The Bhagavad Gita
                            </p>
                            <p className="text-gray-400 leading-relaxed pt-2">
                                Join us in discovering inner peace, strength, and balance through mindful practice.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
                    <p>© {new Date().getFullYear()} Serenity Yoga Studio. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                        <a href="#" className="hover:text-white transition-colors">Website Builder</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

function ArrowRight(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    )
}
