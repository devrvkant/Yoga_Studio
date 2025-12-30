import { useState } from 'react';
import {
    useGetClassesQuery,
    useAddClassMutation,
    useUpdateClassMutation,
    useDeleteClassMutation
} from '../../features/admin/class/classApi';
import { Loader2, Plus, Pencil, Trash2, X, Check, Search } from 'lucide-react';
import { toast } from 'sonner';
import FileUpload from '../../components/common/FileUpload';
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
        duration: '', // in minutes
        capacity: '',
        level: 'All Levels',
        image: '',
        video: '',
    });

    const classes = classesData?.data || classesData || []; // Handle potential wrap

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
                duration: cls.duration,
                capacity: cls.capacity,
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
                duration: '60',
                capacity: '20',
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
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Background Upload Logic
    const handleBackgroundSubmit = async (currentData, isEdit, editId) => {
        const toastId = toast.loading(`Uploading media for "${currentData.title}"... Don't close this tab.`);

        try {
            // 1. Upload Media
            let imageUrl = currentData.image;
            let videoUrl = currentData.video;

            if (currentData.image instanceof File) {
                imageUrl = await uploadToCloudinary(currentData.image, 'image');
            }

            if (currentData.video instanceof File) {
                videoUrl = await uploadToCloudinary(currentData.video, 'video');
            }

            const finalData = {
                ...currentData,
                image: imageUrl,
                video: videoUrl
            };

            // 2. Submit to API
            if (isEdit) {
                await updateClass({ id: editId, ...finalData }).unwrap();
                toast.success(`Class "${currentData.title}" updated successfully!`, { id: toastId });
            } else {
                await addClass(finalData).unwrap();
                toast.success(`Class "${currentData.title}" created successfully!`, { id: toastId });
            }
        } catch (err) {
            console.error('Background process failed:', err);
            toast.error(`Failed to save "${currentData.title}". Click to retry.`, {
                id: toastId,
                duration: 10000,
                action: {
                    label: 'Retry (Open Form)',
                    onClick: () => handleOpenModal(isEdit ? { _id: editId, ...currentData } : currentData)
                }
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // 1. Close Modal Immediately to unblock user
        handleCloseModal();

        // 2. Start Background Process
        // We pass a snapshot of the data to avoid state closures issues if modal reopens
        handleBackgroundSubmit(formData, !!editingClass, editingClass?._id);
    };

    const handleDelete = async (id) => {
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-foreground">Manage Classes</h1>
                    <p className="text-muted-foreground mt-1">Create and manage your yoga classes</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                    <Plus size={20} />
                    Add Class
                </button>
            </div>

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
                                <th className="px-6 py-4">Difficulty Level</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">
                                        <div className="flex items-center justify-center">
                                            <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
                                            Loading classes...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredClasses.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">
                                        No classes found.
                                    </td>
                                </tr>
                            ) : (
                                filteredClasses.map((cls) => (
                                    <tr key={cls._id} className="hover:bg-muted/20 transition-colors">
                                        <td className="px-6 py-4 font-medium text-foreground">{cls.title}</td>
                                        <td className="px-6 py-4">{cls.instructor}</td>
                                        <td className="px-6 py-4">{cls.duration} mins</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                                                cls.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {cls.level || 'All Levels'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(cls)}
                                                    className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-primary transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cls._id)}
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

            {/* Modal/Dialog */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-card w-full max-w-lg rounded-xl shadow-lg border border-border animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-border">
                            <h2 className="text-xl font-bold font-display">
                                {editingClass ? 'Edit Class' : 'Add New Class'}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Class Title
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="e.g. Morning Vinyasa Flow"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FileUpload
                                    label="Class Image"
                                    type="image"
                                    value={formData.image}
                                    onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
                                />
                                <FileUpload
                                    label="Class Video"
                                    type="video"
                                    value={formData.video}
                                    onChange={(url) => setFormData(prev => ({ ...prev, video: url }))}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none">Capacity</label>
                                    <input
                                        type="number"
                                        name="capacity"
                                        required
                                        value={formData.capacity}
                                        onChange={handleChange}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        placeholder="20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none">Difficulty</label>
                                    <select
                                        name="difficulty"
                                        value={formData.difficulty}
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

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="3"
                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
