import { useNavigate } from 'react-router-dom';
import { useGetMeQuery } from '../../features/auth/authApi';
import { Clock, User, Calendar, Users, PlayCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function MyClasses() {
    const { data: userData, isLoading } = useGetMeQuery();
    const navigate = useNavigate();

    const user = userData?.data;
    const enrolledClasses = user?.enrolledClasses || [];

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
                <h1 className="text-3xl font-display font-bold text-foreground mb-2">My Booked Classes</h1>
                <p className="text-muted">Manage your upcoming yoga sessions.</p>
            </header>

            {enrolledClasses.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center border border-border-soft shadow-sm">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="text-primary" size={32} />
                    </div>
                    <h3 className="text-xl font-medium text-foreground mb-2">No upcoming classes booked</h3>
                    <p className="text-muted mb-6 max-w-md mx-auto">You haven't booked any classes yet. Browse our schedule to find a session that fits your time.</p>
                    <Button onClick={() => navigate('/classes')}>Find a Class</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {enrolledClasses.map((cls) => (
                        <div key={cls._id} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-border-soft flex flex-col relative h-full">
                            {/* Premium/Free Badge */}
                            <div className="absolute top-4 left-4 z-10">
                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold text-white uppercase tracking-wider ${cls.isPaid ? 'bg-primary' : 'bg-emerald-500'}`}>
                                    {cls.isPaid ? 'Premium' : 'Free'}
                                </span>
                            </div>

                            {/* Level Badge */}
                            <div className="absolute top-4 right-4 z-10">
                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold text-white uppercase tracking-wider ${cls.level === "Beginner" ? "bg-emerald-500" :
                                    cls.level === "Intermediate" ? "bg-teal-600" :
                                        cls.level === "Advanced" ? "bg-slate-800" :
                                            "bg-emerald-600" // Default/All Levels
                                    }`}>
                                    {cls.level}
                                </span>
                            </div>

                            <div className="relative h-64 overflow-hidden">
                                <img
                                    src={cls.image}
                                    alt={cls.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <Button variant="secondary" className="gap-2 rounded-full px-6" onClick={() => navigate(`/dashboard/my-classes/${cls._id}`)}>
                                        <PlayCircle size={18} /> Join Session
                                    </Button>
                                </div>
                            </div>

                            <div className="p-8 flex flex-col flex-grow">
                                <div className="flex items-center gap-4 text-xs font-medium text-muted mb-4 uppercase tracking-wide">
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={14} />
                                        {cls.duration}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Users size={14} />
                                        {cls.level}
                                    </div>
                                </div>

                                <h3 className="text-2xl font-display font-bold text-foreground mb-3">{cls.title}</h3>
                                <p className="text-muted leading-relaxed mb-6 font-light text-sm flex-grow line-clamp-3">
                                    {cls.description}
                                </p>

                                <div className="flex items-center justify-between mt-auto pt-6 border-t border-border-soft/60 mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                                            <User size={16} className="text-gray-500" />
                                        </div>
                                        <span className="text-sm font-medium text-foreground">{cls.instructor}</span>
                                    </div>
                                </div>

                                <Button
                                    className="w-full rounded-lg font-semibold py-6"
                                    onClick={() => navigate(`/dashboard/my-classes/${cls._id}`)}
                                >
                                    Go to Class
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyClasses;
