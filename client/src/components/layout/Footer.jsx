import { Facebook, Instagram, Youtube, Send } from 'lucide-react'
import { Button } from '../ui/Button'
import logoImg from '../../assets/logos/logo.png'

export function Footer() {
    return (
        <footer className="bg-[#1f2937] text-gray-300 py-16">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="flex flex-col md:flex-row justify-between gap-12 mb-16">
                    {/* Brand */}
                    <div className="max-w-xs">
                        <div className="flex items-center gap-2 mb-6">
                            <img src={logoImg} alt="Serenity Yoga Logo" className="w-10 h-10 object-contain" />
                            <span className="text-2xl font-display font-medium text-white">Serenity Yoga</span>
                        </div>
                        <p className="text-sm leading-relaxed text-gray-400">
                            Find balance, find peace
                        </p>
                    </div>

                    {/* Links */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-12 md:gap-24">
                        <div>
                            <h4 className="text-white font-semibold mb-6">Quick Links</h4>
                            <ul className="space-y-4 text-sm">
                                <li><a href="#" className="hover:text-primary transition-colors">Home</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Classes</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Instructors</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-6">Connect</h4>
                            <ul className="space-y-4 text-sm">
                                <li><a href="#" className="hover:text-primary transition-colors flex items-center gap-2"><Instagram size={16} /> Instagram</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors flex items-center gap-2"><Facebook size={16} /> Facebook</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors flex items-center gap-2"><Youtube size={16} /> YouTube</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-6">Newsletter</h4>
                            <p className="text-sm mb-4">Get weekly wellness tips</p>
                            <div className="flex bg-white/5 rounded-md overflow-hidden border border-white/10 focus-within:border-primary transition-colors">
                                <input
                                    type="email"
                                    placeholder="Your email"
                                    className="bg-transparent px-4 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none w-full"
                                />
                                <button className="bg-primary hover:bg-primary/90 text-white px-3 transition-colors">
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
                    <p>© {new Date().getFullYear()} Serenity Yoga Studio. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
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
