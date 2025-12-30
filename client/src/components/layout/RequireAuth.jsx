import { useLocation, Navigate, Outlet } from 'react-router-dom';
import { useGetMeQuery } from '../../features/auth/authApi';

const RequireAuth = () => {
    const { data: authData, isLoading } = useGetMeQuery();
    const location = useLocation();

    if (isLoading) {
        return null;
    }

    const user = authData?.data || authData;

    return user ? (
        <Outlet />
    ) : (
        <Navigate to="/login" state={{ from: location }} replace />
    );
};

export default RequireAuth;
