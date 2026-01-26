import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Calendar, LogOut, Home } from 'lucide-react';
import { cn } from '../../lib/utils';
import logoImg from '../../assets/logos/logo.png';
import { useDispatch } from 'react-redux';
import { logout as logoutAction } from '../../features/auth/authSlice';
import { useLogoutMutation, authApi } from '../../features/auth/authApi';
import { toast } from 'sonner';
import { Outlet } from 'react-router-dom';

const StudentSidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [logoutApi] = useLogoutMutation();

    const handleLogout = async () => {
        try {
            await logoutApi().unwrap();
            dispatch(logoutAction());
            dispatch(authApi.util.resetApiState());
            toast.success('Logged out successfully');
            navigate('/');
        } catch (err) {
            console.error('Logout failed', err);
            dispatch(logoutAction());
            dispatch(authApi.util.resetApiState());
            navigate('/');
        }
    };

    const links = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'My Classes', path: '/dashboard/my-classes', icon: Calendar },
        { name: 'My Courses', path: '/dashboard/my-courses', icon: BookOpen },
        { name: 'Back to Home', path: '/', icon: Home },
    ];

    return (
        <div className="w-64 bg-white border-r border-border h-full flex flex-col">
            <div className="p-6 border-b border-border flex items-center gap-3">
                <img src={logoImg} alt="Logo" className="w-8 h-8 object-contain" />
                <span className="font-display font-bold text-xl">Student Portal</span>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {links.map((link) => {
                    const Icon = link.icon;
                    // Improved matching for nested routes within dashboard
                    const isActive = link.path === '/'
                        ? location.pathname === '/'
                        : link.path === '/dashboard'
                            ? location.pathname === link.path
                            : location.pathname.startsWith(link.path);

                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={cn(
                                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-muted-foreground hover:bg-slate-50 hover:text-foreground'
                            )}
                        >
                            <Icon size={20} />
                            {link.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-border">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                    <LogOut size={20} />
                    Logout
                </button>
            </div>
        </div>
    );
};

const StudentLayout = () => {
    const location = useLocation();

    // Check if current route is a player page
    // Matches /dashboard/my-courses/:id or /dashboard/my-classes/:id
    const isPlayerPage = location.pathname.match(/^\/dashboard\/my-(courses|classes)\/[^/]+$/);

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            <StudentSidebar />
            <main className="flex-1 overflow-y-auto bg-slate-50/50">
                <div className={cn(
                    "w-full h-full",
                    !isPlayerPage && "p-4 md:p-8 max-w-7xl mx-auto"
                )}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default StudentLayout;
