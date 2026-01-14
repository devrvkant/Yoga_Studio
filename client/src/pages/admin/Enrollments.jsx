import { useState } from 'react';
import { useGetUsersQuery } from '../../features/auth/authApi';
import { Loader2, Mail, Book, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

const Enrollments = () => {
    const [page, setPage] = useState(1);
    const limit = 11; // Users per page

    const { data: usersData, isLoading, error } = useGetUsersQuery({ page, limit });

    if (error) {
        return (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                Error loading users: {error.message || 'Unknown error'}
            </div>
        );
    }

    const users = usersData?.data || [];
    const totalPages = usersData?.pages || 1;
    const totalUsers = usersData?.total || 0;

    const handlePrevPage = () => {
        if (page > 1) setPage(page - 1);
    };

    const handleNextPage = () => {
        if (page < totalPages) setPage(page + 1);
    };

    return (
        <div className="space-y-3">
            <div>
                <h1 className="text-2xl font-display font-bold text-foreground">User Enrollments</h1>
                <p className="text-muted-foreground text-sm mt-0.5">
                    Manage and view all registered users and their subscriptions ({totalUsers} total users)
                </p>
            </div>

            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                            <tr>
                                <th className="px-4 py-3">User</th>
                                <th className="px-4 py-3">Role</th>
                                <th className="px-4 py-3">Enrolled Classes</th>
                                <th className="px-4 py-3">Enrolled Courses</th>
                                <th className="px-4 py-3">Joined Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12">
                                        <div className="flex items-center justify-center">
                                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                        </div>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground">
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user._id} className="hover:bg-muted/20 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-foreground">{user.name}</div>
                                                    <div className="text-muted-foreground text-xs flex items-center gap-1">
                                                        <Mail size={10} /> {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {user.enrolledClasses?.length > 0 ? (
                                                <div className="flex flex-col gap-1">
                                                    {user.enrolledClasses.map(cls => (
                                                        <div key={cls._id} className="flex items-center gap-1 text-xs bg-secondary/30 px-2 py-1 rounded">
                                                            <Calendar size={12} className="text-primary" />
                                                            <span className="truncate max-w-[150px]">{cls.title}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground italic">None</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {user.enrolledCourses?.length > 0 ? (
                                                <div className="flex flex-col gap-1">
                                                    {user.enrolledCourses.map(course => (
                                                        <div key={course._id} className="flex items-center gap-1 text-xs bg-secondary/30 px-2 py-1 rounded">
                                                            <Book size={12} className="text-primary" />
                                                            <span className="truncate max-w-[150px]">{course.title}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground italic">None</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {format(new Date(user.createdAt), 'MMM d, yyyy')}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination UI - Only show if more than one page */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
                        <div className="text-sm text-muted-foreground">
                            Page {page} of {totalPages} • Showing {users.length} of {totalUsers} users
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handlePrevPage}
                                disabled={page === 1}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg border border-input bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={16} />
                                Previous
                            </button>
                            <button
                                onClick={handleNextPage}
                                disabled={page >= totalPages}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg border border-input bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Enrollments;
