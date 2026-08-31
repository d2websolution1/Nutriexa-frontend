import { NavLink, useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiBox,
  FiShoppingBag,
  FiUsers,
  FiTag,
  FiSettings,
  FiLogOut,
  FiShield,
  FiUserCheck,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

export default function AdminSidebar({ open, onClose }) {
  const navigate = useNavigate();
  const { logoutAdmin, hasPermission, admin } = useAuth();

  const allLinks = [
    { label: "Dashboard", path: "/admin", icon: <FiGrid size={18} />, permission: "dashboard.view", end: true },
    { label: "Products", path: "/admin/products", icon: <FiBox size={18} />, permission: "products.view" },
    { label: "Orders", path: "/admin/orders", icon: <FiShoppingBag size={18} />, permission: "orders.view" },
    { label: "Customers", path: "/admin/customers", icon: <FiUsers size={18} />, permission: "customers.view" },
    { label: "Deals & Coupons", path: "/admin/deals", icon: <FiTag size={18} />, permission: "deals.view" },
    { label: "Staff & Roles", path: "/admin/staff", icon: <FiUserCheck size={18} />, permission: "staff.view" },
    { label: "Authenticator", path: "/admin/authenticator", icon: <FiShield size={18} />, permission: "authenticator.view" },
    { label: "Settings", path: "/admin/settings", icon: <FiSettings size={18} />, permission: "settings.view" },
  ];

  // Filter links based on logged in user's permissions
  const links = allLinks.filter((link) => !link.permission || hasPermission(link.permission));

  const handleLogout = () => {
    logoutAdmin();
    navigate("/admin/login", { replace: true });
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-[#1a1a1a] text-white flex flex-col z-50 transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-6 border-b border-white/10">
          <svg width="36" height="36" viewBox="0 0 56 56" className="shrink-0">
            <circle
              cx="28" cy="28" r="25.5" fill="none" stroke="#fff"
              strokeWidth="1.4" strokeDasharray="130 30" strokeLinecap="round"
              transform="rotate(-20 28 28)"
            />
            <text x="28" y="37" textAnchor="middle" fontFamily="Arial" fontWeight="800" fontSize="24">
              <tspan fill="#8a8a8a">N</tspan>
              <tspan fill="#4CAF37">X</tspan>
            </text>
          </svg>
          <div className="leading-none">
            <p className="font-extrabold text-sm tracking-wide">NUTRIEXA</p>
            <p className="text-[10px] text-gray-400 tracking-widest">ADMIN PANEL</p>
          </div>
        </div>

        {/* User Role Card */}
        <div className="px-4 py-3 mx-3 mt-3 bg-white/5 border border-white/10 rounded-lg flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#4CAF37]/20 text-[#4CAF37] font-bold flex items-center justify-center text-xs shrink-0">
            {admin?.name?.charAt(0)?.toUpperCase() || "A"}
          </div>
          <div className="overflow-hidden leading-tight flex-1">
            <p className="text-xs font-semibold text-white truncate">{admin?.name || "Admin"}</p>
            <span className="inline-block mt-0.5 text-[10px] px-1.5 py-0.2 rounded bg-[#4CAF37]/20 text-[#4CAF37] font-medium truncate max-w-full">
              {admin?.role || "Staff"}
            </span>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.label}
              to={link.path}
              end={link.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#4CAF37] text-white shadow-sm"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              {link.icon}
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white w-full transition-colors cursor-pointer"
          >
            <FiLogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}