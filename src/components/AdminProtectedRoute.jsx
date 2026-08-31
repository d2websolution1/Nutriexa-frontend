import { Navigate, Outlet, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiShieldOff, FiArrowLeft, FiHome } from "react-icons/fi";

export default function AdminProtectedRoute() {
  const { isAdminAuthenticated } = useAuth();
  const location = useLocation();

  const token = localStorage.getItem("adminToken");
  const isAuthenticated = isAdminAuthenticated || !!token;

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

/**
 * Route wrapper that checks for required RBAC permission
 * @param {Object} props
 * @param {string|string[]} props.permission Required permission or list of permissions (OR logic)
 * @param {React.ReactNode} props.children
 */
export function PermissionRoute({ permission, children }) {
  const { hasPermission, hasAnyPermission, admin } = useAuth();

  const isAllowed = Array.isArray(permission)
    ? hasAnyPermission(permission)
    : hasPermission(permission);

  if (!isAllowed) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
            <FiShieldOff size={32} />
          </div>
          <h2 className="text-xl font-bold text-[#1a1a1a] mb-2">
            Access Restricted
          </h2>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            Your role <span className="font-semibold text-gray-700">({admin?.role || "Staff"})</span> does not have permission to view or manage this section.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/admin"
              className="flex items-center gap-2 bg-[#4CAF37] text-white text-xs font-semibold px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              <FiHome size={15} /> Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children || <Outlet />;
}

