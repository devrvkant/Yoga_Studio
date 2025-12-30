import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../features/auth/authSlice';

const PublicOnly = () => {
    const user = useSelector(selectCurrentUser);

    return user ? <Navigate to="/" replace /> : <Outlet />;
};

export default PublicOnly;
