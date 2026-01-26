import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    // Logic to show a window of pages (e.g., [1, 2, ..., 5, 6, 7, ..., 10])
    // For simplicity, let's show all if <= 7, otherwise show window
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first
            pages.push(1);

            if (currentPage > 3) {
                pages.push('...');
            }

            // Window around current
            let start = Math.max(2, currentPage - 1);
            let end = Math.min(totalPages - 1, currentPage + 1);

            // Adjust window if near start/end
            if (currentPage <= 3) {
                end = Math.min(totalPages - 1, 4);
            }
            if (currentPage >= totalPages - 2) {
                start = Math.max(2, totalPages - 3);
            }

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (currentPage < totalPages - 2) {
                pages.push('...');
            }

            // Always show last
            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div className="flex justify-center items-center gap-2 mt-12">
            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-10 w-10 text-foreground"
            >
                <ChevronLeft size={18} />
            </Button>

            <div className="flex gap-2">
                {getPageNumbers().map((page, index) => (
                    page === '...' ? (
                        <span key={`dots-${index}`} className="px-2 text-muted-foreground self-end mb-2">...</span>
                    ) : (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={cn(
                                "h-10 w-10 rounded-lg text-sm font-medium transition-colors",
                                currentPage === page
                                    ? "bg-primary text-white shadow-md transform scale-105"
                                    : "bg-white border border-border-soft text-foreground hover:bg-slate-50 hover:border-slate-300"
                            )}
                        >
                            {page}
                        </button>
                    )
                ))}
            </div>

            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-10 w-10 text-foreground"
            >
                <ChevronRight size={18} />
            </Button>
        </div>
    );
};

export default Pagination;
