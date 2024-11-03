import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    toast.error("You don't have permission to access this page", {
      position: 'top-right',
      autoClose: 3000,
    });
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;