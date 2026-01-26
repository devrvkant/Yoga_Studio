import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetMeQuery } from '../../features/auth/authApi';
import { selectCurrentUser } from '../../features/auth/authSlice';

const PublicOnly = () => {
    const { data: authData, isLoading } = useGetMeQuery();
    const reduxUser = useSelector(selectCurrentUser);

    // Use reduxUser if available (immediate after login), otherwise fall back to query data
    const user = reduxUser || authData?.data || authData;

    if (isLoading && !user) {
        return null;
    }

    return user ? <Navigate to="/" replace /> : <Outlet />;
};

export default PublicOnly;
