import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

const AdminLayout = () => {
    const location = useLocation(); // Make sure to import useLocation
    const isPreviewPage = location.pathname.includes('/preview');

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
                <div className={isPreviewPage ? "" : "p-4 md:p-6"}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
