import { Button } from '../../components/ui/Button';
import { Plus } from 'lucide-react';

const ManageCourses = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold text-foreground">Manage Courses</h1>
                    <p className="text-muted-foreground mt-1">Create and manage your multi-session courses</p>
                </div>
                <Button className="gap-2">
                    <Plus size={18} />
                    Add New Course
                </Button>
            </div>

            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="p-10 text-center text-muted-foreground">
                    <p>Course management table will be implemented here.</p>
                </div>
            </div>
        </div>
    );
};

export default ManageCourses;
