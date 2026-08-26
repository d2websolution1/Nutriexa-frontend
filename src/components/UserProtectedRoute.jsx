import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function UserProtectedRoute() {
  const { user, isUserAuthenticated } = useAuth();
  const location = useLocation();

  const token = localStorage.getItem("userToken");
  const isAuthenticated = isUserAuthenticated || !!token;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
