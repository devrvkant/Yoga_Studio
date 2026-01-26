import { useState } from 'react';
import { Check, User, Users, BookOpen, Heart, Calendar, Phone, Bot, Signal } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { cn } from '../lib/utils'
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useGetCoursesQuery, useEnrollCourseMutation } from '../features/admin/course/courseApi';
import { useGetMeQuery } from '../features/auth/authApi';
import EmptyState from '../components/common/EmptyState';
import beginnerCourseImg from '../assets/images/beginer_course.jpg'
import intermediateCourseImg from '../assets/images/intermediate_course.jpg'
import meditationCourseImg from '../assets/images/meditation_course.jpg'

export function CoursesPage() {
    const [activeFilter, setActiveFilter] = useState("All Courses")
    const { data: coursesData, isLoading } = useGetCoursesQuery();
    const { data: userData, refetch: refetchUser } = useGetMeQuery();
    const [enrollCourse] = useEnrollCourseMutation();
    const navigate = useNavigate();

    const courses = coursesData?.data || [];
    const enrolledCourseIds = userData?.data?.enrolledCourses?.map(c => c._id) || [];
    const filters = ["All Courses", "Beginner", "Intermediate", "Advanced"];

    const handleEnroll = async (course) => {
        if (!userData) {
            toast.error("Please login to enroll");
            navigate('/login');
            return;
        }

        if (enrolledCourseIds.includes(course._id)) {
            toast.info("You are already enrolled in this course");
            return;
        }

        if (course.isPaid) {
            // Redirect to checkout page for paid courses
            navigate(`/checkout?type=course&id=${course._id}`);
            return;
        }

        const toastId = toast.loading("Enrolling...");
        try {
            await enrollCourse(course._id).unwrap();
            await refetchUser(); // Refresh user data to update UI
            toast.success("Enrolled successfully!", { id: toastId });
        } catch (err) {
            toast.error(err?.data?.message || "Enrollment failed", { id: toastId });
        }
    };

    const filteredCourses = activeFilter === "All Courses"
        ? courses
        : courses.filter(c => c.level === activeFilter)

    const features = [
        {
            icon: User,
            title: "Expert Instruction",
            desc: "Learn from certified instructor Sarah Chen with years of experience"
        },
        {
            icon: Users,
            title: "Small Groups",
            desc: "Limited class sizes ensure personalized attention and guidance"
        },
        {
            icon: BookOpen,
            title: "Comprehensive Curriculum",
            desc: "Structured learning path from basics to advanced techniques"
        },
        {
            icon: Heart,
            title: "Supportive Community",
            desc: "Connect with like-minded practitioners on the same journey"
        }
    ]

    return (
        <div className="w-full bg-background min-h-screen">
            {/* Hero Section */}
            <section className="relative w-full h-[60vh] min-h-[500px] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?q=80&w=2000&auto=format&fit=crop"
                        alt="Yoga Courses"
                        className="w-full h-full object-cover"
                    />
                    {/* Minimal dark overlay for text contrast */}
                    <div className="absolute inset-0 bg-black/30" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto text-white">
                    <span className="text-white/90 text-sm md:text-base font-medium uppercase tracking-widest mb-4 block drop-shadow-md">Home / Courses</span>
                    <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 drop-shadow-lg">Yoga Courses</h1>
                    <p className="text-white/95 text-lg md:text-xl font-medium max-w-2xl mx-auto drop-shadow-md">
                        Structured learning programs designed to deepen your practice and understanding of yoga
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
                                    ? 'bg-white text-primary border-white'
                                    : 'bg-white/10 text-white border-white/30 hover:bg-white/20 hover:border-white'
                            )}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </section>

            {/* Courses Grid */}
            <section className="py-24 bg-background">
                <div className="container mx-auto px-6 max-w-7xl">
                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : filteredCourses.length === 0 ? (
                        <EmptyState
                            title="No courses found"
                            description={`We couldn't find any ${activeFilter.toLowerCase()} at the moment.`}
                            actionLabel="Clear Filters"
                            onAction={() => setActiveFilter("All Courses")}
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredCourses.map((course) => {
                                const isEnrolled = enrolledCourseIds.includes(course._id);
                                return (
                                    <div key={course._id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-border-soft flex flex-col h-full relative group">
                                        {/* Premium/Free Badge */}
                                        <div className="absolute top-4 right-4 z-10">
                                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold text-white uppercase tracking-wider ${course.isPaid ? 'bg-primary' : 'bg-emerald-500'}`}>
                                                {course.isPaid ? 'Premium' : 'Free'}
                                            </span>
                                        </div>

                                        <div className="relative h-56 overflow-hidden">
                                            <img
                                                src={course.image}
                                                alt={course.title}
                                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                                            />
                                        </div>
                                        <div className="p-8 flex flex-col flex-grow">
                                            <h3 className="text-2xl font-display font-bold text-foreground mb-4">{course.title}</h3>

                                            <div className="flex items-center gap-6 text-sm font-medium text-muted mb-6">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar size={16} />
                                                    {course.duration}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Users size={16} />
                                                    {course.sessions}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Signal size={16} />
                                                    {course.level || 'All Levels'}
                                                </div>
                                            </div>

                                            <p className="text-muted leading-relaxed mb-6 font-light text-sm line-clamp-3">
                                                {course.description}
                                            </p>

                                            <div className="mb-8 flex-grow">
                                                <h4 className="font-bold text-foreground mb-4 text-sm uppercase tracking-wide">What You'll Learn:</h4>
                                                <ul className="space-y-3">
                                                    {course.learnPoints && course.learnPoints.slice(0, 4).map((item, idx) => (
                                                        <li key={idx} className="flex items-start gap-2.5 text-sm font-light text-muted">
                                                            <Check size={16} className="text-primary mt-0.5 min-w-[16px]" />
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="mt-auto pt-6 border-t border-border-soft/60">
                                                <div className="flex items-end justify-between mb-4">
                                                    <span className="text-3xl font-bold text-primary">
                                                        {course.isPaid ? `€${course.price}` : 'Free'}
                                                    </span>
                                                    {course.isPaid && <span className="text-sm text-muted mb-1">per course</span>}
                                                </div>
                                                <Button
                                                    className={`w-full rounded-lg font-semibold py-6 ${isEnrolled ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : ''}`}
                                                    variant={isEnrolled ? "outline" : "default"}
                                                    onClick={() => isEnrolled ? navigate(`/courses/${course._id}`) : handleEnroll(course)}
                                                >
                                                    {isEnrolled ? 'Go to Course' : course.isPaid ? 'Enroll Now' : 'Enroll for Free'}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground">Why Choose Our Courses?</h2>
                        <p className="text-muted mt-4 text-lg font-light">Structured learning with personalized attention and comprehensive curriculum</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                        {features.map((feature, idx) => (
                            <div key={idx} className="flex flex-col items-center text-center">
                                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                                    <feature.icon size={32} strokeWidth={1.5} />
                                </div>
                                <h3 className="text-lg font-bold text-foreground mb-3">{feature.title}</h3>
                                <p className="text-muted text-sm leading-relaxed font-light">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-primary text-white text-center px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Ready to Deepen Your Practice?</h2>
                    <p className="text-white/90 text-lg md:text-xl font-light mb-10 max-w-2xl mx-auto">
                        Join our structured courses and transform your yoga journey. Contact us for more information or guidance on which course is right for you.
                    </p>
                    <Button variant="outline" size="lg" className="rounded-full px-8 bg-white text-primary border-white hover:bg-white/90 hover:text-primary">
                        <Phone size={18} className="mr-2" />
                        Contact Us for More Info
                    </Button>
                </div>
            </section>


        </div>
    )
}
