import { useState, useEffect } from 'react'
import { Clock, Users, ArrowRight, User } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { cn } from '../lib/utils'
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useGetClassesQuery, useEnrollClassMutation } from '../features/admin/class/classApi';
import { useGetMeQuery } from '../features/auth/authApi';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';

export function ClassesPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeFilter, setActiveFilter] = useState("All Classes");
    const [currentPage, setCurrentPage] = useState(1);

    // Reset page when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [activeFilter]);

    const { data: classesData, isLoading, isFetching } = useGetClassesQuery({
        page: currentPage,
        limit: 12,
        level: activeFilter
    });

    const { data: userData, refetch: refetchUser } = useGetMeQuery();
    const [enrollClass] = useEnrollClassMutation();
    const navigate = useNavigate();

    const classes = classesData?.data || [];
    const totalPages = classesData?.pagination?.pages || Math.ceil((classesData?.total || 0) / 12);
    const enrolledClassIds = userData?.data?.enrolledClasses?.map(c => c._id) || [];
    const filters = ["All Classes", "Beginner", "Intermediate", "Advanced"];

    const handleAction = async (cls) => {
        // 1. Guest: Redirect to Login
        if (!userData) {
            toast.error("Please login to enroll");
            navigate('/login', { state: { from: '/classes' } });
            return;
        }

        const isEnrolled = enrolledClassIds.includes(cls._id);

        // 2. Enrolled User: Go to Player
        if (isEnrolled) {
            navigate(`/dashboard/my-classes/${cls._id}`); // Assuming this route exists or will exist
            return;
        }

        // 3. New User: Paid Class -> Checkout
        if (cls.isPaid) {
            navigate(`/checkout?type=class&id=${cls._id}`);
            return;
        }

        // 4. New User: Free Class -> Enroll
        const toastId = toast.loading("Booking class...");
        try {
            await enrollClass(cls._id).unwrap();
            await refetchUser(); // Refresh user data
            toast.success("Class booked successfully!", { id: toastId });
        } catch (err) {
            toast.error(err?.data?.message || "Booking failed", { id: toastId });
        }
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

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
                    {/* Minimal dark overlay for text contrast */}
                    <div className="absolute inset-0 bg-black/30" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto">
                    <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 drop-shadow-lg">Our Classes</h1>
                    <p className="text-white/95 text-lg md:text-xl font-medium max-w-2xl mx-auto drop-shadow-md">
                        Find the perfect class for your yoga journey
                    </p>
                </div>

                {/* Filters */}
                <div className="mt-12 flex flex-wrap justify-center gap-4 relative z-10">
                    {filters.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={cn(
                                "px-6 py-2 rounded-full transition-all duration-300 font-medium text-sm md:text-base backdrop-blur-sm shadow-sm border",
                                activeFilter === filter
                                    ? "bg-white text-primary border-white"
                                    : "bg-white/10 text-white border-white/30 hover:bg-white/20 hover:border-white"
                            )}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </section>

            {/* Classes Grid */}
            <section className="py-24 bg-background">
                <div className="container mx-auto px-6 max-w-7xl">
                    {isLoading || isFetching ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : classes.length === 0 ? (
                        <EmptyState
                            title="No classes found"
                            description={`We couldn't find any ${activeFilter.toLowerCase()} at the moment.`}
                            actionLabel="Clear Filters"
                            onAction={() => setActiveFilter("All Classes")}
                        />
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {classes.map((item) => {
                                    const isEnrolled = enrolledClassIds.includes(item._id);
                                    return (
                                        <div key={item._id} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-border-soft flex flex-col relative h-full">
                                            {/* Premium/Free Badge */}
                                            <div className="absolute top-4 left-4 z-10">
                                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold text-white uppercase tracking-wider ${item.isPaid ? 'bg-primary' : 'bg-emerald-500'}`}>
                                                    {item.isPaid ? 'Premium' : 'Free'}
                                                </span>
                                            </div>

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
                                                        {item.duration} min
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Users size={14} />
                                                        {item.level}
                                                    </div>
                                                </div>

                                                <h3 className="text-2xl font-display font-bold text-foreground mb-3">{item.title}</h3>
                                                <p className="text-muted leading-relaxed mb-6 font-light text-sm flex-grow line-clamp-3">
                                                    {item.description}
                                                </p>

                                                <div className="flex items-center justify-between mt-auto pt-6 border-t border-border-soft/60 mb-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                                                            <User size={16} className="text-gray-500" />
                                                        </div>
                                                        <span className="text-sm font-medium text-foreground">{item.instructor}</span>
                                                    </div>
                                                    <div className="text-lg font-bold text-primary">
                                                        {item.isPaid ? `€${item.price}` : 'Free'}
                                                    </div>
                                                </div>

                                                <Button
                                                    className={`w-full rounded-lg font-semibold py-6 ${isEnrolled ? 'bg-primary/90 hover:bg-primary' : ''}`}
                                                    variant={isEnrolled ? "default" : "default"}
                                                    onClick={() => handleAction(item)}
                                                >
                                                    {isEnrolled ? 'Go to Class' : item.isPaid ? 'Book Class' : 'Book Free Class'}
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pagination */}
                            <Pagination
                                currentPage={currentPage}
                                totalPages={classesData?.pagination?.pages || Math.ceil((classesData?.total || 0) / 12)}
                                onPageChange={handlePageChange}
                            />
                        </>
                    )}
                </div>
            </section>

            {/* CTA */}
            <div className="bg-section-alt py-16 text-center">
                <h2 className="text-3xl font-display font-bold text-foreground mb-4">Not sure where to start?</h2>
                <p className="text-muted mb-8 max-w-xl mx-auto">Book a free consultation with one of our instructors to find the perfect class for your goals.</p>
                <a href="tel:+15550000000">
                    <Button variant="outline" size="lg" className="rounded-full px-8">Talk to Us</Button>
                </a>
            </div>
        </div>
    )
}
