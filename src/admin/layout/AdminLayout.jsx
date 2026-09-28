import { useState, useEffect, Component } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import { useTheme } from "../../context/ThemeContext";

class AdminErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Admin Page Runtime Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white dark:bg-[#111722] border border-rose-200 dark:border-rose-900/50 rounded-2xl p-6 text-center my-8 max-w-lg mx-auto shadow-lg">
          <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 mx-auto mb-3 flex items-center justify-center font-bold text-xl">
            ⚠️
          </div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1">
            Admin View Encountered an Error
          </h2>
          <p className="text-xs text-rose-600 dark:text-rose-400 mb-4 font-mono break-words">
            {this.state.error?.message || "An unexpected error occurred while rendering this page."}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow transition cursor-pointer"
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { adminTheme } = useTheme();

  // Apply admin theme when entering admin panel, restore frontend theme on unmount
  useEffect(() => {
    const root = document.documentElement;
    if (adminTheme === "dark") {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
    }

    return () => {
      // Restore frontend theme on unmount (navigating away from admin)
      const frontendTheme = localStorage.getItem("nutriexa_theme") || "light";
      if (frontendTheme === "dark") {
        root.classList.add("dark");
        root.setAttribute("data-theme", "dark");
      } else {
        root.classList.remove("dark");
        root.setAttribute("data-theme", "light");
      }
    };
  }, [adminTheme]);

  return (
    <div className={`flex min-h-screen ${adminTheme === "dark" ? "bg-[#0b0e14] text-gray-100" : "bg-[#f7f8f6] text-gray-900"}`}>
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6">
          <AdminErrorBoundary>
            <Outlet />
          </AdminErrorBoundary>
        </main>
      </div>
    </div>
  );
}