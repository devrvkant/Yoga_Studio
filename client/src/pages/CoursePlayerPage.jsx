import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetCourseQuery } from '../features/admin/course/courseApi';
import { useGetSessionsByCourseQuery } from '../features/admin/session/sessionApi';
import { ChevronLeft, Play, Clock, CheckCircle2, Lock, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function CoursePlayerPage() {
    const { courseId } = useParams();
    const navigate = useNavigate();

    // Fetch course and sessions
    const { data: courseData, isLoading: isCourseLoading } = useGetCourseQuery(courseId);
    const { data: sessionsData, isLoading: isSessionsLoading } = useGetSessionsByCourseQuery(courseId);

    const course = courseData?.data;
    const sessions = sessionsData?.data || [];

    const [currentSession, setCurrentSession] = useState(null);

    // Set first session as default when data loads
    useEffect(() => {
        if (sessions.length > 0 && !currentSession) {
            setCurrentSession(sessions[0]);
        }
    }, [sessions, currentSession]);

    if (isCourseLoading || isSessionsLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-background p-6">
                <h2 className="text-2xl font-bold mb-4">Course not found</h2>
                <Button onClick={() => navigate('/courses')}>Back to Courses</Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-[#0f172a] text-white">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 bg-[#1e293b] border-b border-slate-700 shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-2 hover:bg-slate-700 rounded-full transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold font-display truncate max-w-md">{course.title}</h1>
                        <p className="text-xs text-slate-400 capitalize">{course.level} • {sessions.length} Sessions</p>
                    </div>
                </div>
                <div className="hidden md:block">
                    <span className="text-sm font-medium text-primary">Instructor: {course.instructor}</span>
                </div>
            </header>

            <div className="flex flex-col lg:flex-row flex-grow overflow-hidden">
                {/* Main Player Area */}
                <main className="flex-grow overflow-y-auto p-4 lg:p-8">
                    <div className="max-w-5xl mx-auto">
                        {/* Video Player Container */}
                        <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl relative mb-8 group">
                            {currentSession?.video ? (
                                <video
                                    key={currentSession._id}
                                    src={currentSession.video}
                                    controls
                                    className="w-full h-full"
                                    poster={currentSession.thumbnail || course.image}
                                    autoPlay
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                                    <Play size={64} className="mb-4 opacity-20" />
                                    <p>Select a session to start learning</p>
                                </div>
                            )}
                        </div>

                        {/* Session Details */}
                        <div className="space-y-4">
                            <h2 className="text-2xl md:text-3xl font-display font-bold">
                                {currentSession?.title || 'Welcome to the Course'}
                            </h2>
                            <div className="flex items-center gap-4 text-sm text-slate-400">
                                <span className="flex items-center gap-1.5">
                                    <Clock size={16} /> {currentSession?.duration || '0 min'}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <CheckCircle2 size={16} className="text-emerald-500" /> Session {currentSession?.order || 1}
                                </span>
                            </div>
                            <p className="text-slate-300 leading-relaxed max-w-4xl">
                                {currentSession?.description || course.description}
                            </p>
                        </div>
                    </div>
                </main>

                {/* Sidebar - Sessions List */}
                <aside className="w-full lg:w-[400px] bg-[#1e293b] border-t lg:border-t-0 lg:border-l border-slate-700 flex flex-col shrink-0">
                    <div className="p-6 border-b border-slate-700">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            Course Content
                        </h3>
                    </div>
                    <div className="flex-grow overflow-y-auto custom-scrollbar">
                        {sessions.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 italic">
                                No sessions added to this course yet.
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-800">
                                {sessions.map((session, idx) => {
                                    const isActive = currentSession?._id === session._id;
                                    return (
                                        <button
                                            key={session._id}
                                            onClick={() => setCurrentSession(session)}
                                            className={`w-full flex items-start gap-4 p-5 transition-all text-left hover:bg-slate-800/50 ${isActive ? 'bg-primary/10 border-l-4 border-primary' : ''
                                                }`}
                                        >
                                            <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isActive ? 'bg-primary text-primary-foreground' : 'bg-slate-800 text-slate-400'
                                                }`}>
                                                {session.order || idx + 1}
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <h4 className={`text-sm font-bold mb-1 truncate ${isActive ? 'text-primary' : 'text-slate-200'}`}>
                                                    {session.title}
                                                </h4>
                                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={12} /> {session.duration}
                                                    </span>
                                                    {session.video ? (
                                                        <span className="flex items-center gap-1 text-emerald-500/80">
                                                            <Play size={10} /> Video
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-slate-600">
                                                            <Lock size={10} /> No Content
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
}

export default CoursePlayerPage;
