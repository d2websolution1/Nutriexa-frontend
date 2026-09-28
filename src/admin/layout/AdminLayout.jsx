import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import { useTheme } from "../../context/ThemeContext";

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
    <div className={`flex min-h-screen ${adminTheme === "dark" ? "bg-[#0b0e14]" : "bg-[#f7f8f6]"}`}>
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}