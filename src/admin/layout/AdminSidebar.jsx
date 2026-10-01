import { useRef, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  FiGrid,
  FiShoppingBag,
  FiBox,
  FiLayers,
  FiArchive,
  FiUsers,
  FiTag,
  FiStar,
  FiLayout,
  FiTruck,
  FiCreditCard,
  FiBell,
  FiBarChart2,
  FiCheckCircle,
  FiShield,
  FiSettings,
  FiActivity,
  FiHeadphones,
  FiLogOut,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import nutriexaLogo from "../../assets/nutriexa-logo.png";

export default function AdminSidebar({ open, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logoutAdmin } = useAuth();
  const activeLinkRef = useRef(null);

  const menuItems = [
    { label: "Dashboard", path: "/admin", icon: <FiGrid size={18} />, end: true },
    { label: "Orders", path: "/admin/orders", icon: <FiShoppingBag size={18} />, badge: "25" },
    { label: "Products", path: "/admin/products", icon: <FiBox size={18} /> },
    { label: "Product Codes", path: "/admin/authenticator", icon: <FiCheckCircle size={18} /> },
    { label: "Categories", path: "/admin/categories", icon: <FiLayers size={18} /> },
    { label: "Inventory", path: "/admin/inventory", icon: <FiArchive size={18} /> },
    { label: "Customers", path: "/admin/customers", icon: <FiUsers size={18} /> },
    { label: "Deals & Coupons", path: "/admin/deals", icon: <FiTag size={18} /> },
    { label: "Product Reviews", path: "/admin/reviews", icon: <FiStar size={18} />, badge: "12" },
    { label: "Homepage CMS", path: "/admin/cms", icon: <FiLayout size={18} /> },
    { label: "Shipping", path: "/admin/shipping", icon: <FiTruck size={18} /> },
    { label: "Payments", path: "/admin/payments", icon: <FiCreditCard size={18} /> },
    { label: "Notifications", path: "/admin/notifications", icon: <FiBell size={18} /> },
    { label: "Analytics", path: "/admin/analytics", icon: <FiBarChart2 size={18} /> },
    { label: "Users & Roles", path: "/admin/staff", icon: <FiShield size={18} /> },
    { label: "Settings", path: "/admin/settings", icon: <FiSettings size={18} /> },
    { label: "Audit Logs", path: "/admin/audit-logs", icon: <FiActivity size={18} /> },
  ];

  // Auto-scroll active menu item into view when navigating
  useEffect(() => {
    if (activeLinkRef.current) {
      activeLinkRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logoutAdmin();
    navigate("/admin/login", { replace: true });
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-[#0c121e] text-gray-300 flex flex-col z-50 transition-transform duration-300 border-r border-white/5 ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Brand Header */}
        <div className="px-6 py-5 border-b border-white/5 flex items-center gap-3 shrink-0">
          <img
            src={nutriexaLogo}
            alt="Nutriexa Logo"
            className="w-11 h-11 object-contain shrink-0 rounded-lg drop-shadow-sm"
          />
          <div>
            <h1 className="font-extrabold text-base tracking-wider text-white">NUTRIEXA</h1>
            <p className="text-[9px] tracking-widest text-[#22c55e] font-semibold uppercase">
              NUTRITION FOR EXCELLENCE
            </p>
          </div>
        </div>

        {/* Navigation items list with smooth scrolling & clear active indicator */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {menuItems.map((item) => {
            const isCurrentlyActive =
              item.end
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.label}
                to={item.path}
                end={item.end}
                onClick={onClose}
                ref={isCurrentlyActive ? activeLinkRef : null}
                className={({ isActive }) =>
                  `relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all duration-200 group ${
                    isActive
                      ? "bg-gradient-to-r from-[#2e7d32] to-[#1f5c23] text-white shadow-md shadow-emerald-950/40 ring-1 ring-emerald-500/30 font-bold"
                      : "text-gray-400 hover:text-white hover:bg-white/[0.08] hover:translate-x-1"
                  }`
                }
              >
                {/* Active left glowing pill bar */}
                {isCurrentlyActive && (
                  <span className="absolute -left-1 top-2 bottom-2 w-1.5 bg-[#4ade80] rounded-r-full shadow-md shadow-emerald-400" />
                )}

                <div className="flex items-center gap-3">
                  <span
                    className={`shrink-0 transition-all duration-200 ${
                      isCurrentlyActive
                        ? "text-emerald-300 scale-110"
                        : "group-hover:scale-110 group-hover:text-emerald-400"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`font-bold text-[11px] px-2 py-0.5 rounded-full leading-none shadow-xs transition-colors ${
                      isCurrentlyActive
                        ? "bg-white text-emerald-900"
                        : "bg-[#22c55e] text-[#0c121e]"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Need Help Support Card */}
        <div className="p-3 border-t border-white/5 shrink-0">
          <div className="bg-[#131c2d] border border-white/5 rounded-xl p-3.5 text-left">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#22c55e]/15 text-[#22c55e] flex items-center justify-center">
                <FiHeadphones size={16} />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Need Help?</p>
                <p className="text-[10px] text-gray-400">We're here to help you</p>
              </div>
            </div>
            <a
              href="mailto:support@nutriexa.com"
              className="block text-center w-full py-1.5 px-3 bg-[#1e293b] hover:bg-[#2e7d32] text-gray-200 hover:text-white text-xs font-semibold rounded-lg transition-colors border border-white/5"
            >
              Contact Support
            </a>
          </div>

          <button
            onClick={handleLogout}
            className="mt-2 flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg w-full transition-colors cursor-pointer"
          >
            <FiLogOut size={15} />
            Logout from Admin
          </button>
        </div>
      </aside>
    </>
  );
}