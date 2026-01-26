import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { SidebarProvider } from '../ui/sidebar';

const AdminLayout = () => {
    const location = useLocation();
    const isPreviewPage = location.pathname.includes('/preview');

    return (
        <SidebarProvider>
            <Sidebar />
            <main className="flex-1 overflow-y-auto transition-all duration-300 ease-in-out">
                <div className={isPreviewPage ? "" : "p-4 md:p-6"}>
                    <Outlet />
                </div>
            </main>
        </SidebarProvider>
    );
};

export default AdminLayout;
