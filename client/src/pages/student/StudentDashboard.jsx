import { useNavigate } from 'react-router-dom';
import { useGetMeQuery } from '../../features/auth/authApi';
import { BookOpen, Calendar, ArrowRight, PlayCircle, Clock } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function StudentDashboard() {
    const { data: userData, isLoading } = useGetMeQuery();
    const navigate = useNavigate();

    const user = userData?.data;
    const enrolledCourses = user?.enrolledCourses || [];
    const enrolledClasses = user?.enrolledClasses || [];

    // Combine recent activity logic (e.g., take the first item from either list)
    // For simplicity, let's just show one "Resume Learning" card if available
    const recentCourse = enrolledCourses.length > 0 ? enrolledCourses[0] : null;
    const upcomingClass = enrolledClasses.length > 0 ? enrolledClasses[0] : null;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <header className="mb-8">
                <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">My Learning Dashboard</h1>
                <p className="text-muted text-lg font-light">Welcome back, {user?.name}</p>
            </header>

            {/* Recent Activity Section */}
            <section>
                <h2 className="text-xl font-display font-bold text-foreground mb-4 flex items-center gap-2">
                    <Clock className="text-primary" size={20} />
                    Recent Activity
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Recent Course Card */}
                    {recentCourse ? (
                        <div className="bg-white p-6 rounded-lg border border-border-soft shadow-sm flex flex-col">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <BookOpen size={24} />
                                </div>
                                <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded-full">Course</span>
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-1">{recentCourse.title}</h3>
                            <p className="text-sm text-muted mb-4 line-clamp-2">Continue where you left off in your journey.</p>
                            <Button className="mt-auto w-full" onClick={() => navigate(`/courses/${recentCourse._id}`)}>
                                <PlayCircle className="mr-2" size={16} /> Resume Course
                            </Button>
                        </div>
                    ) : (
                        <div className="bg-slate-50 p-6 rounded-lg border border-dashed border-border-soft flex flex-col items-center justify-center text-center">
                            <p className="text-muted mb-4">No recent courses.</p>
                            <Button variant="outline" size="sm" onClick={() => navigate('/courses')}>Browse Courses</Button>
                        </div>
                    )}

                    {/* Upcoming Class Card */}
                    {upcomingClass ? (
                        <div className="bg-white p-6 rounded-lg border border-border-soft shadow-sm flex flex-col">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                    <Calendar size={24} />
                                </div>
                                <span className="text-xs font-medium bg-green-50 text-green-700 px-2 py-1 rounded-full">Class</span>
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-1">{upcomingClass.title}</h3>
                            <p className="text-sm text-muted mb-4">Your next scheduled session.</p>
                            <Button className="mt-auto w-full" variant="secondary" onClick={() => navigate(`/dashboard/my-classes`)}>
                                View Details
                            </Button>
                        </div>
                    ) : (
                        <div className="bg-slate-50 p-6 rounded-lg border border-dashed border-border-soft flex flex-col items-center justify-center text-center">
                            <p className="text-muted mb-4">No upcoming classes.</p>
                            <Button variant="outline" size="sm" onClick={() => navigate('/classes')}>Find a Class</Button>
                        </div>
                    )}
                </div>
            </section>

            {/* Browse Section */}
            <section className="mt-12">
                <h2 className="text-xl font-display font-bold text-foreground mb-4">Explore More</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div
                        onClick={() => navigate('/courses')}
                        className="group cursor-pointer bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/20 p-8 rounded-xl border border-primary/10 transition-all duration-300"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <BookOpen className="text-primary h-8 w-8" />
                            <ArrowRight className="text-primary opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">Browse Courses</h3>
                        <p className="text-muted-foreground text-sm">Discover comprehensive video courses to deepen your practice at your own pace.</p>
                    </div>

                    <div
                        onClick={() => navigate('/classes')}
                        className="group cursor-pointer bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 p-8 rounded-xl border border-orange-100 transition-all duration-300"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <Calendar className="text-orange-600 h-8 w-8" />
                            <ArrowRight className="text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">Find a Class</h3>
                        <p className="text-muted-foreground text-sm">Join live sessions with expert instructors and connect with the community.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default StudentDashboard;
