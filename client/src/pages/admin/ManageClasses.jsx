import { useState, useEffect } from 'react';
import {
    useGetClassesQuery,
    useAddClassMutation,
    useUpdateClassMutation,
    useDeleteClassMutation
} from '../../features/admin/class/classApi';
import { Loader2, Plus, Pencil, Trash2, X, Check, Search, Pause, Play } from 'lucide-react';
import { toast } from 'sonner';
import FileUpload from '../../components/common/FileUpload';
import { UploadOverlay, PendingUploadsPanel } from '../../components/upload';
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

const ManageClasses = () => {
    const { data: classesData, isLoading, error } = useGetClassesQuery();
    const [addClass] = useAddClassMutation();
    const [updateClass] = useUpdateClassMutation();
    const [deleteClass] = useDeleteClassMutation();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        instructor: '',
        description: '',
        isPaid: false,
        price: '0',
        duration: '',
        level: 'All Levels',
        image: '',
        video: '',
    });

    // Active uploads being tracked
    const [activeUploads, setActiveUploads] = useState([]);
    // Pending uploads from previous session (needs file re-selection)
    const [pendingUploads, setPendingUploads] = useState([]);

    // Check for pending uploads on mount
    useEffect(() => {
        const pending = getPendingUploads();
        if (pending.length > 0) {
            setPendingUploads(pending);
        }
    }, []);

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

    const classes = classesData?.data || classesData || [];

    const filteredClasses = classes.filter(cls =>
        cls.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.instructor?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = (cls = null) => {
        if (cls) {
            setEditingClass(cls);
            setFormData({
                title: cls.title,
                instructor: cls.instructor,
                description: cls.description || '',
                isPaid: cls.isPaid || false,
                price: cls.price || '0',
                duration: cls.duration,
                level: cls.level || 'All Levels',
                image: cls.image || '',
                video: cls.video || '',
            });
        } else {
            setEditingClass(null);
            setFormData({
                title: '',
                instructor: '',
                description: '',
                isPaid: false,
                price: '0',
                duration: '60',
                level: 'All Levels',
                image: '',
                video: '',
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingClass(null);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => {
            const updates = { [name]: type === 'checkbox' ? checked : value };
            // Reset price if setting to free
            if (name === 'isPaid' && !checked) {
                updates.price = '0';
            }
            return { ...prev, ...updates };
        });
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

        // For large videos, use chunked upload with UI controls
        if (hasLargeVideo) {
            await handleChunkedUpload(currentData, isEdit, editId);
        } else {
            // For small files, use simple direct upload
            await handleDirectUpload(currentData, isEdit, editId);
        }
    };

    // Chunked upload with pause/resume/cancel
    const handleChunkedUpload = async (currentData, isEdit, editId) => {
        const file = currentData.video;
        const sessionId = createUploadSession(file, 'video', {
            classData: currentData,
            isEdit,
            editId
        });

        // Add to active uploads
        const uploadEntry = {
            sessionId,
            fileName: file.name,
            fileSize: file.size,
            progress: 0,
            status: UploadStatus.PENDING,
            statusText: 'Starting...',
            classData: currentData
        };
        setActiveUploads(prev => [...prev, uploadEntry]);

        // Upload image first (if exists) using direct upload
        let imageUrl = currentData.image;
        if (currentData.image instanceof File) {
            try {
                imageUrl = await uploadToCloudinary(currentData.image, 'image');
            } catch (err) {
                toast.error('Failed to upload image');
                removeActiveUpload(sessionId);
                return;
            }
        }

        // Start chunked video upload
        startUpload(sessionId, {
            onProgress: (progress, statusText) => {
                updateUploadState(sessionId, { progress, statusText, status: UploadStatus.UPLOADING });
            },
            onComplete: async (videoUrl) => {
                updateUploadState(sessionId, {
                    progress: 100,
                    statusText: 'Saving to database...',
                    status: UploadStatus.UPLOADING
                });

                // Save to database
                const finalData = {
                    ...currentData,
                    image: imageUrl,
                    video: videoUrl
                };

                try {
                    if (isEdit) {
                        await updateClass({ id: editId, ...finalData }).unwrap();
                        toast.success(`Class "${currentData.title}" updated!`);
                    } else {
                        await addClass(finalData).unwrap();
                        toast.success(`Class "${currentData.title}" created!`);
                    }
                    removeActiveUpload(sessionId);
                } catch (err) {
                    updateUploadState(sessionId, {
                        status: UploadStatus.ERROR,
                        error: 'Failed to save to database'
                    });
                }
            },
            onError: (error) => {
                updateUploadState(sessionId, {
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
                classData: currentData
            }]);
        }

        const toastId = toast.loading(`${isEdit ? 'Updating' : 'Creating'} "${currentData.title}"...`, {
            description: "Don't close this tab until uploading finished!"
        });

        try {
            let imageUrl = currentData.image;
            let videoUrl = currentData.video;

            const updateProgress = (percent) => {
                setActiveUploads(prev => prev.map(item =>
                    item.sessionId === tempId ? { ...item, progress: percent } : item
                ));
            };

            if (currentData.image instanceof File) {
                const maxImageProgress = (currentData.video instanceof File) ? 10 : 100;
                imageUrl = await uploadToCloudinary(currentData.image, 'image', (p) => {
                    updateProgress(Math.round((p * maxImageProgress) / 100));
                });
            } else if (currentData.video instanceof File) {
                updateProgress(10);
            }

            if (currentData.video instanceof File) {
                videoUrl = await uploadToCloudinary(currentData.video, 'video', (p) => {
                    updateProgress(10 + Math.round((p * 90) / 100));
                });
            } else if (currentData.image instanceof File) {
                updateProgress(100);
            }

            const finalData = { ...currentData, image: imageUrl, video: videoUrl };

            if (isEdit) {
                await updateClass({ id: editId, ...finalData }).unwrap();
                toast.success(`Class "${currentData.title}" updated!`, { id: toastId });
            } else {
                await addClass(finalData).unwrap();
                toast.success(`Class "${currentData.title}" created!`, { id: toastId });
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
                const { classData, isEdit, editId } = upload;
                const finalData = { ...classData, video: videoUrl };

                try {
                    if (isEdit) {
                        await updateClass({ id: editId, ...finalData }).unwrap();
                        toast.success(`Class "${classData.title}" updated!`);
                    } else {
                        await addClass(finalData).unwrap();
                        toast.success(`Class "${classData.title}" created!`);
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

    const handleCancelUpload = (sessionId) => {
        cancelUpload(sessionId);
        removeActiveUpload(sessionId);
        toast.info('Upload cancelled');
    };

    const handleRetryUpload = (sessionId) => {
        const upload = activeUploads.find(u => u.sessionId === sessionId);
        if (upload?.classData) {
            removeActiveUpload(sessionId);
            handleOpenModal(upload.classData);
        }
    };

    // Handle pending upload file re-selection
    const handlePendingFileSelect = (sessionId, file) => {
        if (reattachFile(sessionId, file)) {
            const session = getSessionState(sessionId);
            setPendingUploads(prev => prev.filter(p => p.id !== sessionId));

            // Add to active uploads and resume
            setActiveUploads(prev => [...prev, {
                sessionId,
                fileName: file.name,
                fileSize: file.size,
                progress: Math.round((session.uploadedBytes / session.fileSize) * 100),
                status: UploadStatus.PAUSED,
                statusText: 'Ready to resume',
                classData: session.metadata.classData
            }]);

            toast.success('File re-attached. Click Resume to continue.');
        } else {
            toast.error('File does not match. Please select the original file.');
        }
    };

    const handleCancelPendingUpload = (sessionId) => {
        cancelUpload(sessionId);
        setPendingUploads(prev => prev.filter(p => p.id !== sessionId));
    };

    const handleCancelAllPending = () => {
        pendingUploads.forEach(p => cancelUpload(p.id));
        setPendingUploads([]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleCloseModal();
        handleBackgroundSubmit(formData, !!editingClass, editingClass?._id);
    };

    const handleDelete = async (e, id) => {
        e.preventDefault();
        e.stopPropagation();

        if (window.confirm('Are you sure you want to delete this class?')) {
            try {
                await deleteClass(id).unwrap();
                toast.success('Class deleted successfully');
            } catch (err) {
                console.error('Failed to delete class:', err);
                toast.error(err?.data?.message || 'Failed to delete class');
            }
        }
    };

    if (error) {
        return (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                Error loading classes: {error.message || 'Unknown error'}
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
                    <h1 className="text-3xl font-display font-bold text-foreground">Manage Classes</h1>
                    <p className="text-muted-foreground mt-1">Create and manage your yoga classes</p>
                </div>
                <button
                    type="button"
                    onClick={() => handleOpenModal()}
                    disabled={activeUploads.length > 0}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeUploads.length > 0
                        ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-60'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                        }`}
                    title={activeUploads.length > 0 ? 'Please wait for current upload to complete' : 'Add new class'}
                >
                    <Plus size={20} />
                    Add Class
                </button>
            </div>

            {/* Table */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input
                            type="text"
                            placeholder="Search classes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-background border border-input focus:ring-2 focus:ring-ring focus:border-input outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                            <tr>
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Instructor</th>
                                <th className="px-6 py-4">Duration</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-muted-foreground">
                                        <div className="flex items-center justify-center">
                                            <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
                                            Loading classes...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredClasses.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-muted-foreground">
                                        No classes found.
                                    </td>
                                </tr>
                            ) : (
                                filteredClasses.map((cls) => (
                                    <tr key={cls._id} className="hover:bg-muted/20 transition-colors">
                                        <td className="px-6 py-4 font-medium text-foreground">{cls.title}</td>
                                        <td className="px-6 py-4">{cls.instructor}</td>
                                        <td className="px-6 py-4">{cls.duration} mins</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenModal(cls)}
                                                    className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-primary transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleDelete(e, cls._id)}
                                                    className="p-2 hover:bg-red-50 rounded-full text-muted-foreground hover:text-red-600 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-card w-full max-w-lg rounded-xl shadow-lg border border-border animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-border">
                            <h2 className="text-xl font-bold font-display">
                                {editingClass ? 'Edit Class' : 'Add New Class'}
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
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none">Class Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        required
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        placeholder="e.g. Morning Vinyasa"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none">Instructor</label>
                                    <input
                                        type="text"
                                        name="instructor"
                                        required
                                        value={formData.instructor}
                                        onChange={handleChange}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        placeholder="e.g. Sarah Smith"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium leading-none">Price (€)</label>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                name="isPaid"
                                                id="isPaid"
                                                checked={formData.isPaid}
                                                onChange={handleChange}
                                                className="h-3.5 w-3.5 rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                            <label htmlFor="isPaid" className="text-xs cursor-pointer select-none text-muted-foreground">
                                                Paid Class
                                            </label>
                                        </div>
                                    </div>
                                    <input
                                        type="number"
                                        name="price"
                                        min="0"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={handleChange}
                                        disabled={!formData.isPaid}
                                        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${!formData.isPaid ? 'opacity-50 cursor-not-allowed bg-muted' : ''}`}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none">Duration (mins)</label>
                                    <input
                                        type="number"
                                        name="duration"
                                        required
                                        value={formData.duration}
                                        onChange={handleChange}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        placeholder="60"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none">Level</label>
                                    <select
                                        name="level"
                                        value={formData.level}
                                        onChange={handleChange}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                        <option value="All Levels">All Levels</option>
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FileUpload
                                    label="Class Image"
                                    type="image"
                                    value={formData.image}
                                    onChange={(file) => setFormData(prev => ({ ...prev, image: file }))}
                                />
                                <FileUpload
                                    label="Class Video"
                                    type="video"
                                    value={formData.video}
                                    onChange={(file) => setFormData(prev => ({ ...prev, video: file }))}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="3"
                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="Enter class description..."
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
                                    {editingClass ? 'Update Class' : 'Create Class'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageClasses;
