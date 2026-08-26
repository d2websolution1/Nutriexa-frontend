import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminProtectedRoute() {
  const { admin, isAdminAuthenticated } = useAuth();
  const location = useLocation();

  const token = localStorage.getItem("adminToken");
  const isAuthenticated = isAdminAuthenticated || !!token;

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
