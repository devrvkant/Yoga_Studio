import { Navigate, Outlet } from 'react-router-dom';
import { useGetMeQuery } from '../../features/auth/authApi';

const RequireAdmin = () => {
    const { data: authData, isLoading } = useGetMeQuery();

    if (isLoading) {
        return null;
    }

    const user = authData?.data || authData;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default RequireAdmin;
