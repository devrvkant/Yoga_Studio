import { useLocation, useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Calendar, LogOut, Home, ArrowLeft } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { logout as logoutAction } from '../../features/auth/authSlice';
import { useLogoutMutation, authApi } from '../../features/auth/authApi';
import {
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarFooter,
    SidebarItem,
    SidebarTrigger,
    useSidebar
} from '../ui/sidebar';
import { cn } from '../../lib/utils';

export function StudentSidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [logoutApi] = useLogoutMutation();
    const { open } = useSidebar();

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
        <Sidebar>
            <SidebarHeader className="flex justify-between items-center">
                <div className={cn("flex items-center gap-3 overflow-hidden transition-all duration-300", open ? "opacity-100" : "opacity-0 w-0")}>
                    <Link to="/" className="p-1 hover:bg-muted rounded-full transition-colors shrink-0" title="Back to Home">
                        <ArrowLeft size={18} className="text-muted-foreground hover:text-foreground" />
                    </Link>
                    <span className="font-display font-bold text-xl whitespace-nowrap">Student Portal</span>
                </div>
                <SidebarTrigger />
            </SidebarHeader>

            <SidebarContent>
                {links.map((link) => {
                    // Improved matching for active state
                    const isActive = link.path === '/'
                        ? location.pathname === '/'
                        : link.path === '/dashboard'
                            ? location.pathname === link.path
                            : location.pathname.startsWith(link.path);

                    return (
                        <SidebarItem
                            key={link.path}
                            to={link.path}
                            icon={link.icon}
                            label={link.name}
                            isActive={isActive}
                        />
                    );
                })}
            </SidebarContent>

            <SidebarFooter>
                <SidebarItem
                    icon={LogOut}
                    label="Logout"
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                />
            </SidebarFooter>
        </Sidebar>
    );
}
