import { Search } from 'lucide-react';
import { Button } from '../ui/Button';

const EmptyState = ({ title, description, actionLabel, onAction }) => {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-in fade-in duration-500">
            <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-muted-foreground/60" />
            </div>
            <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                {title || 'No items found'}
            </h3>
            <p className="text-muted-foreground max-w-sm mb-8 leading-relaxed">
                {description || "We couldn't find anything matching your criteria. Try adjusting your filters or search terms."}
            </p>
            {actionLabel && onAction && (
                <Button
                    onClick={onAction}
                    variant="outline"
                    className="rounded-full px-6"
                >
                    {actionLabel}
                </Button>
            )}
        </div>
    );
};

export default EmptyState;
