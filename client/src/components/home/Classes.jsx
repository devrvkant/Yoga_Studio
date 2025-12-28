import { ArrowRight } from 'lucide-react'
import { Button } from '../ui/Button'

export function Classes() {
    const classes = [
        {
            title: "Beginner Hatha",
            desc: "Perfect for those new to yoga. Learn basic poses and breathing techniques.",
            image: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop",
        },
        {
            title: "Vinyasa Flow",
            desc: "Dynamic flowing sequences that connect breath with movement.",
            image: "https://images.unsplash.com/photo-1510894347713-fc3ed6fdf539?q=80&w=800&auto=format&fit=crop",
        },
        {
            title: "Restorative Yoga",
            desc: "Deeply relaxing practice using props for stress relief and healing.",
            image: "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?q=80&w=800&auto=format&fit=crop",
        }
    ]

    return (
        <section className="py-24 bg-section-alt" id="classes">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="text-center mb-16">
                    <span className="text-primary font-bold tracking-wider text-sm uppercase mb-2 block">Popular Classes</span>
                    <h2 className="text-4xl md:text-5xl font-display font-medium text-foreground">Start Your Practice</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {classes.map((item, index) => (
                        <div key={index} className="group bg-white rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-border-soft flex flex-col">
                            <div className="relative h-60 overflow-hidden">
                                <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            </div>
                            <div className="p-8 flex flex-col flex-grow items-start text-left">
                                <h3 className="text-xl font-sans font-bold mb-3 text-foreground">{item.title}</h3>
                                <p className="text-muted mb-6 flex-grow leading-relaxed text-sm">{item.desc}</p>
                                <Button className="w-full rounded-md font-semibold" variant="default">Book Now</Button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center">
                    <a href="#" className="inline-flex items-center text-primary font-semibold hover:text-primary/80 transition-all hover:translate-x-1">
                        View All Classes <ArrowRight className="ml-2 w-4 h-4" />
                    </a>
                </div>
            </div>
        </section>
    )
}
