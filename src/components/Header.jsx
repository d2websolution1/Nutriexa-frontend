import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  FiSearch,
  FiUser,
  FiShoppingCart,
  FiHelpCircle,
  FiX,
  FiLogOut,
  FiChevronRight,
  FiHome,
  FiPackage,
  FiTag,
  FiShield,
  FiMapPin,
  FiInfo,
  FiPhone,
} from "react-icons/fi";
import { TbTruckDelivery, TbShieldCheck, TbPackage } from "react-icons/tb";
import { HiMenu } from "react-icons/hi";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

import { API_URL as API_BASE } from "../config";

const CATEGORY_LABELS = {
  "whey-proteins": "Whey Proteins",
  "mass-gainers": "Mass Gainers",
  "pre-workouts": "Pre-Workouts",
  "amino-acids": "Amino Acids",
  "health-wellness": "Health & Wellness",
  accessories: "Accessories",
};

const NAV_ICONS = {
  Home: FiHome,
  Products: FiPackage,
  Deals: FiTag,
  Authenticator: FiShield,
  "Track Your Order": TbPackage,
  "About Us": FiInfo,
  "Contact Us": FiPhone,
};

export default function Header() {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const { cartCount } = useCart();
  const { user, admin, logout, logoutAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // ---- Profile dropdown state ----
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // ---- Mobile hamburger drawer state ----
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/products`)
      .then((r) => r.json())
      .then((data) => {
        const active = Array.isArray(data) ? data.filter((p) => p.status === "Active") : [];
        const built = Object.entries(CATEGORY_LABELS).map(([slug, label]) => {
          const product = active.find((p) => p.category === slug);
          const imgPath = product?.image;
          const image = imgPath
            ? imgPath.startsWith("http") ? imgPath : `${API_BASE}${imgPath}`
            : null;
          return { slug, label, image };
        });
        setCategories(built);
      })
      .catch(() => {});
  }, []);

  // ---- Search state ----
  const [allProducts, setAllProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchBoxRef = useRef(null);
  const mobileSearchBoxRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 80) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch all products once for searching
  useEffect(() => {
    setSearchLoading(true);
    fetch(`${API_BASE}/api/products`)
      .then((res) => res.json())
      .then((data) => setAllProducts(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Failed to load products for search:", err))
      .finally(() => setSearchLoading(false));
  }, []);

  // Filter as user types
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const q = searchQuery.trim().toLowerCase();
    const matches = allProducts
      .filter(
        (p) =>
          p.status === "Active" &&
          (p.name?.toLowerCase().includes(q) ||
            p.category?.toLowerCase().includes(q) ||
            p.variant?.toLowerCase().includes(q))
      )
      .slice(0, 6);

    setSearchResults(matches);
  }, [searchQuery, allProducts]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(e.target) &&
        mobileSearchBoxRef.current &&
        !mobileSearchBoxRef.current.contains(e.target)
      ) {
        setShowResults(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setShowResults(false);
    navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleResultClick = (productId) => {
    setShowResults(false);
    setSearchQuery("");
    navigate(`/product/${productId}`);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
  };

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Products", path: "/products" },
    { label: "Deals", path: "/deals" },
    { label: "Authenticator", path: "/authenticator" },
    { label: "Track Your Order", path: "/track-order" },
    { label: "About Us", path: "/about" },
    { label: "Contact Us", path: "/contact" },
  ];

  // ---- Reusable search results dropdown ----
  const SearchDropdown = () => (
    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-100 rounded-lg shadow-xl z-50 overflow-hidden max-h-96 overflow-y-auto">
      {searchLoading && (
        <p className="text-xs text-gray-400 text-center py-4">Loading...</p>
      )}

      {!searchLoading && searchResults.length === 0 && searchQuery.trim() && (
        <p className="text-xs text-gray-500 text-center py-6">
          No products found for "{searchQuery}"
        </p>
      )}

      {!searchLoading &&
        searchResults.map((product) => (
          <button
            key={product.id}
            onClick={() => handleResultClick(product.id)}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#f7f8f6] text-left border-b border-gray-50 last:border-0"
          >
            <div className="w-10 h-10 rounded-md bg-[#f3f6f2] overflow-hidden shrink-0">
              {product.image ? (
                <img
                  src={`${API_BASE}${product.image}`}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-400">
                  No Image
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#1a1a1a] truncate">
                {product.name}
              </p>
              <p className="text-[11px] text-gray-500 truncate">
                {product.variant}
              </p>
            </div>
            <p className="text-xs font-bold text-[#4CAF37] shrink-0">
              ₹{Number(product.price).toLocaleString("en-IN")}
            </p>
          </button>
        ))}

      {!searchLoading && searchResults.length > 0 && (
        <button
          onClick={handleSearchSubmit}
          className="w-full text-center text-xs font-semibold text-[#4CAF37] py-2.5 hover:bg-[#f7f8f6] border-t border-gray-50"
        >
          View all results for "{searchQuery}"
        </button>
      )}
    </div>
  );

  return (
    <>
      <header
        className={`w-full sticky top-0 z-50 shadow-sm transition-transform duration-300 ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        {/* Top announcement strip */}
        <div className="bg-[#4CAF37] text-[#1a1a1a] text-center text-[10px] sm:text-xs md:text-sm font-medium py-2 px-3 md:px-4 flex items-center justify-center gap-2 flex-wrap">
          <TbTruckDelivery size={16} className="shrink-0" />
          <span className="text-center">
            Free Shipping on Orders Above ₹1999 &nbsp;|&nbsp; 100% Authentic
            Supplements &nbsp;|&nbsp; Trusted by 50,000+ Customers
          </span>
        </div>

        {/* Main header row */}
        <div className="bg-white flex items-center justify-between gap-3 md:gap-6 px-3 sm:px-4 md:px-10 py-3 md:py-4">

          {/* Hamburger — mobile only, LEFT side */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-[#1a1a1a] hover:bg-gray-100 transition-colors shrink-0"
            aria-label="Open menu"
          >
            <HiMenu size={24} />
          </button>

          <Link to="/" className="flex items-center gap-2 md:gap-3 shrink-0">
            <svg
              width="44"
              height="44"
              viewBox="0 0 56 56"
              className="shrink-0 md:w-14 md:h-14"
            >
              <circle
                cx="28"
                cy="28"
                r="25.5"
                fill="none"
                stroke="#1a1a1a"
                strokeWidth="1.4"
                strokeDasharray="130 30"
                strokeLinecap="round"
                transform="rotate(-20 28 28)"
              />
              <text
                x="28"
                y="37"
                textAnchor="middle"
                fontFamily="Arial, sans-serif"
                fontWeight="800"
                fontSize="24"
              >
                <tspan fill="#8a8a8a">N</tspan>
                <tspan fill="#4CAF37">X</tspan>
              </text>
            </svg>
            <div>
              <h1 className="text-base sm:text-lg md:text-2xl font-extrabold tracking-tight text-[#1a1a1a] leading-none">
                NUTRI<span className="text-[#4CAF37]">EXA</span>
              </h1>
              <p className="hidden sm:block text-[9px] md:text-[10px] tracking-[0.2em] text-gray-500 mt-1 pt-1 border-t border-gray-200">
                NUTRITION FOR EXCELLENCE
              </p>
            </div>
          </Link>

          {/* Desktop search */}
          <div ref={searchBoxRef} className="hidden md:flex flex-1 max-w-xl relative">
            <form onSubmit={handleSearchSubmit} className="flex w-full">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowResults(true);
                  }}
                  onFocus={() => setShowResults(true)}
                  placeholder="Search for supplements..."
                  className="w-full border border-gray-300 rounded-l-md px-4 py-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:ring-1 focus:ring-[#4CAF37]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1a1a1a]"
                  >
                    <FiX size={16} />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="bg-[#4CAF37] px-5 rounded-r-md flex items-center justify-center hover:opacity-90 shrink-0"
              >
                <FiSearch className="text-white" size={18} />
              </button>
            </form>

            {showResults && searchQuery.trim() && <SearchDropdown />}
          </div>

          <div className="flex items-center gap-3 sm:gap-4 md:gap-7 text-xs text-[#1a1a1a] shrink-0">
            <Link
              to="/track-order"
              className="hidden lg:flex flex-col items-center gap-1 cursor-pointer hover:text-[#4CAF37]"
            >
              <TbPackage size={22} strokeWidth={1.6} />
              <span>Track Order</span>
            </Link>
            <Link
              to="/authenticator"
              className="hidden lg:flex flex-col items-center gap-1 cursor-pointer hover:text-[#4CAF37]"
            >
              <TbShieldCheck size={22} strokeWidth={1.6} />
              <span>Authenticator</span>
            </Link>
            <Link
              to="/contact"
              className="hidden lg:flex flex-col items-center gap-1 cursor-pointer hover:text-[#4CAF37]"
            >
              <FiHelpCircle size={22} strokeWidth={1.6} />
              <span>Support</span>
            </Link>

            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 focus:outline-none"
                  aria-label="Profile menu"
                >
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#4CAF37]/10 text-[#4CAF37] font-bold flex items-center justify-center text-sm">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-full pt-2 w-52 z-50 animate-fadeIn">
                    <div className="bg-white border border-gray-100 rounded-xl shadow-xl py-2 overflow-hidden">
                      <div className="px-4 py-2.5 border-b border-gray-50 bg-[#fafbf9]">
                        <p className="text-xs font-bold text-[#1a1a1a] truncate">{user.name || "Customer"}</p>
                        <p className="text-[11px] text-gray-500 truncate">{user.phone ? `+91 ${user.phone}` : user.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-[#4CAF37]/10 hover:text-[#4CAF37] transition-colors"
                      >
                        <FiUser size={15} /> My Profile
                      </Link>
                      <Link
                        to="/profile?tab=orders"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-[#4CAF37]/10 hover:text-[#4CAF37] transition-colors"
                      >
                        <TbPackage size={15} /> My Orders
                      </Link>
                      <Link
                        to="/profile?tab=addresses"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-[#4CAF37]/10 hover:text-[#4CAF37] transition-colors"
                      >
                        <TbTruckDelivery size={15} /> Saved Addresses
                      </Link>
                      <Link
                        to="/profile?tab=security"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-[#4CAF37]/10 hover:text-[#4CAF37] transition-colors"
                      >
                        <TbShieldCheck size={15} /> Password & Security
                      </Link>
                      <button
                        onClick={() => { setProfileOpen(false); logout(); }}
                        className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 border-t border-gray-50 transition-colors"
                      >
                        <FiLogOut size={15} /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : admin ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 focus:outline-none"
                  aria-label="Admin menu"
                >
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#1a1a1a] text-[#4CAF37] font-bold flex items-center justify-center text-sm border border-[#4CAF37]">
                    A
                  </div>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-full pt-2 w-52 z-50 animate-fadeIn">
                    <div className="bg-white border border-gray-100 rounded-xl shadow-xl py-2 overflow-hidden">
                      <div className="px-4 py-2 border-b border-gray-50 bg-[#fafbf9]">
                        <p className="text-xs font-bold text-[#1a1a1a] truncate">{admin.name || "Admin"}</p>
                        <p className="text-[10px] text-emerald-700 font-bold uppercase">{admin.role || "Admin Panel"}</p>
                      </div>
                      <Link
                        to="/admin"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-[#4CAF37]/10 hover:text-[#4CAF37] transition-colors"
                      >
                        🛠️ Admin Dashboard
                      </Link>
                      <button
                        onClick={() => { setProfileOpen(false); logoutAdmin(); }}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 border-t border-gray-50 transition-colors"
                      >
                        Logout Admin
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="cursor-pointer hover:text-[#4CAF37] flex items-center gap-1 text-xs font-semibold"
                aria-label="Login"
              >
                <FiUser size={20} className="md:w-[22px] md:h-[22px]" />
                <span className="hidden sm:inline">Login</span>
              </Link>
            )}

            <Link to="/cart" className="relative cursor-pointer hover:text-[#4CAF37]">
              <FiShoppingCart size={20} className="md:w-[22px] md:h-[22px]" />
              <span className="absolute -top-2 -right-2 bg-[#4CAF37] text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center font-bold">
                {cartCount}
              </span>
            </Link>
          </div>
        </div>

        {/* Mobile search — below main row, mobile only */}
        <div ref={mobileSearchBoxRef} className="md:hidden relative px-3 sm:px-4 pb-3 bg-white">
          <form onSubmit={handleSearchSubmit} className="flex">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
                placeholder="Search for supplements..."
                className="w-full border border-gray-300 rounded-l-md px-3 py-2 text-sm text-[#1a1a1a] focus:outline-none focus:ring-1 focus:ring-[#4CAF37]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1a1a1a]"
                >
                  <FiX size={14} />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="bg-[#4CAF37] px-4 rounded-r-md flex items-center justify-center hover:opacity-90 shrink-0"
            >
              <FiSearch className="text-white" size={16} />
            </button>
          </form>

          {showResults && searchQuery.trim() && <SearchDropdown />}
        </div>

        {/* Nav row — desktop/tablet only */}
        <div className="hidden md:flex bg-white border-t border-gray-100 px-4 md:px-10 py-3 items-center gap-8">
          <button className="hidden md:flex items-center gap-2 bg-[#4CAF37] text-white text-sm font-semibold px-5 py-2.5 rounded-md hover:opacity-90">
            <HiMenu size={18} /> SHOP BY CATEGORY
          </button>
          <nav className="hidden md:flex gap-7 text-sm font-bold text-[#1a1a1a]">
            {navLinks.map((link) => {
              const isActive =
                link.path === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(link.path);

              return (
                <Link
                  key={link.label}
                  to={link.path}
                  className={`relative pb-1 uppercase tracking-wide hover:text-[#4CAF37] transition-colors ${
                    isActive
                      ? "after:content-[''] after:absolute after:left-0 after:-bottom-[1px] after:w-full after:h-[3px] after:bg-[#4CAF37] after:rounded-full"
                      : ""
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* ===== Mobile Hamburger Drawer ===== */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[998] bg-black/50 transition-opacity duration-300 md:hidden ${
          drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setDrawerOpen(false)}
      />

      {/* Drawer panel — slides in from LEFT */}
      <div
        className={`fixed top-0 left-0 h-full w-[82vw] max-w-[320px] bg-white z-[999] flex flex-col shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#1a1a1a]">
          <Link
            to="/"
            onClick={() => setDrawerOpen(false)}
            className="flex items-center gap-2"
          >
            <svg width="36" height="36" viewBox="0 0 56 56">
              <circle
                cx="28" cy="28" r="25.5"
                fill="none" stroke="white" strokeWidth="1.4"
                strokeDasharray="130 30" strokeLinecap="round"
                transform="rotate(-20 28 28)"
              />
              <text x="28" y="37" textAnchor="middle"
                fontFamily="Arial, sans-serif" fontWeight="800" fontSize="24">
                <tspan fill="#aaa">N</tspan>
                <tspan fill="#4CAF37">X</tspan>
              </text>
            </svg>
            <div>
              <p className="text-sm font-extrabold tracking-tight text-white leading-none">
                NUTRI<span className="text-[#4CAF37]">EXA</span>
              </p>
              <p className="text-[8px] tracking-[0.15em] text-gray-400 mt-0.5">
                NUTRITION FOR EXCELLENCE
              </p>
            </div>
          </Link>
          <button
            onClick={() => setDrawerOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* User info strip (if logged in) */}
        {user && (
          <div className="flex items-center gap-3 px-5 py-3.5 bg-[#4CAF37]/10 border-b border-[#4CAF37]/20">
            <div className="w-9 h-9 rounded-full bg-[#4CAF37] text-white font-bold flex items-center justify-center text-sm shrink-0">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#1a1a1a] truncate">{user.name || "Customer"}</p>
              <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        )}
        {admin && (
          <div className="flex items-center gap-3 px-5 py-3.5 bg-[#1a1a1a]/5 border-b border-gray-100">
            <div className="w-9 h-9 rounded-full bg-[#1a1a1a] text-[#4CAF37] font-bold flex items-center justify-center text-sm border border-[#4CAF37] shrink-0">
              A
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#1a1a1a] truncate">{admin.name || "Admin"}</p>
              <p className="text-[10px] text-emerald-700 font-bold uppercase">{admin.role || "Admin"}</p>
            </div>
          </div>
        )}

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">

          {/* Main Navigation */}
          <div className="px-3 pt-4 pb-2">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">
              Navigation
            </p>
            <nav className="flex flex-col">
              {navLinks.map((link) => {
                const Icon = NAV_ICONS[link.label] || FiChevronRight;
                const isActive =
                  link.path === "/"
                    ? location.pathname === "/"
                    : location.pathname.startsWith(link.path);

                return (
                  <Link
                    key={link.label}
                    to={link.path}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl font-semibold text-sm transition-all ${
                      isActive
                        ? "bg-[#4CAF37] text-white"
                        : "text-[#1a1a1a] hover:bg-gray-50"
                    }`}
                  >
                    <Icon size={17} className={isActive ? "text-white" : "text-[#4CAF37]"} />
                    {link.label}
                    {isActive && <FiChevronRight size={14} className="ml-auto text-white/70" />}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Divider */}
          <div className="mx-5 my-1 border-t border-gray-100" />

          {/* Shop by Category */}
          <div className="px-3 pt-3 pb-2">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">
              Shop by Category
            </p>
            <div className="flex flex-col gap-1">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/products?category=${cat.slug}`}
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#f5f8f4] border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.label} className="w-7 h-7 object-contain" />
                    ) : (
                      <span className="text-[10px] text-[#4CAF37] font-bold">
                        {cat.label.charAt(0)}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-[#1a1a1a] group-hover:text-[#4CAF37] transition-colors">
                    {cat.label}
                  </span>
                  <FiChevronRight size={13} className="ml-auto text-gray-300 group-hover:text-[#4CAF37]" />
                </Link>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="mx-5 my-1 border-t border-gray-100" />

          {/* Account section */}
          {user && (
            <div className="px-3 pt-3 pb-2">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">
                My Account
              </p>
              <div className="flex flex-col gap-0.5">
                <Link to="/profile" onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-[#1a1a1a] hover:bg-gray-50 transition-colors">
                  <FiUser size={16} className="text-[#4CAF37]" /> My Profile
                </Link>
                <Link to="/profile?tab=orders" onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-[#1a1a1a] hover:bg-gray-50 transition-colors">
                  <TbPackage size={16} className="text-[#4CAF37]" /> My Orders
                </Link>
                <Link to="/profile?tab=addresses" onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-[#1a1a1a] hover:bg-gray-50 transition-colors">
                  <FiMapPin size={16} className="text-[#4CAF37]" /> Saved Addresses
                </Link>
                <Link to="/profile?tab=security" onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-[#1a1a1a] hover:bg-gray-50 transition-colors">
                  <TbShieldCheck size={16} className="text-[#4CAF37]" /> Password & Security
                </Link>
              </div>
            </div>
          )}
          {admin && (
            <div className="px-3 pt-3 pb-2">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">
                Admin
              </p>
              <Link to="/admin" onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-[#1a1a1a] hover:bg-gray-50 transition-colors">
                🛠️ Admin Dashboard
              </Link>
            </div>
          )}
        </div>

        {/* Drawer footer — logout / login */}
        <div className="px-4 py-4 border-t border-gray-100 bg-[#fafbf9]">
          {user ? (
            <button
              onClick={() => { setDrawerOpen(false); logout(); }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 text-red-600 text-sm font-bold hover:bg-red-100 transition-colors"
            >
              <FiLogOut size={16} /> Logout
            </button>
          ) : admin ? (
            <button
              onClick={() => { setDrawerOpen(false); logoutAdmin(); }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 text-red-600 text-sm font-bold hover:bg-red-100 transition-colors"
            >
              <FiLogOut size={16} /> Logout Admin
            </button>
          ) : (
            <Link
              to="/login"
              onClick={() => setDrawerOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#4CAF37] text-white text-sm font-bold hover:opacity-90 transition-colors"
            >
              <FiUser size={16} /> Login / Sign Up
            </Link>
          )}
        </div>
      </div>
    </>
  );
}