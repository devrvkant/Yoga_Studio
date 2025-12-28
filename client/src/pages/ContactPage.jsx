import { Phone, Mail, MapPin, Instagram, Facebook, Youtube, Bot, Calendar } from 'lucide-react'
import { Button } from '../components/ui/Button'
import logoImg from '../assets/logos/logo.png'

export function ContactPage() {
    return (
        <div className="w-full bg-background min-h-screen">
            {/* Split Hero / Form Section */}
            <div className="flex flex-col lg:flex-row min-h-screen">

                {/* Left Column: Info (Teal) */}
                <div className="w-full lg:w-1/3 bg-primary text-white p-12 lg:p-16 flex flex-col justify-center relative">
                    {/* Logo (Visible on mobile/top, but mostly for branding) */}
                    <div className="flex items-center gap-3 mb-12">
                        <img src={logoImg} alt="Serenity Yoga Logo" className="w-10 h-10 object-contain brightness-0 invert" />
                        <span className="text-2xl font-display font-medium">Serenity Yoga</span>
                    </div>

                    <div className="max-w-md">
                        <h1 className="text-5xl md:text-6xl font-display font-bold mb-6">Get In Touch</h1>
                        <p className="text-white/80 text-lg font-light mb-12">
                            We're here to help you begin your journey to inner peace. Contact us with any questions or book your first class today.
                        </p>

                        <div className="space-y-8 mb-12">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <p className="font-bold">Phone</p>
                                    <p className="text-white/80 font-light">(555) 123-4567</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <p className="font-bold">Email</p>
                                    <p className="text-white/80 font-light">hello@serenityyoga.com</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <p className="font-bold">Location</p>
                                    <p className="text-white/80 font-light">123 Wellness Avenue<br />Peaceful Valley, CA 90210</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            {[Instagram, Facebook, Youtube].map((Icon, i) => (
                                <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-primary transition-all duration-300">
                                    <Icon size={20} />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Book Your Class Form (White) */}
                <div className="w-full lg:w-2/3 bg-background p-12 lg:p-16 flex items-center justify-center pt-24 lg:pt-16">
                    <div className="max-w-xl w-full">
                        <div className="text-center md:text-left mb-10">
                            <span className="text-primary font-bold tracking-wider text-sm uppercase mb-2 block">Contact</span>
                            <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground">Book Your Class</h2>
                        </div>

                        <form className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted uppercase tracking-wide">Full Name</label>
                                <input type="text" placeholder="Enter your full name" className="w-full px-4 py-3 rounded-lg border border-border-soft focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-light" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted uppercase tracking-wide">Email</label>
                                <input type="email" placeholder="Enter your email" className="w-full px-4 py-3 rounded-lg border border-border-soft focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-light" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted uppercase tracking-wide">Phone</label>
                                <input type="tel" placeholder="Enter your phone number" className="w-full px-4 py-3 rounded-lg border border-border-soft focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-light" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted uppercase tracking-wide">Select Class</label>
                                <select className="w-full px-4 py-3 rounded-lg border border-border-soft focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-light bg-white">
                                    <option>Choose a class</option>
                                    <option>Hatha Yoga</option>
                                    <option>Vinyasa Flow</option>
                                    <option>Power Yoga</option>
                                    <option>Yin Yoga</option>
                                    <option>Prenatal Yoga</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted uppercase tracking-wide">Preferred Date</label>
                                    <div className="relative">
                                        <input type="date" className="w-full px-4 py-3 rounded-lg border border-border-soft focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-light" />
                                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={18} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted uppercase tracking-wide">Preferred Time</label>
                                    <select className="w-full px-4 py-3 rounded-lg border border-border-soft focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-light bg-white">
                                        <option>Select time</option>
                                        <option>Morning (7am - 12pm)</option>
                                        <option>Afternoon (12pm - 5pm)</option>
                                        <option>Evening (5pm - 9pm)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-muted uppercase tracking-wide">Experience Level</label>
                                <div className="flex gap-6">
                                    {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                                        <label key={level} className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="level" className="w-4 h-4 text-primary border-border-soft focus:ring-primary" />
                                            <span className="text-sm font-light text-foreground">{level}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted uppercase tracking-wide">Special Requirements</label>
                                <textarea rows={4} placeholder="Any injuries, modifications needed, or special requests..." className="w-full px-4 py-3 rounded-lg border border-border-soft focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-light resize-none"></textarea>
                                <p className="text-xs text-muted text-right">0/500 characters</p>
                            </div>

                            <Button className="w-full rounded-lg font-semibold py-4 mt-4" variant="default">
                                Confirm Booking
                            </Button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Map Section */}
            <section className="py-24 bg-background">
                <div className="container mx-auto px-6 max-w-6xl text-center">
                    <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">Visit Our Studio</h2>
                    <p className="text-muted mb-12">Find us in the heart of Peaceful Valley</p>

                    <div className="w-full h-[400px] rounded-2xl overflow-hidden shadow-lg bg-gray-100 relative">
                        {/* Placeholder for map since standard iframes might block without API key or generic embed */}
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d105750.37038165039!2d-118.41173249999999!3d34.0201613!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2c75ddc27da13%3A0xe22fdf6f254608f4!2sLos%20Angeles%2C%20CA!5e0!3m2!1sen!2sus!4v1709490000000!5m2!1sen!2sus"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Google Map"
                        ></iframe>
                        {/* Overlay text if verification needed or map fails */}
                        {/* <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="bg-white/80 px-4 py-2 rounded-lg text-sm text-muted">Use ⌘ + scroll to zoom the map</span>
                         </div> */}
                    </div>
                </div>
            </section>

            {/* Floating Chat Button */}
            <div className="fixed bottom-6 right-6 z-50">
                <button className="flex items-center gap-2 bg-[#3d4f5f] text-white pl-4 pr-5 py-3 rounded-full shadow-lg hover:shadow-xl hover:bg-[#4a5f6f] hover:-translate-y-0.5 transition-all duration-300 border-0 cursor-pointer">
                    <Bot size={18} />
                    <span className="text-sm font-medium">Talk with Us</span>
                </button>
            </div>
        </div>
    )
}
