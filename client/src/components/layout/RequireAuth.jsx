import { useLocation, Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetMeQuery } from '../../features/auth/authApi';
import { selectCurrentUser } from '../../features/auth/authSlice';

const RequireAuth = () => {
    const { data: authData, isLoading } = useGetMeQuery();
    const reduxUser = useSelector(selectCurrentUser);
    const location = useLocation();

    // Use reduxUser if available (immediate after login), otherwise fall back to query data
    // This prevents redirecting while query might be refetching or stale
    const user = reduxUser || authData?.data || authData;

    if (isLoading && !user) {
        return null;
    }

    return user ? (
        <Outlet />
    ) : (
        <Navigate to="/login" state={{ from: location }} replace />
    );
};

export default RequireAuth;
