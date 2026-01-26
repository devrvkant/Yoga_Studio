import { useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Outlet } from 'react-router-dom';
import { StudentSidebar } from './StudentSidebar';
import { SidebarProvider } from '../ui/sidebar';

const StudentLayout = () => {
    const location = useLocation();

    // Check if current route is a player page
    const isPlayerPage = location.pathname.match(/^\/dashboard\/my-(courses|classes)\/[^/]+$/);

    return (
        <SidebarProvider>
            <StudentSidebar />
            <main className="flex-1 overflow-y-auto bg-slate-50/50 transition-all duration-300 ease-in-out">
                <div className={cn(
                    "w-full h-full",
                    !isPlayerPage && "p-4 md:p-8 max-w-7xl mx-auto"
                )}>
                    <Outlet />
                </div>
            </main>
        </SidebarProvider>
    );
};

export default StudentLayout;
