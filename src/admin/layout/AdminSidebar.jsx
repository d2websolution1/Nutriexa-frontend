import { NavLink, useNavigate } from "react-router-dom";
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
  FiFileText,
  FiTruck,
  FiCreditCard,
  FiBell,
  FiBarChart2,
  FiShield,
  FiSettings,
  FiActivity,
  FiHeadphones,
  FiLogOut,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

export default function AdminSidebar({ open, onClose }) {
  const navigate = useNavigate();
  const { logoutAdmin } = useAuth();

  const menuItems = [
    { label: "Dashboard", path: "/admin", icon: <FiGrid size={18} />, end: true },
    { label: "Orders", path: "/admin/orders", icon: <FiShoppingBag size={18} />, badge: "25" },
    { label: "Products", path: "/admin/products", icon: <FiBox size={18} /> },
    { label: "Categories", path: "/admin/categories", icon: <FiLayers size={18} /> },
    { label: "Inventory", path: "/admin/inventory", icon: <FiArchive size={18} /> },
    { label: "Customers", path: "/admin/customers", icon: <FiUsers size={18} /> },
    { label: "Deals & Coupons", path: "/admin/deals", icon: <FiTag size={18} /> },
    { label: "Product Reviews", path: "/admin/reviews", icon: <FiStar size={18} />, badge: "12" },
    { label: "Homepage CMS", path: "/admin/cms", icon: <FiLayout size={18} /> },
    { label: "Content / Pages", path: "/admin/content-pages", icon: <FiFileText size={18} /> },
    { label: "Shipping", path: "/admin/shipping", icon: <FiTruck size={18} /> },
    { label: "Payments", path: "/admin/payments", icon: <FiCreditCard size={18} /> },
    { label: "Notifications", path: "/admin/notifications", icon: <FiBell size={18} /> },
    { label: "Analytics", path: "/admin/analytics", icon: <FiBarChart2 size={18} /> },
    { label: "Users & Roles", path: "/admin/staff", icon: <FiShield size={18} /> },
    { label: "Settings", path: "/admin/settings", icon: <FiSettings size={18} /> },
    { label: "Audit Logs", path: "/admin/audit-logs", icon: <FiActivity size={18} /> },
  ];

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
        <div className="px-6 py-5 border-b border-white/5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#15803d] to-[#22c55e] flex items-center justify-center font-black text-white text-base shadow-sm">
            NX
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-wider text-white">NUTRIEXA</h1>
            <p className="text-[9px] tracking-widest text-[#22c55e] font-semibold uppercase">
              NUTRITION FOR EXCELLENCE
            </p>
          </div>
        </div>

        {/* Navigation items list */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
          {menuItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-[13.5px] font-medium transition-all group ${
                  isActive
                    ? "bg-[#2e7d32] text-white font-semibold shadow-md shadow-green-900/30"
                    : "text-gray-400 hover:text-white hover:bg-white/[0.06]"
                }`
              }
            >
              <div className="flex items-center gap-3">
                <span className="shrink-0 transition-transform group-hover:scale-110">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="bg-[#22c55e] text-[#0c121e] font-bold text-[11px] px-2 py-0.5 rounded-full leading-none shadow-xs">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Need Help Support Card */}
        <div className="p-3 border-t border-white/5">
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