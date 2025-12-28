import { useState } from 'react'
import { Clock, Users, ArrowRight, User } from 'lucide-react'
import { Button } from '../components/ui/Button'
import instructorImg from '../assets/images/instructor.jpg'
import hathaImg from '../assets/images/hatha_yoga.jpg'
import vinyasaImg from '../assets/images/vinyasa_flow.jpg'
import powerImg from '../assets/images/power_yoga.jpg'
import yinImg from '../assets/images/yin_yoga.jpg'
import prenatalImg from '../assets/images/prenetal_yoga.jpg'
import restorativeImg from '../assets/images/restorative_yoga.jpg'

export function ClassesPage() {
    const [activeFilter, setActiveFilter] = useState("All Classes")

    const filters = ["All Classes", "Beginner", "Intermediate", "Advanced", "Specialty"]

    const classes = [
        {
            id: 1,
            title: "Hatha Yoga",
            level: "Beginner",
            duration: "60 min",
            instructor: "Sarah Chen",
            image: hathaImg,
            desc: "A gentle introduction to basic yoga postures and breathing techniques. Perfect for beginners looking to start their yoga journey."
        },
        {
            id: 2,
            title: "Vinyasa Flow",
            level: "Intermediate",
            duration: "75 min",
            instructor: "Sarah Chen",
            image: vinyasaImg,
            desc: "Dynamic flowing sequences that link breath with movement. Build strength, flexibility, and endurance through continuous flow."
        },
        {
            id: 3,
            title: "Power Yoga",
            level: "Advanced",
            duration: "90 min",
            instructor: "Sarah Chen",
            image: powerImg,
            desc: "Intense, athletic-style yoga that builds strength and stamina. Challenge yourself with advanced poses and inversions."
        },
        {
            id: 4,
            title: "Yin Yoga",
            level: "All Levels",
            duration: "75 min",
            instructor: "Sarah Chen",
            image: yinImg,
            desc: "Slow-paced practice with poses held for longer periods. Deep relaxation, flexibility, and stress relief."
        },
        {
            id: 5,
            title: "Prenatal Yoga",
            level: "All Levels",
            duration: "60 min",
            instructor: "Sarah Chen",
            image: prenatalImg,
            desc: "Safe and gentle yoga practice designed specifically for expecting mothers. Modified poses for comfort and safety."
        },
        {
            id: 6,
            title: "Restorative Yoga",
            level: "All Levels",
            duration: "60 min",
            instructor: "Sarah Chen",
            image: restorativeImg,
            desc: "Deeply relaxing practice using props to support the body in restful poses. Perfect for stress relief and healing."
        }
    ]

    const filteredClasses = activeFilter === "All Classes"
        ? classes
        : activeFilter === "Specialty"
            ? classes.filter(c => c.level === "All Levels")
            : classes.filter(c => c.level === activeFilter)


    return (
        <div className="w-full bg-background min-h-screen">
            {/* Hero Section */}
            <section className="relative w-full h-[60vh] min-h-[500px] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=2000&auto=format&fit=crop"
                        alt="Yoga Class"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-primary/90" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto">
                    <span className="text-white/80 text-sm md:text-base font-medium uppercase tracking-widest mb-4 block">Home / Classes</span>
                    <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6">Our Classes</h1>
                    <p className="text-white/90 text-lg md:text-xl font-light max-w-2xl mx-auto">
                        Find the perfect class for your yoga journey
                    </p>
                </div>

                {/* Filters */}
                <div className="mt-12 flex flex-wrap justify-center gap-4 relative z-10">
                    {filters.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-6 py-2 rounded-full border transition-all duration-300 font-medium text-sm md:text-base ${activeFilter === filter
                                ? 'bg-white text-primary border-white'
                                : 'bg-transparent text-white border-white/50 hover:bg-white/10'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </section>

            {/* Classes Grid */}
            <section className="py-24 bg-background">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredClasses.map((item) => (
                            <div key={item.id} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-border-soft flex flex-col relative">
                                {/* Level Badge */}
                                <div className="absolute top-4 right-4 z-10">
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold text-white uppercase tracking-wider ${item.level === "Beginner" ? "bg-emerald-500" :
                                        item.level === "Intermediate" ? "bg-teal-600" :
                                            item.level === "Advanced" ? "bg-slate-800" :
                                                "bg-emerald-600" // Default/All Levels
                                        }`}>
                                        {item.level}
                                    </span>
                                </div>

                                <div className="relative h-64 overflow-hidden">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                </div>

                                <div className="p-8 flex flex-col flex-grow">
                                    <div className="flex items-center gap-4 text-xs font-medium text-muted mb-4 uppercase tracking-wide">
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={14} />
                                            {item.duration}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Users size={14} />
                                            {item.level}
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-display font-bold text-foreground mb-3">{item.title}</h3>
                                    <p className="text-muted leading-relaxed mb-6 font-light text-sm flex-grow">
                                        {item.desc}
                                    </p>

                                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-border-soft/60 mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100">
                                                <img src={instructorImg} alt={item.instructor} className="w-full h-full object-cover" />
                                            </div>
                                            <span className="text-sm font-medium text-foreground">{item.instructor}</span>
                                        </div>
                                        <button className="text-primary text-sm font-semibold hover:text-primary-dark transition-colors flex items-center gap-1">
                                            Learn More <ArrowRight size={14} />
                                        </button>
                                    </div>

                                    <Button className="w-full rounded-lg font-semibold py-6" variant="default">
                                        Book This Class
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <div className="bg-section-alt py-16 text-center">
                <h2 className="text-3xl font-display font-bold text-foreground mb-4">Not sure where to start?</h2>
                <p className="text-muted mb-8 max-w-xl mx-auto">Book a free consultation with one of our instructors to find the perfect class for your goals.</p>
                <Button variant="outline" size="lg" className="rounded-full px-8">Talk to Us</Button>
            </div>
        </div>
    )
}
