import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

/**
 * Client-side route guard. This is only a UX convenience: the API enforces
 * authentication and roles on every request.
 */
const ProtectedRoute = ({ element, allowedRoles }) => {
  const { isLoggedIn, userRole } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (allowedRoles && !allowedRoles.includes(userRole)) return <Navigate to="/" replace />;

  return element;
};

export default ProtectedRoute;
