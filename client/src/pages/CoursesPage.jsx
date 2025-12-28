import { Check, User, Users, BookOpen, Heart, Calendar, Phone, Bot } from 'lucide-react'
import { Button } from '../components/ui/Button'
import beginnerCourseImg from '../assets/images/beginer_course.jpg'
import intermediateCourseImg from '../assets/images/intermediate_course.jpg'
import meditationCourseImg from '../assets/images/meditation_course.jpg'

export function CoursesPage() {
    const courses = [
        {
            id: 1,
            title: "Beginner Yoga Foundation",
            price: 120,
            duration: "4 Weeks",
            sessions: "8 Sessions",
            image: beginnerCourseImg, // Group studio shot
            desc: "Perfect for complete beginners. Learn fundamental poses, breathing techniques, and yoga philosophy in a supportive environment.",
            learn: [
                "Basic yoga poses and alignment",
                "Breathing techniques (Pranayama)",
                "Introduction to meditation",
                "Yoga philosophy basics",
                "Proper use of props",
                "Building a home practice"
            ]
        },
        {
            id: 2,
            title: "Intermediate Flow Series",
            price: 180,
            duration: "6 Weeks",
            sessions: "12 Sessions",
            image: intermediateCourseImg, // Challenging pose 
            desc: "Advance your practice with more challenging poses, longer sequences, and deeper understanding of yoga principles.",
            learn: [
                "Advanced pose variations",
                "Longer flowing sequences",
                "Arm balances and inversions",
                "Advanced breathing techniques",
                "Deeper meditation practices",
                "Injury prevention and modification"
            ]
        },
        {
            id: 3,
            title: "Mindfulness & Meditation",
            price: 90,
            duration: "3 Weeks",
            sessions: "6 Sessions",
            image: meditationCourseImg, // Meditation/Calm
            desc: "Focus on the mental and spiritual aspects of yoga. Develop mindfulness, reduce stress, and cultivate inner peace.",
            learn: [
                "Various meditation techniques",
                "Mindfulness in daily life",
                "Stress reduction strategies",
                "Breathing for relaxation",
                "Creating a meditation routine",
                "Spiritual aspects of yoga"
            ]
        }
    ]

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
                    <div className="absolute inset-0 bg-primary/90" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto text-white">
                    <span className="text-white/80 text-sm md:text-base font-medium uppercase tracking-widest mb-4 block">Home / Courses</span>
                    <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">Yoga Courses</h1>
                    <p className="text-white/90 text-lg md:text-xl font-light max-w-2xl mx-auto">
                        Structured learning programs designed to deepen your practice and understanding of yoga
                    </p>
                </div>
            </section>

            {/* Courses Grid */}
            <section className="py-24 bg-background">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {courses.map((course) => (
                            <div key={course.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-border-soft flex flex-col h-full">
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
                                    </div>

                                    <p className="text-muted leading-relaxed mb-6 font-light text-sm">
                                        {course.desc}
                                    </p>

                                    <div className="mb-8 flex-grow">
                                        <h4 className="font-bold text-foreground mb-4 text-sm uppercase tracking-wide">What You'll Learn:</h4>
                                        <ul className="space-y-3">
                                            {course.learn.map((item, idx) => (
                                                <li key={idx} className="flex items-start gap-2.5 text-sm font-light text-muted">
                                                    <Check size={16} className="text-primary mt-0.5 min-w-[16px]" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="mt-auto pt-6 border-t border-border-soft/60">
                                        <div className="flex items-end justify-between mb-4">
                                            <span className="text-3xl font-bold text-primary">{course.price}€</span>
                                            <span className="text-sm text-muted mb-1">per course</span>
                                        </div>
                                        <Button className="w-full rounded-lg font-semibold py-6" variant="default">
                                            Enroll Now
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
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

            {/* Floating Chat Button (Consistent across pages) */}
            <div className="fixed bottom-6 right-6 z-50">
                <button className="flex items-center gap-2 bg-[#3d4f5f] text-white pl-4 pr-5 py-3 rounded-full shadow-lg hover:shadow-xl hover:bg-[#4a5f6f] hover:-translate-y-0.5 transition-all duration-300 border-0 cursor-pointer">
                    <Bot size={18} />
                    <span className="text-sm font-medium">Talk with Us</span>
                </button>
            </div>
        </div>
    )
}
