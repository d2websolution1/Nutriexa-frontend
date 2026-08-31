import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { API_URL } from "../config";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Customer User state
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("userInfo");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Admin / Staff state
  const [admin, setAdmin] = useState(() => {
    try {
      const saved = localStorage.getItem("adminInfo");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Fetch latest admin profile & permissions on mount or when token is present
  const refreshAdminProfile = useCallback(async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) return null;

    try {
      const res = await fetch(`${API_URL}/api/admin/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("adminInfo", JSON.stringify(data.admin));
        setAdmin(data.admin);
        return data.admin;
      } else if (res.status === 401 || res.status === 403) {
        // Token expired or deactivated
        logoutAdmin();
      }
    } catch (err) {
      console.warn("Could not refresh admin profile:", err);
    }
    return null;
  }, []);

  useEffect(() => {
    if (localStorage.getItem("adminToken")) {
      refreshAdminProfile();
    }
  }, [refreshAdminProfile]);

  // User Actions
  const loginUser = (userData, token) => {
    localStorage.setItem("userToken", token);
    localStorage.setItem("userInfo", JSON.stringify(userData));
    setUser(userData);
  };

  const logoutUser = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userInfo");
    setUser(null);
  };

  // Admin Actions
  const loginAdmin = (adminData, token) => {
    localStorage.setItem("adminToken", token);
    localStorage.setItem("adminInfo", JSON.stringify(adminData));
    setAdmin(adminData);
  };

  const logoutAdmin = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    setAdmin(null);
  };

  // RBAC Permission Helper
  const hasPermission = useCallback((permissionKey) => {
    if (!admin) return false;
    // Super Admin has all permissions
    if (admin.role === "Super Admin") return true;

    const perms = Array.isArray(admin.permissions) ? admin.permissions : [];
    if (perms.includes("*")) return true;

    return perms.includes(permissionKey);
  }, [admin]);

  // Check multiple permissions (OR logic)
  const hasAnyPermission = useCallback((permissionKeys = []) => {
    if (!admin) return false;
    if (admin.role === "Super Admin") return true;

    const perms = Array.isArray(admin.permissions) ? admin.permissions : [];
    if (perms.includes("*")) return true;

    return permissionKeys.some((p) => perms.includes(p));
  }, [admin]);

  // Check multiple permissions (AND logic)
  const hasAllPermissions = useCallback((permissionKeys = []) => {
    if (!admin) return false;
    if (admin.role === "Super Admin") return true;

    const perms = Array.isArray(admin.permissions) ? admin.permissions : [];
    if (perms.includes("*")) return true;

    return permissionKeys.every((p) => perms.includes(p));
  }, [admin]);

  // Aliases for compatibility
  const login = loginUser;
  const logout = logoutUser;

  const isUserAuthenticated = !!user && !!localStorage.getItem("userToken");
  const isAdminAuthenticated = !!admin && !!localStorage.getItem("adminToken");

  return (
    <AuthContext.Provider
      value={{
        user,
        admin,
        loginUser,
        logoutUser,
        loginAdmin,
        logoutAdmin,
        refreshAdminProfile,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        login,
        logout,
        isUserAuthenticated,
        isAdminAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}