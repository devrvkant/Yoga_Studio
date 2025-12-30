import { Navigate, Outlet } from 'react-router-dom';
import { useGetMeQuery } from '../../features/auth/authApi';

const PublicOnly = () => {
    const { data: authData, isLoading } = useGetMeQuery();

    if (isLoading) {
        return null;
    }

    const user = authData?.data || authData;

    return user ? <Navigate to="/" replace /> : <Outlet />;
};

export default PublicOnly;
