import { useParams, useNavigate } from 'react-router-dom';
import { useGetClassesQuery } from '../features/admin/class/classApi';
import { ArrowLeft, Clock, User, Award } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { VideoPlayer, VideoPlayerSkeleton } from '../components/video';

/**
 * Class Player Page - Dedicated page for watching individual class videos
 */
export function ClassPlayerPage({
    backLink = '/dashboard/my-classes',
    backText = 'Back to My Classes'
}) {
    const { classId } = useParams();
    const navigate = useNavigate();

    // Fetch all classes and find the current one
    const { data: classesData, isLoading, error } = useGetClassesQuery();
    const classes = classesData?.data || classesData || [];
    const classItem = classes.find(c => c._id === classId);

    if (isLoading) {
        return (
            <div className="flex flex-col h-screen bg-[#0f172a] text-white">
                {/* Header Skeleton */}
                <header className="flex items-center gap-4 px-6 py-4 bg-[#1e293b] border-b border-slate-700">
                    <div className="w-10 h-10 rounded-full bg-slate-700 animate-pulse" />
                    <div className="space-y-2">
                        <div className="w-48 h-5 bg-slate-700 rounded animate-pulse" />
                        <div className="w-32 h-3 bg-slate-700/50 rounded animate-pulse" />
                    </div>
                </header>
                <main className="flex-grow p-4 lg:p-8">
                    <div className="max-w-5xl mx-auto">
                        <VideoPlayerSkeleton />
                    </div>
                </main>
            </div>
        );
    }

    if (error || !classItem) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-[#0f172a] text-white p-6">
                <h2 className="text-2xl font-display font-bold mb-4">
                    {error ? 'Error loading class' : 'Class not found'}
                </h2>
                <p className="text-slate-400 mb-6">
                    {error?.message || "The class you're looking for doesn't exist or has been removed."}
                </p>
                <Button onClick={() => navigate(backLink)}>
                    {backText}
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-[#0f172a] text-white">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 bg-[#1e293b] border-b border-slate-700 shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(backLink)}
                        className="p-2 hover:bg-slate-700 rounded-full transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold font-display truncate max-w-md">{classItem.title}</h1>
                        <p className="text-xs text-slate-400 capitalize">
                            {classItem.level} • {classItem.duration} mins
                        </p>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-4">
                    {classItem.isPaid && (
                        <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-3 py-1 rounded-full">
                            Premium
                        </span>
                    )}
                    <span className="text-sm font-medium text-primary flex items-center gap-1.5">
                        <User size={14} />
                        {classItem.instructor}
                    </span>
                </div>
            </header>

            <div className="flex flex-col lg:flex-row flex-grow overflow-hidden">
                {/* Main Player Area */}
                <main className="flex-grow overflow-y-auto p-4 lg:p-8">
                    <div className="max-w-5xl mx-auto">
                        {/* Video Player */}
                        <div className="mb-8">
                            <VideoPlayer
                                src={classItem.video}
                                poster={classItem.image}
                                title={classItem.title}
                                autoPlay={false}
                            />
                        </div>

                        {/* Class Details */}
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
                                    {classItem.title}
                                </h2>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                                    <span className="flex items-center gap-1.5">
                                        <Clock size={16} />
                                        {classItem.duration} minutes
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <User size={16} />
                                        {classItem.instructor}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Award size={16} />
                                        {classItem.level}
                                    </span>
                                </div>
                            </div>

                            <div className="border-t border-slate-700 pt-6">
                                <h3 className="text-lg font-semibold mb-3">About This Class</h3>
                                <p className="text-slate-300 leading-relaxed max-w-3xl">
                                    {classItem.description || 'No description available for this class.'}
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => navigate(backLink)}
                                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                >
                                    <ArrowLeft size={16} className="mr-2" />
                                    {backText}
                                </Button>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Sidebar - Class Info */}
                <aside className="hidden lg:block w-[350px] bg-[#1e293b] border-l border-slate-700 p-6 space-y-6 overflow-y-auto">
                    {/* Instructor Card */}
                    <div className="bg-slate-800/50 rounded-xl p-5">
                        <h4 className="font-semibold text-sm text-slate-400 uppercase tracking-wider mb-3">
                            Instructor
                        </h4>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                                {classItem.instructor?.charAt(0) || 'I'}
                            </div>
                            <div>
                                <p className="font-medium">{classItem.instructor}</p>
                                <p className="text-sm text-slate-400">Yoga Instructor</p>
                            </div>
                        </div>
                    </div>

                    {/* Class Stats */}
                    <div className="bg-slate-800/50 rounded-xl p-5">
                        <h4 className="font-semibold text-sm text-slate-400 uppercase tracking-wider mb-3">
                            Class Details
                        </h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Duration</span>
                                <span className="font-medium">{classItem.duration} mins</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Level</span>
                                <span className="font-medium capitalize">{classItem.level}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Type</span>
                                <span className={`font-medium ${classItem.isPaid ? 'text-amber-400' : 'text-emerald-400'}`}>
                                    {classItem.isPaid ? 'Premium' : 'Free'}
                                </span>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}

export default ClassPlayerPage;
