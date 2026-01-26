import { ArrowRight } from 'lucide-react'
import { Button } from '../ui/Button'
import { Link } from 'react-router-dom'
import { useGetClassesQuery } from '../../features/admin/class/classApi'

export function Classes() {
    const { data: classesData, isLoading } = useGetClassesQuery()
    // Assuming backend returns { success: true, count: 0, data: [] }
    // We'll take the first 3 classes for now. 
    // Ideally we might want a specific "popular" endpoint or sort by something.
    const classes = classesData?.data?.slice(0, 3) || []

    return (
        <section className="py-24 bg-section-alt" id="classes">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="text-center mb-16">
                    <span className="text-primary font-bold tracking-wider text-sm uppercase mb-2 block">Popular Classes</span>
                    <h2 className="text-4xl md:text-5xl font-display font-medium text-foreground">Start Your Practice</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {isLoading ? (
                        /* Simple loading state */
                        [1, 2, 3].map((n) => (
                            <div key={n} className="bg-white rounded-[1.5rem] overflow-hidden shadow-sm h-[400px] animate-pulse">
                                <div className="h-60 bg-gray-200"></div>
                                <div className="p-8 space-y-4">
                                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                </div>
                            </div>
                        ))
                    ) : classes.length > 0 ? (
                        classes.map((item, index) => (
                            <div key={item._id || index} className="group bg-white rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-border-soft flex flex-col">
                                <div className="relative h-60 overflow-hidden">
                                    <img
                                        src={item.image || "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=800&auto=format&fit=crop"}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                </div>
                                <div className="p-8 flex flex-col flex-grow items-start text-left">
                                    <h3 className="text-xl font-sans font-bold mb-3 text-foreground">{item.title}</h3>
                                    <p className="text-muted mb-6 flex-grow leading-relaxed text-sm line-clamp-3">
                                        {item.description || item.desc}
                                    </p>
                                    <Link to={`/classes`} className="w-full">
                                        <Button className="w-full rounded-md font-semibold" variant="default">Book Now</Button>
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-3 text-center text-muted">No classes available at the moment.</div>
                    )}
                </div>

                <div className="text-center">
                    <Link to="/classes" className="inline-flex items-center text-primary font-semibold hover:text-primary/80 transition-all hover:translate-x-1">
                        View All Classes <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    )
}
