import { Phone, Mail, MapPin, Instagram, Facebook, Youtube, Bot, Calendar } from 'lucide-react'
import { Button } from '../components/ui/Button'
import logoImg from '../assets/logos/logo.png'

export function ContactPage() {
    const contactInfo = [
        {
            icon: Phone,
            title: "Phone",
            details: "(555) 123-4567",
            link: "tel:+15551234567"
        },
        {
            icon: Mail,
            title: "Email",
            details: "hello@serenityyoga.com",
            link: "mailto:hello@serenityyoga.com"
        },
        {
            icon: MapPin,
            title: "Location",
            details: "123 Wellness Avenue, Peaceful Valley, CA 90210",
            link: "#"
        }
    ]

    return (
        <div className="w-full bg-background min-h-screen">
            {/* Hero Section */}
            <section className="relative w-full h-[60vh] min-h-[500px] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1552196563-55cd4e45efb3?q=80&w=2000&auto=format&fit=crop"
                        alt="Contact Us"
                        className="w-full h-full object-cover object-[center_25%]"
                    />
                    {/* Minimal dark overlay for text contrast */}
                    <div className="absolute inset-0 bg-black/30" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto text-white">
                    <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 drop-shadow-lg">Get in Touch</h1>
                    <p className="text-white/95 text-lg md:text-xl font-medium max-w-2xl mx-auto drop-shadow-md">
                        We're here to answer any questions you may have about our classes, courses, or studio.
                    </p>
                </div>
            </section>

            {/* Info Cards Section Removed */}

            {/* Form Section */}
            <section className="py-16 bg-background">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="bg-white rounded-2xl shadow-sm border border-border-soft overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-5">
                            {/* Form Side */}
                            <div className="md:col-span-3 p-8 md:p-12">
                                <div className="mb-8">
                                    <h2 className="text-3xl font-display font-bold text-foreground mb-2">Send us a Message</h2>
                                    <p className="text-muted font-light text-sm">Fill out the form below and we'll get back to you shortly.</p>
                                </div>

                                <form className="space-y-5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-muted uppercase tracking-wide">Full Name</label>
                                        <input type="text" placeholder="John Doe" className="w-full px-4 py-3 rounded-lg border border-border-soft focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-light bg-muted/10" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-muted uppercase tracking-wide">Email</label>
                                            <input type="email" placeholder="john@example.com" className="w-full px-4 py-3 rounded-lg border border-border-soft focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-light bg-muted/10" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-muted uppercase tracking-wide">Phone</label>
                                            <input type="tel" placeholder="(555) 123-4567" className="w-full px-4 py-3 rounded-lg border border-border-soft focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-light bg-muted/10" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-muted uppercase tracking-wide">Subject</label>
                                        <select className="w-full px-4 py-3 rounded-lg border border-border-soft focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-light bg-muted/10">
                                            <option>General Inquiry</option>
                                            <option>Class Booking</option>
                                            <option>Private Session</option>
                                            <option>Feedback</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-muted uppercase tracking-wide">Message</label>
                                        <textarea rows={4} placeholder="How can we help you?" className="w-full px-4 py-3 rounded-lg border border-border-soft focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-light resize-none bg-muted/10"></textarea>
                                    </div>

                                    <Button className="w-full rounded-lg font-semibold py-4" variant="default">
                                        Send Message
                                    </Button>
                                </form>
                            </div>

                            {/* Sidebar / Image Side */}
                            <div className="md:col-span-2 bg-primary text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
                                <div className="relative z-10">
                                    <h3 className="text-2xl font-display font-bold mb-4">Connect With Us</h3>
                                    <p className="text-white/80 font-light text-sm mb-8 leading-relaxed">
                                        Follow our journey and stay updated with the latest studio news, class schedules, and wellness tips.
                                    </p>

                                    <div className="flex gap-4 mb-8">
                                        {[Instagram, Facebook, Youtube].map((Icon, i) => (
                                            <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white hover:text-primary transition-all duration-300">
                                                <Icon size={18} />
                                            </a>
                                        ))}
                                    </div>
                                </div>

                                {/* Decorative Circles */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Section Removed */}


        </div>
    )
}
