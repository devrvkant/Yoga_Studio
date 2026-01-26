import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    useGetCoursesQuery,
    useAddCourseMutation,
    useUpdateCourseMutation,
    useDeleteCourseMutation
} from '../../features/admin/course/courseApi';
import { Loader2, Plus, Pencil, Trash2, X, Check, Search, BookOpen, Video, Play } from 'lucide-react';
import { toast } from 'sonner';
import FileUpload from '../../components/common/FileUpload';
import { uploadToCloudinary } from '../../utils/uploadMedia';

const ManageCourses = () => {
    // Fetch all courses for client-side filtering (limit: 1000)
    const { data: coursesData, isLoading, error } = useGetCoursesQuery({ limit: 1000 });
    const [addCourse] = useAddCourseMutation();
    const [updateCourse] = useUpdateCourseMutation();
    const [deleteCourse] = useDeleteCourseMutation();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        instructor: '',
        isPaid: false,
        price: '0',
        digistoreProductId: '',
        duration: '', // e.g. "4 Weeks"
        sessions: '', // e.g. "8 Sessions"
        level: 'All Levels',
        learnPoints: '', // Comma separated strings
        image: '',
    });

    const courses = coursesData?.data || coursesData || [];

    const filteredCourses = courses.filter(course =>
        course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = (course = null) => {
        if (course) {
            setEditingCourse(course);
            setFormData({
                title: course.title,
                description: course.description || '',
                instructor: course.instructor || '',
                isPaid: course.isPaid || (course.price > 0),
                price: course.price || '0',
                digistoreProductId: course.digistoreProductId || '',
                duration: course.duration || '',
                sessions: course.sessions || '',
                level: course.level || 'All Levels',
                learnPoints: course.learnPoints ? course.learnPoints.join(', ') : '',
                image: course.image || '',
            });
        } else {
            setEditingCourse(null);
            setFormData({
                title: '',
                description: '',
                instructor: '',
                isPaid: false,
                price: '0',
                digistoreProductId: '',
                duration: '',
                sessions: '',
                level: 'All Levels',
                learnPoints: '',
                image: '',
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCourse(null);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => {
            const updates = { [name]: type === 'checkbox' ? checked : value };
            // Reset price and productId if setting to free
            if (name === 'isPaid' && !checked) {
                updates.price = '0';
                updates.digistoreProductId = '';
            }
            return { ...prev, ...updates };
        });
    };

    // Background Upload Logic
    const handleBackgroundSubmit = async (currentData, isEdit, editId) => {
        const toastId = toast.loading(`Uploading media for "${currentData.title}"... Don't close this tab.`);

        try {
            // 1. Upload Image
            let imageUrl = currentData.image;
            if (currentData.image instanceof File) {
                imageUrl = await uploadToCloudinary(currentData.image, 'image');
            }

            const formattedData = {
                ...currentData,
                image: imageUrl,
                learnPoints: currentData.learnPoints.split(',').map(p => p.trim()).filter(Boolean)
            };

            // 2. Submit to API
            if (isEdit) {
                await updateCourse({ id: editId, ...formattedData }).unwrap();
                toast.success(`Course "${currentData.title}" updated successfully!`, { id: toastId });
            } else {
                await addCourse(formattedData).unwrap();
                toast.success(`Course "${currentData.title}" created successfully!`, { id: toastId });
            }
        } catch (err) {
            console.error('Background process failed:', err);
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

    const handleSubmit = (e) => {
        e.preventDefault();
        handleCloseModal();
        handleBackgroundSubmit(formData, !!editingCourse, editingCourse?._id);
    };

    const handleDelete = async (e, id) => {
        e.preventDefault();
        e.stopPropagation();

        if (window.confirm('Are you sure you want to delete this course?')) {
            try {
                await deleteCourse(id).unwrap();
                toast.success('Course deleted successfully');
            } catch (err) {
                console.error('Failed to delete course:', err);
                toast.error(err?.data?.message || 'Failed to delete course');
            }
        }
    };

    if (error) {
        return (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                Error loading courses: {error.message || 'Unknown error'}
            </div>
        );
    }

    return (
        <div className="space-y-6 flex flex-col h-[calc(100vh-3.5rem)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-display font-bold text-foreground">Manage Courses</h1>
                    <p className="text-muted-foreground mt-1">Create and manage your courses and workshops</p>
                </div>
                <button
                    type="button"
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
                >
                    <Plus size={20} />
                    Add Course
                </button>
            </div>

            <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col overflow-hidden flex-grow">
                <div className="p-4 border-b border-border">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-10 py-2 rounded-lg bg-background border border-input focus:ring-2 focus:ring-ring focus:border-input outline-none transition-all"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="overflow-auto flex-grow relative">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/95 backdrop-blur supports-[backdrop-filter]:bg-muted/50 text-muted-foreground font-medium border-b border-border sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Instructor</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Duration</th>
                                <th className="px-6 py-4">Sessions</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-muted-foreground">
                                        <div className="flex items-center justify-center">
                                            <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
                                            Loading courses...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredCourses.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-muted-foreground">
                                        No courses found.
                                    </td>
                                </tr>
                            ) : (
                                filteredCourses.map((course) => (
                                    <tr key={course._id} className="hover:bg-muted/20 transition-colors">
                                        <td className="px-6 py-4 font-medium text-foreground">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                                                    <BookOpen size={16} />
                                                </div>
                                                {course.title}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{course.instructor || '-'}</td>
                                        <td className="px-6 py-4">
                                            {course.price ? `€${course.price}` : 'Free'}
                                        </td>
                                        <td className="px-6 py-4">{course.duration || '-'}</td>
                                        <td className="px-6 py-4">{course.sessions || '-'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    to={`/admin/courses/${course._id}/sessions`}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 rounded-md transition-colors"
                                                    title="Manage Sessions"
                                                >
                                                    <Video size={14} />
                                                    Sessions
                                                </Link>
                                                <Link
                                                    to={`/admin/courses/${course._id}/preview`}
                                                    className="p-2 hover:bg-primary/10 rounded-full text-muted-foreground hover:text-primary transition-colors"
                                                    title="Preview Course"
                                                >
                                                    <Play size={18} />
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenModal(course)}
                                                    className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                                                    title="Edit"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleDelete(e, course._id)}
                                                    className="p-2 hover:bg-red-50 rounded-full text-muted-foreground hover:text-red-600 transition-colors cursor-pointer"
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
                    <div className="bg-card w-full max-w-lg rounded-xl shadow-lg border border-border animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
                            <h2 className="text-xl font-bold font-display">
                                {editingCourse ? 'Edit Course' : 'Add New Course'}
                            </h2>
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                            <div className="p-6 space-y-4 overflow-y-auto">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none">Course Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        required
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        placeholder="e.g. 30-Day Yoga Challenge"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none">Instructor</label>
                                        <input
                                            type="text"
                                            name="instructor"
                                            value={formData.instructor}
                                            onChange={handleChange}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            placeholder="Minh Le"
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
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none">Duration</label>
                                        <input
                                            type="text"
                                            name="duration"
                                            value={formData.duration}
                                            onChange={handleChange}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            placeholder="e.g. 4 Weeks"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none">Sessions</label>
                                        <input
                                            type="text"
                                            name="sessions"
                                            value={formData.sessions}
                                            onChange={handleChange}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            placeholder="e.g. 8 Sessions"
                                        />
                                    </div>
                                </div>

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
                                                Paid Course
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

                                {/* Digistore Product ID - only shown for paid courses */}
                                {formData.isPaid && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none">Digistore24 Product ID</label>
                                        <input
                                            type="text"
                                            name="digistoreProductId"
                                            required={formData.isPaid}
                                            value={formData.digistoreProductId}
                                            onChange={handleChange}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            placeholder="e.g. 123456"
                                        />
                                        <p className="text-xs text-muted-foreground">Product ID from your Digistore24 dashboard</p>
                                    </div>
                                )}

                                <div>
                                    <FileUpload
                                        label="Course Image"
                                        type="image"
                                        value={formData.image}
                                        onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none">Learning Points (comma separated)</label>
                                    <textarea
                                        name="learnPoints"
                                        value={formData.learnPoints}
                                        onChange={handleChange}
                                        rows="2"
                                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        placeholder="Point 1, Point 2, Point 3..."
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
                                        placeholder="Enter course description..."
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 p-6 border-t border-border shrink-0">
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
                                    {editingCourse ? 'Update Course' : 'Create Course'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageCourses;
