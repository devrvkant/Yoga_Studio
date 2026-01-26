import { Heart, Users, Leaf, Scale, Bot, Instagram, Linkedin } from 'lucide-react'
import { Button } from '../components/ui/Button'
import aboutHeroImg from '../assets/images/aboutHero.jpg'
import facility1 from '../assets/images/facility_1.jpg'
import facility2 from '../assets/images/facility_2.jpg'
import facility3 from '../assets/images/facility_3.jpg'
import instructorImg from '../assets/images/instructor.jpg'

export function About() {
    const values = [
        {
            icon: Heart,
            title: "Compassion",
            desc: "We approach every student with kindness, understanding, and non-judgment, creating a safe space for growth and healing."
        },
        {
            icon: Users,
            title: "Community",
            desc: "We foster connections and build a supportive community where everyone feels welcomed and valued."
        },
        {
            icon: Leaf,
            title: "Growth",
            desc: "We encourage continuous learning and personal development, both on and off the mat."
        },
        {
            icon: Scale,
            title: "Balance",
            desc: "We promote harmony between mind, body, and spirit through mindful practice and intentional living."
        }
    ]

    return (
        <div className="w-full">
            {/* Hero Section */}
            <section className="relative w-full h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1545389336-cf090694435e?q=80&w=2000&auto=format&fit=crop"
                        alt="Meditation"
                        className="w-full h-full object-cover object-[center_45%]"
                    />
                    {/* Minimal dark overlay for text contrast */}
                    <div className="absolute inset-0 bg-black/30" />
                </div>
                <div className="relative z-10 text-center text-white px-6 pt-20">
                    <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 drop-shadow-lg">Our Story</h1>
                    <p className="text-white/95 text-lg md:text-xl font-medium max-w-2xl mx-auto drop-shadow-md">
                        A journey of mindfulness, movement, and community dedicated to your personal growth and well-being.
                    </p>
                </div>
            </section>

            {/* Philosophy Section */}
            <section className="py-24 bg-background">
                <div className="container mx-auto px-6 max-w-4xl text-center">
                    <div className="w-16 h-16 mx-auto mb-8 text-primary">
                        <Leaf size={48} strokeWidth={1.5} />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-8">Our Philosophy</h2>
                    <div className="space-y-6 text-lg text-muted font-light leading-relaxed">
                        <p>
                            At Serenity Yoga Studio, we believe that yoga is more than just physical exercise—it's a journey of self-discovery, healing, and transformation. Our mission is to create a sanctuary where individuals can find balance, strength, and inner peace through the ancient practice of yoga.
                        </p>
                        <p>
                            Founded in 2018, our studio has grown from a small community space into a thriving wellness center that serves practitioners of all levels. We are committed to making yoga accessible to everyone, regardless of age, experience, or physical ability.
                        </p>
                        <p>
                            Every class, workshop, and retreat we offer is designed with intention and care, fostering a supportive environment where students can explore their practice safely and mindfully. We honor the traditional roots of yoga while embracing modern approaches to wellness and healing.
                        </p>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-24 bg-section-alt">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center mb-20">
                        <span className="text-primary font-bold tracking-wider text-sm uppercase mb-2 block">Our Values</span>
                        <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground">What We Stand For</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {values.map((item, index) => (
                            <div key={index} className="bg-white p-12 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center border border-border-soft/50">
                                <div className="w-16 h-16 rounded-full bg-transparent flex items-center justify-center text-primary mb-6">
                                    <item.icon size={32} strokeWidth={1.5} />
                                </div>
                                <h3 className="text-2xl font-sans font-bold text-foreground mb-4">{item.title}</h3>
                                <p className="text-muted leading-relaxed font-light">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Facilities Section 1 */}
            <section className="py-24 bg-background overflow-hidden">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="flex flex-col md:flex-row items-center gap-16 md:gap-24 mb-32">
                        <div className="w-full md:w-1/2">
                            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">Modern Facilities</h2>
                            <p className="text-muted text-lg leading-relaxed mb-6 font-light">
                                Our studio features state-of-the-art facilities designed to enhance your yoga experience. With natural lighting, premium equipment, and a calming atmosphere, every detail has been carefully considered to support your practice.
                            </p>
                            <p className="text-muted text-lg leading-relaxed font-light">
                                From our spacious main studio to our quiet meditation room, each space is designed to promote peace, focus, and transformation.
                            </p>
                        </div>
                        <div className="w-full md:w-1/2 relative">
                            <div className="rounded-[2rem] overflow-hidden shadow-xl">
                                <img src={facility1} alt="Modern Yoga Studio" className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700" />
                            </div>
                        </div>
                    </div>

                    {/* Facilities Section 2 */}
                    <div className="flex flex-col md:flex-row-reverse items-center gap-16 md:gap-24 mb-32">
                        <div className="w-full md:w-1/2">
                            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">Premium Equipment</h2>
                            <p className="text-muted text-lg leading-relaxed mb-6 font-light">
                                We provide high-quality yoga props and equipment to support your practice. From premium yoga mats to bolsters, blocks, and straps, everything you need is available at the studio.
                            </p>
                            <p className="text-muted text-lg leading-relaxed font-light">
                                Our equipment is regularly cleaned and maintained to ensure the highest standards of hygiene and safety for all our students.
                            </p>
                        </div>
                        <div className="w-full md:w-1/2 relative">
                            <div className="rounded-[2rem] overflow-hidden shadow-xl">
                                <img src={facility2} alt="Yoga Equipment" className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700" />
                            </div>
                        </div>
                    </div>

                    {/* Facilities Section 3 */}
                    <div className="flex flex-col md:flex-row items-center gap-16 md:gap-24">
                        <div className="w-full md:w-1/2">
                            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">Meditation & Relaxation</h2>
                            <p className="text-muted text-lg leading-relaxed mb-6 font-light">
                                Our dedicated meditation room provides a quiet sanctuary for reflection and mindfulness practice. This sacred space is designed to help you deepen your meditation practice and find inner stillness.
                            </p>
                            <p className="text-muted text-lg leading-relaxed font-light">
                                Whether you're seeking a moment of peace before class or want to extend your practice with meditation, this space is always available to our community.
                            </p>
                        </div>
                        <div className="w-full md:w-1/2 relative">
                            <div className="rounded-[2rem] overflow-hidden shadow-xl">
                                <img src={facility3} alt="Meditation Space" className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Instructor Section */}
            <section className="py-24 bg-background border-t border-border-soft/30">
                <div className="container mx-auto px-6 max-w-4xl text-center">
                    <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-16">Meet Our Instructor</h2>
                    <div className="flex flex-col items-center">
                        <div className="w-64 h-64 rounded-2xl overflow-hidden shadow-lg mb-8 relative group">
                            <img src={instructorImg} alt="Sarah Chen" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300" />
                        </div>
                        <h3 className="text-2xl font-display font-bold text-foreground mb-2">Sarah Chen</h3>
                        <p className="text-primary font-medium mb-6 uppercase tracking-wider text-sm">Lead Instructor & Studio Owner</p>
                        <p className="text-muted text-lg leading-relaxed max-w-2xl font-light mb-8">
                            Sarah discovered yoga during a challenging period in her life and experienced its transformative power firsthand. With over 15 years of practice and 8 years of teaching experience, she is passionate about sharing the healing benefits of yoga with others. Her classes focus on alignment, breath awareness, and creating a safe space for students to explore their practice at their own pace.
                        </p>
                        <div className="flex items-center gap-6 text-muted hover:text-primary transition-colors">
                            <a href="#" className="hover:scale-110 transition-transform duration-300 hover:text-primary">
                                <Instagram size={20} />
                            </a>
                            <a href="#" className="hover:scale-110 transition-transform duration-300 hover:text-primary">
                                <Linkedin size={20} />
                            </a>
                        </div>
                    </div>
                </div>
            </section>


        </div>
    )
}
