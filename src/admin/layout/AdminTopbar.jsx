import { FiMenu, FiBell, FiSearch } from "react-icons/fi";

export default function AdminTopbar({ onMenuClick }) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 md:px-6 py-3.5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-[#1a1a1a] p-1.5 rounded-md hover:bg-gray-100"
        >
          <FiMenu size={22} />
        </button>

        <div className="hidden md:flex items-center gap-2 bg-[#f5f6f4] rounded-md px-3 py-2 w-72">
          <FiSearch className="text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search orders, products, users..."
            className="bg-transparent text-sm outline-none w-full placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative text-gray-500 hover:text-[#4CAF37]">
          <FiBell size={20} />
          <span className="absolute -top-1.5 -right-1.5 bg-[#4CAF37] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
            3
          </span>
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[#4CAF37]/10 text-[#4CAF37] font-bold flex items-center justify-center text-sm">
            A
          </div>
          <div className="hidden sm:block leading-tight">
            <p className="text-sm font-semibold text-[#1a1a1a]">Admin</p>
            <p className="text-xs text-gray-500">Super Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}