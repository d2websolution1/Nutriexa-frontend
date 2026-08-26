import { createContext, useContext, useEffect, useState } from "react";

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

  // Admin state
  const [admin, setAdmin] = useState(() => {
    try {
      const saved = localStorage.getItem("adminInfo");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

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