import { useState, useEffect } from 'react';
import { Clock, Users, User, Search, ArrowLeft, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useGetClassesQuery, useEnrollClassMutation } from '../features/admin/class/classApi';
import { useGetMeQuery } from '../features/auth/authApi';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';

// Debounce hook for search optimization
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
}

export function ExploreClassesPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Read initial state from URL params
    const initialFilter = searchParams.get('level') || 'All Classes';
    const initialSearch = searchParams.get('search') || '';
    const initialPage = parseInt(searchParams.get('page'), 10) || 1;

    const [activeFilter, setActiveFilter] = useState(initialFilter);
    const [searchInput, setSearchInput] = useState(initialSearch);
    const [currentPage, setCurrentPage] = useState(initialPage);

    // Debounce search input
    const debouncedSearch = useDebounce(searchInput, 300);

    // Sync state to URL params
    useEffect(() => {
        const params = new URLSearchParams();
        if (activeFilter && activeFilter !== 'All Classes') {
            params.set('level', activeFilter);
        }
        if (debouncedSearch) {
            params.set('search', debouncedSearch);
        }
        if (currentPage > 1) {
            params.set('page', currentPage.toString());
        }
        setSearchParams(params, { replace: true });
    }, [activeFilter, debouncedSearch, currentPage, setSearchParams]);

    // Reset page when filter or search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [activeFilter, debouncedSearch]);

    // 9 items per page (3 rows of 3)
    const { data: classesData, isLoading, isFetching } = useGetClassesQuery({
        page: currentPage,
        limit: 9,
        level: activeFilter,
        search: debouncedSearch
    });

    const { data: userData, refetch: refetchUser } = useGetMeQuery();
    const [enrollClass] = useEnrollClassMutation();

    const classes = classesData?.data || [];
    const totalPages = classesData?.pagination?.pages || Math.ceil((classesData?.total || 0) / 9);
    const totalItems = classesData?.total || 0;
    const enrolledClassIds = userData?.data?.enrolledClasses?.map(c => c._id) || [];
    const filters = ["All Classes", "Beginner", "Intermediate", "Advanced"];

    const handleAction = async (cls) => {
        if (!userData) {
            toast.error("Please login to enroll");
            navigate('/login', { state: { from: '/classes/explore' } });
            return;
        }

        const isEnrolled = enrolledClassIds.includes(cls._id);

        if (isEnrolled) {
            navigate(`/dashboard/my-classes/${cls._id}`);
            return;
        }

        if (cls.isPaid) {
            navigate(`/checkout?type=class&id=${cls._id}`);
            return;
        }

        const toastId = toast.loading("Booking class...");
        try {
            await enrollClass(cls._id).unwrap();
            await refetchUser();
            toast.success("Class booked successfully!", { id: toastId });
        } catch (err) {
            toast.error(err?.data?.message || "Booking failed", { id: toastId });
        }
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const clearSearch = () => {
        setSearchInput('');
    };

    const clearFilters = () => {
        setActiveFilter('All Classes');
        setSearchInput('');
        setCurrentPage(1);
    };

    const hasActiveFilters = activeFilter !== 'All Classes' || searchInput.trim() !== '';

    return (
        <div className="h-screen flex flex-col bg-background overflow-hidden">
            {/* Compact Fixed Header Section */}
            <div className="flex-shrink-0 bg-white border-b border-border-soft shadow-sm">
                <div className="container mx-auto px-6 max-w-7xl py-3">
                    {/* Top Row: Back Button, Title, Search */}
                    <div className="flex items-center gap-4 mb-3">
                        <Link
                            to="/classes"
                            className="inline-flex items-center text-muted hover:text-foreground transition-colors font-medium text-sm"
                        >
                            <ArrowLeft size={18} className="mr-1.5" />
                            Back
                        </Link>

                        <h1 className="text-xl font-display font-bold text-foreground">Explore Classes</h1>

                        {/* Search Input */}
                        <div className="relative flex-1 max-w-md ml-auto">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                            <input
                                type="text"
                                placeholder="Search classes..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="w-full pl-10 pr-10 py-2 rounded-full border border-border-soft bg-section-alt focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm text-foreground placeholder:text-muted"
                            />
                            {searchInput && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Bottom Row: Count + Filters */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted font-medium">
                            {isLoading ? 'Loading...' : `${totalItems} classes found`}
                        </span>

                        <div className="flex items-center gap-2">
                            {filters.map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setActiveFilter(filter)}
                                    className={cn(
                                        "px-4 py-1.5 rounded-full transition-all duration-300 font-medium text-xs border",
                                        activeFilter === filter
                                            ? 'bg-primary text-white border-primary shadow-sm'
                                            : 'bg-white text-muted border-border-soft hover:border-primary/50 hover:text-foreground'
                                    )}
                                >
                                    {filter}
                                </button>
                            ))}
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="px-3 py-1.5 rounded-full text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto">
                <div className="container mx-auto px-6 max-w-7xl py-6">
                    {isLoading || isFetching ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : classes.length === 0 ? (
                        <EmptyState
                            title="No classes found"
                            description={searchInput
                                ? `No results for "${searchInput}". Try a different search term.`
                                : `We couldn't find any ${activeFilter.toLowerCase()} at the moment.`
                            }
                            actionLabel="Clear Filters"
                            onAction={clearFilters}
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {classes.map((item) => {
                                const isEnrolled = enrolledClassIds.includes(item._id);
                                return (
                                    <div key={item._id} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-border-soft flex flex-col relative h-full">
                                        {/* Premium/Free Badge */}
                                        <div className="absolute top-3 left-3 z-10">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider ${item.isPaid ? 'bg-primary' : 'bg-emerald-500'}`}>
                                                {item.isPaid ? 'Premium' : 'Free'}
                                            </span>
                                        </div>

                                        {/* Level Badge */}
                                        <div className="absolute top-3 right-3 z-10">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider ${item.level === "Beginner" ? "bg-emerald-500" :
                                                item.level === "Intermediate" ? "bg-teal-600" :
                                                    item.level === "Advanced" ? "bg-slate-800" :
                                                        "bg-emerald-600"
                                                }`}>
                                                {item.level}
                                            </span>
                                        </div>

                                        <div className="relative h-52 overflow-hidden">
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                        </div>

                                        <div className="p-6 flex flex-col flex-grow">
                                            <div className="flex items-center gap-4 text-xs font-medium text-muted mb-3 uppercase tracking-wide">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock size={14} />
                                                    {item.duration} min
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Users size={14} />
                                                    {item.level}
                                                </div>
                                            </div>

                                            <h3 className="text-xl font-display font-bold text-foreground mb-2">{item.title}</h3>
                                            <p className="text-muted leading-relaxed mb-4 font-light text-sm flex-grow line-clamp-2">
                                                {item.description}
                                            </p>

                                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-border-soft/60 mb-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                                                        <User size={14} className="text-gray-500" />
                                                    </div>
                                                    <span className="text-sm font-medium text-foreground">{item.instructor}</span>
                                                </div>
                                                <div className="text-lg font-bold text-primary">
                                                    {item.isPaid ? `€${item.price}` : 'Free'}
                                                </div>
                                            </div>

                                            <Button
                                                className={`w-full rounded-lg font-semibold py-5 ${isEnrolled ? 'bg-primary/90 hover:bg-primary' : ''}`}
                                                variant={isEnrolled ? "default" : "default"}
                                                onClick={() => handleAction(item)}
                                            >
                                                {isEnrolled ? 'Go to Class' : item.isPaid ? 'Book Class' : 'Book Free Class'}
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Fixed Footer with Pagination */}
            {totalPages > 1 && (
                <div className="flex-shrink-0 bg-white border-t border-border-soft shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <div className="container mx-auto px-6 max-w-7xl py-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted">
                                Showing {((currentPage - 1) * 9) + 1} - {Math.min(currentPage * 9, totalItems)} of {totalItems} classes
                            </span>
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ExploreClassesPage;
