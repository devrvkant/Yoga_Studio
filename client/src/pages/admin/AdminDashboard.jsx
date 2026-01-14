import { Users, CalendarDays, BookOpen, Activity } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <h3 className="text-2xl font-bold mt-2 text-foreground">{value}</h3>
            </div>
            <div className={`p-3 rounded-full ${color}`}>
                <Icon size={24} className="text-white" />
            </div>
        </div>
    </div>
);

const AdminDashboard = () => {
    // Mock data for now, will connect to API later
    const stats = [
        {
            title: 'Total Users',
            value: '1,234',
            icon: Users,
            color: 'bg-blue-500',
        },
        {
            title: 'Active Classes',
            value: '22',
            icon: CalendarDays,
            color: 'bg-green-500',
        },
        {
            title: 'Total Courses',
            value: '8',
            icon: BookOpen,
            color: 'bg-purple-500',
        },
        {
            title: 'Monthly Revenue',
            value: '€12.5k',
            icon: Activity,
            color: 'bg-orange-500',
        },
    ];

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-3xl font-display font-bold text-foreground">Dashboard Overview</h1>
                <p className="text-muted-foreground mt-1">Welcome back, Admin</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            <div className="bg-card rounded-xl border border-border shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4 font-display">Recent Activity</h2>
                <div className="text-muted-foreground text-center py-10">
                    Activity chart and recent enrollments will appear here.
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
