import { Brain, HeartPulse, Leaf } from 'lucide-react'

export function Benefits() {
    const benefits = [
        {
            title: "Physical Health",
            desc: "Improve flexibility, strength, and balance while reducing chronic pain and enhancing overall physical wellness.",
            icon: HeartPulse,
            image: "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?q=80&w=800&auto=format&fit=crop"
        },
        {
            title: "Mental Clarity",
            desc: "Reduce stress, anxiety, and depression while improving focus, concentration, and emotional well-being.",
            icon: Brain,
            image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop"
        },
        {
            title: "Spiritual Growth",
            desc: "Connect with your inner self, develop mindfulness, and cultivate a deeper sense of purpose and peace.",
            icon: Leaf,
            image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=800&auto=format&fit=crop" // Forest/Nature
        }
    ]

    return (
        <section className="py-24 bg-background" id="about">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="text-center mb-20">
                    <span className="text-primary font-bold tracking-wider text-sm uppercase mb-2 block">Discover The Benefits</span>
                    <h2 className="text-4xl md:text-5xl font-display font-medium text-foreground">Why Yoga is Essential</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {benefits.map((item, index) => (
                        <div key={index} className="group flex flex-col items-center text-center bg-card p-8 rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                <item.icon size={32} strokeWidth={1.5} />
                            </div>

                            <div className="w-full h-48 rounded-2xl overflow-hidden mb-6 relative">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300" />
                            </div>

                            <h3 className="text-xl font-sans font-bold mb-4 text-foreground">{item.title}</h3>
                            <p className="text-muted leading-relaxed font-light text-sm md:text-base">
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
