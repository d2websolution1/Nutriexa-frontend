import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("nutriexa_theme");
    return saved || "light";
  });

  // Separate admin theme that does NOT affect the frontend store
  const [adminTheme, setAdminTheme] = useState(() => {
    const saved = localStorage.getItem("nutriexa_admin_theme");
    return saved || "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    // Check if currently on admin route
    const isAdmin = window.location.pathname.startsWith("/admin");
    const activeTheme = isAdmin ? adminTheme : theme;

    if (activeTheme === "dark") {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
    }
    localStorage.setItem("nutriexa_theme", theme);
    localStorage.setItem("nutriexa_admin_theme", adminTheme);
  }, [theme, adminTheme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const toggleAdminTheme = () => {
    setAdminTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      // Immediately apply since we're on admin page
      const root = document.documentElement;
      if (next === "dark") {
        root.classList.add("dark");
        root.setAttribute("data-theme", "dark");
      } else {
        root.classList.remove("dark");
        root.setAttribute("data-theme", "light");
      }
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === "dark", adminTheme, toggleAdminTheme, isAdminDark: adminTheme === "dark" }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
