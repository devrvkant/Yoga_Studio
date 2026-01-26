import { useNavigate } from 'react-router-dom';
import { useGetMeQuery } from '../../features/auth/authApi';
import { BookOpen, Calendar, User, Users, Signal, Check, PlayCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function MyCourses() {
    const { data: userData, isLoading } = useGetMeQuery();
    const navigate = useNavigate();

    const user = userData?.data;
    const enrolledCourses = user?.enrolledCourses || [];

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-display font-bold text-foreground mb-2">My Courses</h1>
                <p className="text-muted">Continue your learning journey.</p>
            </header>

            {enrolledCourses.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center border border-border-soft shadow-sm">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="text-primary" size={32} />
                    </div>
                    <h3 className="text-xl font-medium text-foreground mb-2">You haven't enrolled in any courses yet</h3>
                    <p className="text-muted mb-6 max-w-md mx-auto">Start a structured program to deepen your practice. We have courses for all levels.</p>
                    <Button onClick={() => navigate('/courses')}>Explore Courses</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {enrolledCourses.map((course) => (
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
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <Button variant="secondary" className="gap-2 rounded-full px-6" onClick={() => navigate(`/dashboard/my-courses/${course._id}`)}>
                                        <PlayCircle size={18} /> Resume
                                    </Button>
                                </div>
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
                                        {course.learnPoints && course.learnPoints.slice(0, 3).map((item, idx) => (
                                            <li key={idx} className="flex items-start gap-2.5 text-sm font-light text-muted">
                                                <Check size={16} className="text-primary mt-0.5 min-w-[16px]" />
                                                <span className="line-clamp-2">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="mt-auto pt-6 border-t border-border-soft/60">
                                    <Button
                                        className="w-full rounded-lg font-semibold py-6"
                                        onClick={() => navigate(`/dashboard/my-courses/${course._id}`)}
                                    >
                                        Continue Learning
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyCourses;
