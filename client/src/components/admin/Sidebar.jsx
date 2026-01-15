import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, LogOut, ArrowLeft } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useDispatch } from 'react-redux';
import { logout as logoutAction } from '../../features/auth/authSlice';
import { useLogoutMutation } from '../../features/auth/authApi';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [logoutApi] = useLogoutMutation();

    const menuItems = [
        {
            title: 'Dashboard',
            icon: LayoutDashboard,
            path: '/admin',
        },
        {
            title: 'Enrollments',
            icon: Users,
            path: '/admin/enrollments',
        },
        {
            title: 'Manage Classes',
            icon: Users, // Can change icon if needed, maybe 'Dumbbell' or 'Calendar'
            path: '/admin/classes',
        },
        {
            title: 'Manage Courses',
            icon: BookOpen,
            path: '/admin/courses',
        },
    ];

    const handleLogout = async () => {
        try {
            await logoutApi().unwrap();
            dispatch(logoutAction());
            toast.success('Logged out successfully');
            navigate('/');
        } catch (err) {
            console.error('Logout failed', err);
            dispatch(logoutAction());
            navigate('/');
        }
    };

    return (
        <div className="w-64 bg-card h-full border-r border-border flex flex-col">
            <div className="p-6 border-b border-border">
                <div className="flex items-center gap-3">
                    <Link to="/" className="p-2 hover:bg-muted rounded-full transition-colors" title="Back to Home">
                        <ArrowLeft size={20} className="text-muted-foreground hover:text-foreground" />
                    </Link>
                    <span className="text-xl font-display font-bold text-foreground">
                        Admin Panel
                    </span>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => {
                    // Check exact match or if current path starts with the menu item path (for nested routes)
                    const isActive = location.pathname === item.path ||
                        (item.path !== '/admin' && location.pathname.startsWith(item.path + '/'));
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                                isActive
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <Icon size={20} />
                            {item.title}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-border">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                    <LogOut size={20} />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
