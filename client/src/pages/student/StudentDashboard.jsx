import { useNavigate } from 'react-router-dom';
import { useGetMeQuery } from '../../features/auth/authApi';
import { BookOpen, Calendar, Clock, User, PlayCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function StudentDashboard() {
    const { data: userData, isLoading } = useGetMeQuery();
    const navigate = useNavigate();

    const user = userData?.data;
    const enrolledCourses = user?.enrolledCourses || [];
    const enrolledClasses = user?.enrolledClasses || [];

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="w-full bg-background min-h-screen py-12 px-6">
            <div className="container mx-auto max-w-7xl">
                <header className="mb-12">
                    <h1 className="text-4xl font-display font-bold text-foreground mb-2">My Learning Dashboard</h1>
                    <p className="text-muted text-lg font-light">Welcome back, {user?.name}</p>
                </header>

                {/* Enrolled Courses Section */}
                <section className="mb-16">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
                            <BookOpen className="text-primary" size={24} />
                            My Courses
                        </h2>
                        {enrolledCourses.length > 0 && (
                            <Button variant="ghost" onClick={() => navigate('/courses')} className="text-primary hover:text-primary-dark">
                                Browse More
                            </Button>
                        )}
                    </div>

                    {enrolledCourses.length === 0 ? (
                        <div className="bg-white rounded-xl p-8 text-center border border-border-soft shadow-sm">
                            <h3 className="text-lg font-medium text-foreground mb-2">You haven't enrolled in any courses yet</h3>
                            <p className="text-muted mb-6">Start your structured learning journey today.</p>
                            <Button onClick={() => navigate('/courses')}>Explore Courses</Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {enrolledCourses.map((course) => (
                                <div key={course._id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-border-soft flex flex-col">
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={course.image}
                                            alt={course.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                            <Button variant="secondary" className="gap-2" onClick={() => navigate(`/courses/${course._id}`)}>
                                                <PlayCircle size={16} /> Resume
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="p-6 flex flex-col flex-grow">
                                        <h3 className="text-xl font-display font-bold text-foreground mb-2">{course.title}</h3>
                                        <div className="flex items-center gap-4 text-xs font-medium text-muted mb-4">
                                            <div className="flex items-center gap-1">
                                                <Calendar size={14} /> {course.duration}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <User size={14} /> {course.instructor || 'Instructor'}
                                            </div>
                                        </div>
                                        <Button className="w-full mt-auto" variant="outline" onClick={() => navigate(`/courses/${course._id}`)}>
                                            View Course
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Enrolled Classes Section */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
                            <Calendar className="text-primary" size={24} />
                            My Scheduled Classes
                        </h2>
                        {enrolledClasses.length > 0 && (
                            <Button variant="ghost" onClick={() => navigate('/classes')} className="text-primary hover:text-primary-dark">
                                Browse More
                            </Button>
                        )}
                    </div>

                    {enrolledClasses.length === 0 ? (
                        <div className="bg-white rounded-xl p-8 text-center border border-border-soft shadow-sm">
                            <h3 className="text-lg font-medium text-foreground mb-2">No upcoming classes booked</h3>
                            <p className="text-muted mb-6">Join a session to keep up with your practice.</p>
                            <Button onClick={() => navigate('/classes')}>Find a Class</Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {enrolledClasses.map((cls) => (
                                <div key={cls._id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-border-soft flex flex-col">
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={cls.image}
                                            alt={cls.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="p-6 flex flex-col flex-grow">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-display font-bold text-foreground">{cls.title}</h3>
                                            <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full uppercase">
                                                {cls.level}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-4 text-xs font-medium text-muted mb-4">
                                            <div className="flex items-center gap-1">
                                                <Clock size={14} /> {cls.duration}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <User size={14} /> {cls.instructor || 'Instructor'}
                                            </div>
                                        </div>

                                        <Button className="w-full mt-auto" onClick={() => navigate('/classes')}>
                                            View Details
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

export default StudentDashboard;
