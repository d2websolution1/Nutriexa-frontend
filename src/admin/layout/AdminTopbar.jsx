import { FiMenu, FiBell, FiSearch, FiExternalLink } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminTopbar({ onMenuClick }) {
  const { admin } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 md:px-8 py-3 flex items-center justify-between gap-4">
      {/* Left Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-700 p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
          aria-label="Open menu"
        >
          <FiMenu size={22} />
        </button>

        <div className="flex items-center gap-2.5 bg-gray-50/80 hover:bg-gray-100/80 transition-colors border border-gray-100 rounded-xl px-4 py-2 w-full">
          <FiSearch className="text-gray-400 shrink-0" size={17} />
          <input
            type="text"
            placeholder="Search for products, orders, customers..."
            className="bg-transparent text-sm outline-none w-full placeholder:text-gray-400 text-gray-800"
          />
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Notification Bell */}
        <div className="relative">
          <button 
            className="relative p-2 text-gray-600 hover:text-[#2e7d32] hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
            title="Notifications"
          >
            <FiBell size={20} />
            <span className="absolute top-1 right-1 bg-[#22c55e] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
              8
            </span>
          </button>
        </div>

        {/* View Store Button */}
        <Link
          to="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-[#2e7d32] px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <span>View Store</span>
          <FiExternalLink size={13} />
        </Link>

        {/* Admin Profile */}
        <div className="flex items-center gap-3 pl-3 border-l border-gray-100">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#2e7d32] to-[#4caf50] text-white font-bold flex items-center justify-center text-sm shadow-xs uppercase">
            {admin?.name?.charAt(0) || "S"}
          </div>
          <div className="hidden sm:block text-left leading-tight">
            <p className="text-xs font-bold text-gray-900">{admin?.name || "Super Admin"}</p>
            <p className="text-[11px] text-gray-500">{admin?.role || "Administrator"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}