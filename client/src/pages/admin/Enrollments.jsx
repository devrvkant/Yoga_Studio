import { useState } from 'react';
import { useGetUsersQuery } from '../../features/auth/authApi';
import { Loader2, Mail, Book, Calendar, ChevronLeft, ChevronRight, Filter, Info } from 'lucide-react';
import { format } from 'date-fns';

const Enrollments = () => {
    const [hoveredItem, setHoveredItem] = useState(null);

    const handleMouseEnter = (e, items, type) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setHoveredItem({
            type,
            items,
            position: {
                left: rect.left + rect.width / 2,
                top: rect.top
            }
        });
    };

    const handleMouseLeave = () => {
        setHoveredItem(null);
    };

    const [page, setPage] = useState(1);
    const [filterStatus, setFilterStatus] = useState('all');
    const limit = 13; // 13 users to fill the viewport

    const queryParams = {
        page,
        limit,
        status: filterStatus !== 'all' ? filterStatus : undefined
    };

    const { data: usersData, isLoading, error } = useGetUsersQuery(queryParams);

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

    const handleFilterChange = (e) => {
        setFilterStatus(e.target.value);
        setPage(1); // Reset to first page when filtering
    };

    return (
        <div className="space-y-4 flex flex-col h-[calc(100vh-3.5rem)] relative">
            {/* Tooltip Portal/Overlay */}
            {hoveredItem && (
                <div
                    className="fixed z-[100] w-64 bg-white text-slate-700 text-xs rounded-xl shadow-xl ring-1 ring-slate-200 p-2 animate-in fade-in zoom-in-95 duration-200 pointer-events-none"
                    style={{
                        left: hoveredItem.position.left,
                        top: hoveredItem.position.top - 8, // slight offset
                        transform: 'translate(-50%, -100%)'
                    }}
                >
                    <div className="flex flex-col gap-1.5 p-1 max-h-48 overflow-y-auto custom-scrollbar">
                        {hoveredItem.items.map(item => (
                            <div key={item._id} className="flex items-center gap-2 border-b border-slate-100 last:border-0 pb-1.5 last:pb-0 text-left">
                                {hoveredItem.type === 'class' ? (
                                    <Calendar size={12} className="text-primary shrink-0" />
                                ) : (
                                    <Book size={12} className="text-primary shrink-0" />
                                )}
                                <span className="truncate font-medium text-slate-800">{item.title}</span>
                            </div>
                        ))}
                    </div>
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-white drop-shadow-sm"></div>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 shrink-0">
                {/* ... header content ... */}
                <div>
                    <h1 className="text-2xl font-display font-bold text-foreground">User Enrollments</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Manage and view all registered users and their subscriptions ({totalUsers} total users)
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        <select
                            value={filterStatus}
                            onChange={handleFilterChange}
                            className="pl-9 pr-8 py-2 bg-background border border-input rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none cursor-pointer shadow-sm hover:bg-muted/50 transition-colors"
                        >
                            <option value="all">All Users</option>
                            <option value="premium">Premium Students</option>
                            <option value="active">Free Students</option>
                            <option value="registered">Registered Users</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <ChevronRight className="w-4 h-4 text-muted-foreground rotate-90" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col overflow-hidden flex-grow">
                <div className="overflow-auto flex-grow relative">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/95 backdrop-blur supports-[backdrop-filter]:bg-muted/50 text-muted-foreground font-medium border-b border-border sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-2.5 w-[30%]">User</th>
                                <th className="px-6 py-2.5 text-center w-[15%]">Status</th>
                                <th className="px-6 py-2.5 text-center w-[20%]">Booked Classes</th>
                                <th className="px-6 py-2.5 text-center w-[20%]">Enrolled Courses</th>
                                <th className="px-6 py-2.5 text-center w-[15%]">Joined Date</th>
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
                                        No users found matching the criteria.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => {
                                    const hasEnrollments = (user.enrolledClasses?.length > 0 || user.enrolledCourses?.length > 0);
                                    const isPremium = user.enrolledClasses?.some(c => c.isPaid) || user.enrolledCourses?.some(c => c.isPaid);

                                    return (
                                        <tr key={user._id} className="hover:bg-muted/20 transition-colors group/row">
                                            <td className="px-6 py-2 align-middle">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0 text-sm">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-medium text-foreground truncate">{user.name}</div>
                                                        <div className="text-muted-foreground text-xs flex items-center gap-1 truncate opacity-80">
                                                            <Mail size={12} /> {user.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-2 text-center align-middle">
                                                {isPremium ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border border-amber-200/50">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                        Premium
                                                    </span>
                                                ) : hasEnrollments ? (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                                        Registered
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-2 text-center align-middle">
                                                {user.enrolledClasses?.length > 1 ? (
                                                    <div
                                                        className="flex items-center justify-center gap-1.5 cursor-help w-full"
                                                        onMouseEnter={(e) => handleMouseEnter(e, user.enrolledClasses, 'class')}
                                                        onMouseLeave={handleMouseLeave}
                                                    >
                                                        <span className="text-sm font-medium text-foreground">{user.enrolledClasses.length} Classes</span>
                                                        <Info size={14} className="text-muted-foreground/50" />
                                                    </div>
                                                ) : user.enrolledClasses?.length === 1 ? (
                                                    <div className="flex justify-center">
                                                        <div className="flex items-center gap-1 text-xs bg-secondary/50 px-2.5 py-1 rounded-md text-foreground/80 max-w-[150px]">
                                                            <Calendar size={12} className="text-primary shrink-0" />
                                                            <span className="truncate">{user.enrolledClasses[0].title}</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground/30 text-xs font-medium">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-2 text-center align-middle">
                                                {user.enrolledCourses?.length > 1 ? (
                                                    <div
                                                        className="flex items-center justify-center gap-1.5 cursor-help w-full"
                                                        onMouseEnter={(e) => handleMouseEnter(e, user.enrolledCourses, 'course')}
                                                        onMouseLeave={handleMouseLeave}
                                                    >
                                                        <span className="text-sm font-medium text-foreground">{user.enrolledCourses.length} Courses</span>
                                                        <Info size={14} className="text-muted-foreground/50" />
                                                    </div>
                                                ) : user.enrolledCourses?.length === 1 ? (
                                                    <div className="flex justify-center">
                                                        <div className="flex items-center gap-1 text-xs bg-secondary/50 px-2.5 py-1 rounded-md text-foreground/80 max-w-[150px]">
                                                            <Book size={12} className="text-primary shrink-0" />
                                                            <span className="truncate">{user.enrolledCourses[0].title}</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground/30 text-xs font-medium">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-2 text-center text-muted-foreground text-sm align-middle">
                                                {format(new Date(user.createdAt), 'MMM d, yyyy')}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination UI - Only show if more than one page */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-2.5 border-t border-border bg-muted/20">
                        <div className="text-sm text-muted-foreground">
                            Page {page} of {totalPages} • Showing {users.length} of {totalUsers} users
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handlePrevPage}
                                disabled={page === 1}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg border border-input bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            >
                                <ChevronLeft size={16} />
                                Previous
                            </button>
                            <button
                                onClick={handleNextPage}
                                disabled={page >= totalPages}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg border border-input bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
