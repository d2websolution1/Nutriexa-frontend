import { useState, useEffect, useRef } from "react";
import {
  FiMenu,
  FiBell,
  FiSearch,
  FiExternalLink,
  FiSun,
  FiMoon,
  FiShoppingBag,
  FiAlertTriangle,
  FiBriefcase,
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { API_URL as API_BASE } from "../../config";

export default function AdminTopbar({ onMenuClick }) {
  const { admin } = useAuth();
  const { toggleAdminTheme, isAdminDark } = useTheme();
  const navigate = useNavigate();

  // Notification states
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // "all" | "orders" | "alerts"
  const [readIds, setReadIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("nutriexa_admin_read_notifs") || "[]");
    } catch {
      return [];
    }
  });

  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  // Force search input styles with !important (beats global CSS overrides)
  useEffect(() => {
    const el = searchRef.current;
    if (!el) return;
    const textColor = isAdminDark ? "#f3f4f6" : "#1f2937";
    el.style.setProperty("background", "transparent", "important");
    el.style.setProperty("background-color", "transparent", "important");
    el.style.setProperty("box-shadow", "none", "important");
    el.style.setProperty("border", "none", "important");
    el.style.setProperty("color", textColor, "important");
    el.style.setProperty("-webkit-text-fill-color", textColor, "important");
    el.style.setProperty("caret-color", textColor, "important");
  }, [isAdminDark]);

  // Fetch real notifications from database
  const fetchNotifications = async () => {
    setNotifLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_BASE}/api/admin/dashboard/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      } else {
        // Fallback default alerts if endpoint unavailable
        setNotifications([
          {
            id: "fallback-1",
            type: "order",
            title: "Store Orders Active",
            message: "Check Orders panel for new customer payments and delivery updates.",
            time: new Date().toISOString(),
            link: "/admin/orders",
          },
          {
            id: "fallback-2",
            type: "stock",
            title: "Warehouse Inventory",
            message: "Real-time stock alerts are tracked on the Inventory page.",
            time: new Date().toISOString(),
            link: "/admin/inventory",
          },
        ]);
      }
    } catch (err) {
      console.warn("Notifications load failed:", err);
    } finally {
      setNotifLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notifOpen]);

  const markAllAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    setReadIds(allIds);
    localStorage.setItem("nutriexa_admin_read_notifs", JSON.stringify(allIds));
  };

  const markOneAsRead = (id) => {
    if (!readIds.includes(id)) {
      const updated = [...readIds, id];
      setReadIds(updated);
      localStorage.setItem("nutriexa_admin_read_notifs", JSON.stringify(updated));
    }
  };

  const unreadCount = notifications.filter((n) => !readIds.includes(n.id)).length;

  const filteredNotifs = notifications.filter((n) => {
    if (activeTab === "orders") return n.type === "order";
    if (activeTab === "alerts") return n.type === "stock" || n.type === "distributor";
    return true;
  });

  const formatTime = (isoString) => {
    if (!isoString) return "Recently";
    try {
      const diff = Date.now() - new Date(isoString).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return "Just now";
      if (mins < 60) return `${mins}m ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h ago`;
      const days = Math.floor(hrs / 24);
      return `${days}d ago`;
    } catch {
      return "Recently";
    }
  };

  const notifHoverTimeout = useRef(null);

  const handleNotifMouseEnter = () => {
    if (notifHoverTimeout.current) clearTimeout(notifHoverTimeout.current);
    setNotifOpen(true);
    fetchNotifications();
  };

  const handleNotifMouseLeave = () => {
    notifHoverTimeout.current = setTimeout(() => {
      setNotifOpen(false);
    }, 280);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#0c121e]/95 backdrop-blur-md border-b border-gray-100 dark:border-white/10 px-4 md:px-8 py-3 flex items-center justify-between gap-4 transition-colors">
      {/* Left Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-700 dark:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer"
          aria-label="Open menu"
        >
          <FiMenu size={22} />
        </button>

        <div
          className="flex items-center gap-2.5 transition-colors rounded-xl px-4 py-2 w-full"
          style={{
            backgroundColor: isAdminDark ? "rgba(255,255,255,0.06)" : "rgba(249,250,251,0.8)",
            border: isAdminDark
              ? "1px solid rgba(255,255,255,0.1)"
              : "1px solid rgb(243,244,246)",
          }}
        >
          <FiSearch
            className="shrink-0"
            size={17}
            style={{ color: isAdminDark ? "#6b7280" : "#9ca3af" }}
          />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search for products, orders, customers..."
            className="admin-search-input text-sm outline-none w-full placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* Admin Dark / Light Mode Toggle Button */}
        <button
          onClick={toggleAdminTheme}
          className="p-2 text-gray-600 dark:text-gray-300 hover:text-[#2e7d32] dark:hover:text-[#4ade80] hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-all cursor-pointer flex items-center justify-center"
          title={isAdminDark ? "Switch to Light Mode (Admin)" : "Switch to Dark Mode (Admin)"}
          aria-label="Toggle Admin Dark Mode"
        >
          {isAdminDark ? (
            <FiSun size={19} className="text-amber-400 animate-spin-slow" />
          ) : (
            <FiMoon size={19} />
          )}
        </button>

        {/* Notification Bell Dropdown */}
        <div
          className="relative"
          ref={dropdownRef}
          onMouseEnter={handleNotifMouseEnter}
          onMouseLeave={handleNotifMouseLeave}
        >
          <button
            onClick={() => {
              setNotifOpen((prev) => !prev);
              if (!notifOpen) fetchNotifications();
            }}
            className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-[#2e7d32] dark:hover:text-[#4ade80] hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <FiBell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-[#22c55e] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-[#0c121e] animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Popover Dropdown */}
          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-[#111722] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 p-0 z-50 overflow-hidden animate-fadeIn text-left">
              {/* Dropdown Header */}
              <div className="px-4 py-3 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="bg-[#22c55e]/15 text-[#22c55e] text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] font-semibold text-[#22c55e] hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Tabs: All / Orders / Alerts */}
              <div className="flex px-3 pt-2 gap-1 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02]">
                {[
                  { key: "all", label: "All" },
                  { key: "orders", label: "Orders" },
                  { key: "alerts", label: "Inventory & Leads" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer ${activeTab === tab.key
                        ? "text-[#22c55e] border-b-2 border-[#22c55e] bg-white dark:bg-[#111722]"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Notification List */}
              <div className="max-h-[320px] overflow-y-auto divide-y divide-gray-50 dark:divide-white/5">
                {notifLoading && notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-400">Loading notifications...</div>
                ) : filteredNotifs.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-400">No notifications in this category.</div>
                ) : (
                  filteredNotifs.map((n) => {
                    const isRead = readIds.includes(n.id);
                    return (
                      <div
                        key={n.id}
                        onClick={() => {
                          markOneAsRead(n.id);
                          if (n.link) {
                            setNotifOpen(false);
                            navigate(n.link);
                          }
                        }}
                        className={`p-3.5 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer ${!isRead ? "bg-emerald-50/30 dark:bg-[#22c55e]/5" : ""
                          }`}
                      >
                        {/* Type Icon */}
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${n.type === "order"
                              ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                              : n.type === "stock"
                                ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                : "bg-emerald-50 dark:bg-emerald-500/10 text-[#22c55e]"
                            }`}
                        >
                          {n.type === "order" ? (
                            <FiShoppingBag size={15} />
                          ) : n.type === "stock" ? (
                            <FiAlertTriangle size={15} />
                          ) : (
                            <FiBriefcase size={15} />
                          )}
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                              {n.title}
                            </p>
                            <span className="text-[10px] text-gray-400 shrink-0">
                              {formatTime(n.time)}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-0.5 line-clamp-2">
                            {n.message}
                          </p>
                        </div>

                        {/* Unread dot */}
                        {!isRead && (
                          <span className="w-2 h-2 rounded-full bg-[#22c55e] shrink-0 mt-2" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Dropdown Footer */}
              <div className="p-2.5 bg-gray-50/80 dark:bg-white/[0.02] border-t border-gray-100 dark:border-white/10 text-center">
                <Link
                  to="/admin/notifications"
                  onClick={() => setNotifOpen(false)}
                  className="text-xs font-semibold text-[#22c55e] hover:underline block w-full py-1"
                >
                  View All Notifications &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* View Store Button */}
        <Link
          to="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-[#2e7d32] dark:hover:text-[#4ade80] px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
        >
          <span>View Store</span>
          <FiExternalLink size={13} />
        </Link>

        {/* Admin Profile */}
        <div className="flex items-center gap-3 pl-3 border-l border-gray-100 dark:border-white/10">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#2e7d32] to-[#4caf50] text-white font-bold flex items-center justify-center text-sm shadow-xs uppercase">
            {admin?.name?.charAt(0) || "S"}
          </div>
          <div className="hidden sm:block text-left leading-tight">
            <p className="text-xs font-bold text-gray-900 dark:text-white">{admin?.name || "Super Admin"}</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">{admin?.role || "Administrator"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}