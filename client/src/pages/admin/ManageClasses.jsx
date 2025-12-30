import { Button } from '../../components/ui/Button';
import { Plus } from 'lucide-react';

const ManageClasses = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold text-foreground">Manage Classes</h1>
                    <p className="text-muted-foreground mt-1">Create and manage your yoga classes</p>
                </div>
                <Button className="gap-2">
                    <Plus size={18} />
                    Add New Class
                </Button>
            </div>

            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="p-10 text-center text-muted-foreground">
                    <p>Class management table will be implemented here.</p>
                </div>
            </div>
        </div>
    );
};

export default ManageClasses;
