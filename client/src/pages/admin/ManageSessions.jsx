import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    useGetSessionsByCourseQuery,
    useAddSessionMutation,
    useUpdateSessionMutation,
    useDeleteSessionMutation,
    useReorderSessionsMutation
} from '../../features/admin/session/sessionApi';
import { useGetCoursesQuery } from '../../features/admin/course/courseApi';
import { Loader2, Plus, Pencil, Trash2, X, Check, Search, ArrowLeft, GripVertical, Play } from 'lucide-react';
import { toast } from 'sonner';
import FileUpload from '../../components/common/FileUpload';
import { UploadOverlay, PendingUploadsPanel } from '../../components/upload';
import { VideoPreviewModal } from '../../components/video';
import {
    createUploadSession,
    startUpload,
    pauseUpload,
    cancelUpload,
    reattachFile,
    getPendingUploads,
    getSessionState,
    UploadStatus,
    shouldUseChunkedUpload
} from '../../services/upload';
import { uploadToCloudinary } from '../../utils/uploadMedia';

const ManageSessions = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();

    const { data: sessionsData, isLoading, error } = useGetSessionsByCourseQuery(courseId);
    const { data: coursesData } = useGetCoursesQuery();
    const [addSession] = useAddSessionMutation();
    const [updateSession] = useUpdateSessionMutation();
    const [deleteSession] = useDeleteSessionMutation();
    const [reorderSessions] = useReorderSessionsMutation();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSession, setEditingSession] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        duration: '',
        video: '',
        thumbnail: '',
    });

    // Active uploads being tracked
    const [activeUploads, setActiveUploads] = useState([]);
    // Pending uploads from previous session
    const [pendingUploads, setPendingUploads] = useState([]);
    // Video preview state
    const [previewSession, setPreviewSession] = useState(null);

    // Get current course info
    const courses = coursesData?.data || coursesData || [];
    const currentCourse = courses.find(c => c._id === courseId);

    // Check for pending uploads on mount
    useEffect(() => {
        const pending = getPendingUploads().filter(p => p.metadata?.courseId === courseId);
        if (pending.length > 0) {
            setPendingUploads(pending);
        }
    }, [courseId]);

    // Prevent close/reload while uploading
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (activeUploads.some(u => u.status === UploadStatus.UPLOADING)) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [activeUploads]);

    const sessions = sessionsData?.data || [];

    const filteredSessions = sessions.filter(session =>
        session.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = (session = null) => {
        if (session) {
            setEditingSession(session);
            setFormData({
                title: session.title,
                description: session.description || '',
                duration: session.duration || '',
                video: session.video || '',
                thumbnail: session.thumbnail || '',
            });
        } else {
            setEditingSession(null);
            setFormData({
                title: '',
                description: '',
                duration: '',
                video: '',
                thumbnail: '',
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSession(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Update active upload state
    const updateUploadState = (sessionId, updates) => {
        setActiveUploads(prev => prev.map(u =>
            u.sessionId === sessionId ? { ...u, ...updates } : u
        ));
    };

    // Remove from active uploads
    const removeActiveUpload = (sessionId) => {
        setActiveUploads(prev => prev.filter(u => u.sessionId !== sessionId));
    };

    // Handle upload with chunked support for large files
    const handleBackgroundSubmit = async (currentData, isEdit, editId) => {
        const hasLargeVideo = currentData.video instanceof File && shouldUseChunkedUpload(currentData.video);

        if (hasLargeVideo) {
            await handleChunkedUpload(currentData, isEdit, editId);
        } else {
            await handleDirectUpload(currentData, isEdit, editId);
        }
    };

    // Chunked upload with pause/resume/cancel
    const handleChunkedUpload = async (currentData, isEdit, editId) => {
        const file = currentData.video;
        const uploadSessionId = createUploadSession(file, 'video', {
            sessionData: currentData,
            courseId,
            isEdit,
            editId
        });

        // Add to active uploads
        const uploadEntry = {
            sessionId: uploadSessionId,
            fileName: file.name,
            fileSize: file.size,
            progress: 0,
            status: UploadStatus.PENDING,
            statusText: 'Starting...',
            sessionData: currentData
        };
        setActiveUploads(prev => [...prev, uploadEntry]);

        // Upload thumbnail first if exists
        let thumbnailUrl = currentData.thumbnail;
        if (currentData.thumbnail instanceof File) {
            try {
                thumbnailUrl = await uploadToCloudinary(currentData.thumbnail, 'image');
            } catch (err) {
                toast.error('Failed to upload thumbnail');
                removeActiveUpload(uploadSessionId);
                return;
            }
        }

        // Start chunked video upload
        startUpload(uploadSessionId, {
            onProgress: (progress, statusText) => {
                updateUploadState(uploadSessionId, { progress, statusText, status: UploadStatus.UPLOADING });
            },
            onComplete: async (videoUrl) => {
                updateUploadState(uploadSessionId, {
                    progress: 100,
                    statusText: 'Saving to database...',
                    status: UploadStatus.UPLOADING
                });

                const finalData = {
                    ...currentData,
                    thumbnail: thumbnailUrl,
                    video: videoUrl
                };

                try {
                    if (isEdit) {
                        await updateSession({ courseId, sessionId: editId, ...finalData }).unwrap();
                        toast.success(`Session "${currentData.title}" updated!`);
                    } else {
                        await addSession({ courseId, ...finalData }).unwrap();
                        toast.success(`Session "${currentData.title}" created!`);
                    }
                    removeActiveUpload(uploadSessionId);
                } catch (err) {
                    updateUploadState(uploadSessionId, {
                        status: UploadStatus.ERROR,
                        error: 'Failed to save to database'
                    });
                }
            },
            onError: (error) => {
                updateUploadState(uploadSessionId, {
                    status: UploadStatus.ERROR,
                    error: error.message
                });
            }
        });
    };

    // Direct upload for small files
    const handleDirectUpload = async (currentData, isEdit, editId) => {
        const tempId = Date.now().toString();

        if (!isEdit) {
            setActiveUploads(prev => [...prev, {
                sessionId: tempId,
                fileName: currentData.title,
                fileSize: 0,
                progress: 0,
                status: UploadStatus.UPLOADING,
                statusText: 'Uploading...',
                sessionData: currentData
            }]);
        }

        const toastId = toast.loading(`${isEdit ? 'Updating' : 'Creating'} "${currentData.title}"...`, {
            description: "Don't close this tab until uploading finished!"
        });

        try {
            let thumbnailUrl = currentData.thumbnail;
            let videoUrl = currentData.video;

            const updateProgress = (percent) => {
                setActiveUploads(prev => prev.map(item =>
                    item.sessionId === tempId ? { ...item, progress: percent } : item
                ));
            };

            if (currentData.thumbnail instanceof File) {
                const maxThumbnailProgress = (currentData.video instanceof File) ? 10 : 100;
                thumbnailUrl = await uploadToCloudinary(currentData.thumbnail, 'image', (p) => {
                    updateProgress(Math.round((p * maxThumbnailProgress) / 100));
                });
            } else if (currentData.video instanceof File) {
                updateProgress(10);
            }

            if (currentData.video instanceof File) {
                videoUrl = await uploadToCloudinary(currentData.video, 'video', (p) => {
                    updateProgress(10 + Math.round((p * 90) / 100));
                });
            } else if (currentData.thumbnail instanceof File) {
                updateProgress(100);
            }

            const finalData = { ...currentData, thumbnail: thumbnailUrl, video: videoUrl };

            if (isEdit) {
                await updateSession({ courseId, sessionId: editId, ...finalData }).unwrap();
                toast.success(`Session "${currentData.title}" updated!`, { id: toastId });
            } else {
                await addSession({ courseId, ...finalData }).unwrap();
                toast.success(`Session "${currentData.title}" created!`, { id: toastId });
            }

            setActiveUploads(prev => prev.filter(item => item.sessionId !== tempId));

        } catch (err) {
            console.error('Upload failed:', err);
            setActiveUploads(prev => prev.filter(item => item.sessionId !== tempId));
            toast.error(`Failed to save "${currentData.title}". Click to retry.`, {
                id: toastId,
                duration: 10000,
                action: {
                    label: 'Retry',
                    onClick: () => handleOpenModal(isEdit ? { _id: editId, ...currentData } : currentData)
                }
            });
        }
    };

    // Upload control handlers
    const handlePauseUpload = (sessionId) => {
        pauseUpload(sessionId);
        updateUploadState(sessionId, { status: UploadStatus.PAUSED, statusText: 'Paused' });
    };

    const handleResumeUpload = (sessionId) => {
        const upload = activeUploads.find(u => u.sessionId === sessionId);
        if (!upload) return;

        startUpload(sessionId, {
            onProgress: (progress, statusText) => {
                updateUploadState(sessionId, { progress, statusText, status: UploadStatus.UPLOADING });
            },
            onComplete: async (videoUrl) => {
                const { sessionData, isEdit, editId } = upload;
                const finalData = { ...sessionData, video: videoUrl };

                try {
                    if (isEdit) {
                        await updateSession({ courseId, sessionId: editId, ...finalData }).unwrap();
                        toast.success(`Session "${sessionData.title}" updated!`);
                    } else {
                        await addSession({ courseId, ...finalData }).unwrap();
                        toast.success(`Session "${sessionData.title}" created!`);
                    }
                    removeActiveUpload(sessionId);
                } catch (err) {
                    updateUploadState(sessionId, { status: UploadStatus.ERROR, error: 'Database save failed' });
                }
            },
            onError: (error) => {
                updateUploadState(sessionId, { status: UploadStatus.ERROR, error: error.message });
            }
        });
    };

    const handleCancelUpload = (uploadSessionId) => {
        cancelUpload(uploadSessionId);
        removeActiveUpload(uploadSessionId);
        toast.info('Upload cancelled');
    };

    const handleRetryUpload = (uploadSessionId) => {
        const upload = activeUploads.find(u => u.sessionId === uploadSessionId);
        if (upload?.sessionData) {
            removeActiveUpload(uploadSessionId);
            handleOpenModal(upload.sessionData);
        }
    };

    // Handle pending upload file re-selection
    const handlePendingFileSelect = (uploadSessionId, file) => {
        if (reattachFile(uploadSessionId, file)) {
            const session = getSessionState(uploadSessionId);
            setPendingUploads(prev => prev.filter(p => p.id !== uploadSessionId));

            setActiveUploads(prev => [...prev, {
                sessionId: uploadSessionId,
                fileName: file.name,
                fileSize: file.size,
                progress: Math.round((session.uploadedBytes / session.fileSize) * 100),
                status: UploadStatus.PAUSED,
                statusText: 'Ready to resume',
                sessionData: session.metadata.sessionData
            }]);

            toast.success('File re-attached. Click Resume to continue.');
        } else {
            toast.error('File does not match. Please select the original file.');
        }
    };

    const handleCancelPendingUpload = (uploadSessionId) => {
        cancelUpload(uploadSessionId);
        setPendingUploads(prev => prev.filter(p => p.id !== uploadSessionId));
    };

    const handleCancelAllPending = () => {
        pendingUploads.forEach(p => cancelUpload(p.id));
        setPendingUploads([]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleCloseModal();
        handleBackgroundSubmit(formData, !!editingSession, editingSession?._id);
    };

    const handleDelete = async (e, id) => {
        e.preventDefault();
        e.stopPropagation();

        if (window.confirm('Are you sure you want to delete this session?')) {
            try {
                await deleteSession({ courseId, sessionId: id }).unwrap();
                toast.success('Session deleted successfully');
            } catch (err) {
                console.error('Failed to delete session:', err);
                toast.error(err?.data?.message || 'Failed to delete session');
            }
        }
    };

    if (error) {
        return (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                Error loading sessions: {error.message || 'Unknown error'}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Pending Uploads Panel */}
            <PendingUploadsPanel
                pendingUploads={pendingUploads}
                onSelectFile={handlePendingFileSelect}
                onCancelUpload={handleCancelPendingUpload}
                onCancelAll={handleCancelAllPending}
            />

            {/* Active Uploads Overlay - Bottom Right */}
            <UploadOverlay
                uploads={activeUploads}
                onPause={handlePauseUpload}
                onResume={handleResumeUpload}
                onCancel={handleCancelUpload}
                onRetry={handleRetryUpload}
            />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Link
                            to="/admin/courses"
                            className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-display font-bold text-foreground">
                                Manage Sessions
                            </h1>
                            {currentCourse && (
                                <p className="text-muted-foreground mt-1">
                                    Course: <span className="text-foreground font-medium">{currentCourse.title}</span>
                                </p>
                            )}
                        </div>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => handleOpenModal()}
                    disabled={activeUploads.length > 0}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeUploads.length > 0
                        ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-60'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                        }`}
                    title={activeUploads.length > 0 ? 'Please wait for current upload to complete' : 'Add new session'}
                >
                    <Plus size={20} />
                    Add Session
                </button>
            </div>

            {/* Sessions List */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input
                            type="text"
                            placeholder="Search sessions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-background border border-input focus:ring-2 focus:ring-ring focus:border-input outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="divide-y divide-border/50">
                    {isLoading ? (
                        <div className="px-6 py-8 text-center text-muted-foreground">
                            <div className="flex items-center justify-center">
                                <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
                                Loading sessions...
                            </div>
                        </div>
                    ) : filteredSessions.length === 0 ? (
                        <div className="px-6 py-8 text-center text-muted-foreground">
                            No sessions found. Click "Add Session" to create your first session.
                        </div>
                    ) : (
                        filteredSessions.map((session, index) => (
                            <div
                                key={session._id}
                                className="flex items-center gap-4 px-6 py-4 hover:bg-muted/20 transition-colors"
                            >
                                <div className="text-muted-foreground cursor-grab">
                                    <GripVertical size={20} />
                                </div>
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                                    {session.order || index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-foreground truncate">{session.title}</h3>
                                    {session.duration && (
                                        <p className="text-sm text-muted-foreground">{session.duration}</p>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleOpenModal(session)}
                                        className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-primary transition-colors"
                                        title="Edit"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => handleDelete(e, session._id)}
                                        className="p-2 hover:bg-red-50 rounded-full text-muted-foreground hover:text-red-600 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-card w-full max-w-lg rounded-xl shadow-lg border border-border animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card">
                            <h2 className="text-xl font-bold font-display">
                                {editingSession ? 'Edit Session' : 'Add New Session'}
                            </h2>
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Session Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="e.g. Introduction to Yoga"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Duration</label>
                                <input
                                    type="text"
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="e.g. 45 min"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FileUpload
                                    label="Session Video"
                                    type="video"
                                    value={formData.video}
                                    onChange={(file) => setFormData(prev => ({ ...prev, video: file }))}
                                    required={!editingSession}
                                />
                                <FileUpload
                                    label="Thumbnail (Optional)"
                                    type="image"
                                    value={formData.thumbnail}
                                    onChange={(file) => setFormData(prev => ({ ...prev, thumbnail: file }))}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="3"
                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="Enter session description..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                                >
                                    <Check size={18} />
                                    {editingSession ? 'Update Session' : 'Create Session'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Video Preview Modal */}
            <VideoPreviewModal
                isOpen={!!previewSession}
                onClose={() => setPreviewSession(null)}
                videoUrl={previewSession?.video}
                posterUrl={previewSession?.thumbnail}
                title={previewSession?.title}
            />
        </div>
    );
};

export default ManageSessions;
