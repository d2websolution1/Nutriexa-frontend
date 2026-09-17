import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  FiSearch,
  FiUser,
  FiShoppingCart,
  FiX,
  FiLogOut,
  FiLogIn,
  FiChevronRight,
  FiChevronDown,
  FiHome,
  FiPackage,
  FiTag,
  FiInfo,
  FiPhone,
  FiGrid,
  FiHeadphones,
  FiArrowLeft,
  FiHeart,
  FiSettings,
  FiSun,
  FiMoon,
} from "react-icons/fi";
import { TbTruckDelivery, TbShieldCheck, TbPackage, TbTicket } from "react-icons/tb";
import { HiMenu } from "react-icons/hi";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { API_URL as API_BASE } from "../config";
import nutriexaLogo from "../assets/nutriexa-logo.png";

const CATEGORY_ITEMS = [
  { slug: "whey-proteins", label: "Whey Proteins" },
  { slug: "mass-gainers", label: "Mass Gainers" },
  { slug: "pre-workouts", label: "Pre-Workouts" },
  { slug: "creatine", label: "Creatine" },
  { slug: "amino-acids", label: "Amino Acids" },
  { slug: "health-wellness", label: "Health & Wellness" },
  { slug: "accessories", label: "Accessories" },
];

export default function Header() {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const { cartCount, cartTotal } = useCart();
  const { user, admin, logout, logoutAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  // ---- Mobile States (Image 2) ----
  // State 1: Collapsed (default)
  // State 2: mobileSearchActive === true
  // State 3: mobileAccountOpen === true
  const [mobileSearchActive, setMobileSearchActive] = useState(false);
  const [mobileAccountOpen, setMobileAccountOpen] = useState(false);

  // ---- Desktop Dropdowns ----
  const [desktopAccountOpen, setDesktopAccountOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [drawerCategoriesOpen, setDrawerCategoriesOpen] = useState(false);

  // ---- Mobile Hamburger Drawer (Image 1) ----
  const [drawerOpen, setDrawerOpen] = useState(false);

  // ---- Search functionality ----
  const [allProducts, setAllProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const desktopSearchRef = useRef(null);
  const mobileSearchInputRef = useRef(null);
  const mobileAccountMenuRef = useRef(null);
  const desktopAccountMenuRef = useRef(null);
  const categoryMenuRef = useRef(null);

  const categoryTimeoutRef = useRef(null);
  const accountTimeoutRef = useRef(null);

  const handleCategoryMouseEnter = () => {
    if (categoryTimeoutRef.current) clearTimeout(categoryTimeoutRef.current);
    setCategoryDropdownOpen(true);
  };

  const handleCategoryMouseLeave = () => {
    if (categoryTimeoutRef.current) clearTimeout(categoryTimeoutRef.current);
    categoryTimeoutRef.current = setTimeout(() => {
      setCategoryDropdownOpen(false);
    }, 160);
  };

  const handleAccountMouseEnter = () => {
    if (accountTimeoutRef.current) clearTimeout(accountTimeoutRef.current);
    setDesktopAccountOpen(true);
  };

  const handleAccountMouseLeave = () => {
    if (accountTimeoutRef.current) clearTimeout(accountTimeoutRef.current);
    accountTimeoutRef.current = setTimeout(() => {
      setDesktopAccountOpen(false);
    }, 160);
  };

  useEffect(() => {
    return () => {
      if (categoryTimeoutRef.current) clearTimeout(categoryTimeoutRef.current);
      if (accountTimeoutRef.current) clearTimeout(accountTimeoutRef.current);
    };
  }, []);

  // Sticky header scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 80) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current) {
        // Scrolling down
        setIsVisible(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch all active products once for search autocomplete
  useEffect(() => {
    setSearchLoading(true);
    fetch(`${API_BASE}/api/products`)
      .then((res) => res.json())
      .then((data) => setAllProducts(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Failed to load products for search:", err))
      .finally(() => setSearchLoading(false));
  }, []);

  // Filter search results as user types
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

  // Focus mobile input when mobile search is activated
  useEffect(() => {
    if (mobileSearchActive) {
      setTimeout(() => {
        mobileSearchInputRef.current?.focus();
      }, 50);
    }
  }, [mobileSearchActive]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (desktopSearchRef.current && !desktopSearchRef.current.contains(e.target)) {
        setShowResults(false);
      }
      if (mobileAccountMenuRef.current && !mobileAccountMenuRef.current.contains(e.target)) {
        setMobileAccountOpen(false);
      }
      if (desktopAccountMenuRef.current && !desktopAccountMenuRef.current.contains(e.target)) {
        setDesktopAccountOpen(false);
      }
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(e.target)) {
        setCategoryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lock body scroll when hamburger drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  // Close menus on navigation
  useEffect(() => {
    setDrawerOpen(false);
    setMobileSearchActive(false);
    setMobileAccountOpen(false);
    setDesktopAccountOpen(false);
    setCategoryDropdownOpen(false);
    setShowResults(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setShowResults(false);
    setMobileSearchActive(false);
    navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleResultClick = (productId) => {
    setShowResults(false);
    setSearchQuery("");
    setMobileSearchActive(false);
    navigate(`/product/${productId}`);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
  };

  // Nav links sequence according to reference image 1 & 3
  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Products", path: "/products" },
    { label: "Deals", path: "/deals", isDealsPill: true },
    { label: "Authenticator", path: "/authenticator" },
    { label: "Track Your Order", path: "/track-order" },
    { label: "About Us", path: "/about" },
    { label: "Contact Us", path: "/contact" },
  ];

  // Helper for displaying active user or default profile
  const userName = user?.name || "Rahul Sharma";
  const userEmail = user?.email || "rahul@example.com";

  // Reusable Search Dropdown List
  const SearchDropdownList = () => (
    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-100 rounded-xl shadow-2xl z-50 overflow-hidden max-h-80 overflow-y-auto">
      {searchLoading && (
        <p className="text-xs text-gray-400 text-center py-4">Searching...</p>
      )}

      {!searchLoading && searchResults.length === 0 && searchQuery.trim() && (
        <p className="text-xs text-gray-500 text-center py-5">
          No supplements found for "{searchQuery}"
        </p>
      )}

      {!searchLoading &&
        searchResults.map((product) => (
          <button
            key={product.id}
            onClick={() => handleResultClick(product.id)}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#f7f8f6] text-left border-b border-gray-50 last:border-0 transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-[#f3f6f2] overflow-hidden shrink-0 flex items-center justify-center p-1">
              {product.image ? (
                <img
                  src={product.image.startsWith("http") ? product.image : `${API_BASE}${product.image}`}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-[9px] text-gray-400">Nutriexa</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#1a1a1a] truncate">
                {product.name}
              </p>
              <p className="text-[11px] text-gray-500 truncate">
                {product.variant || "Standard"}
              </p>
            </div>
            <p className="text-xs font-bold text-[#22c55e] shrink-0">
              ₹{Number(product.price).toLocaleString("en-IN")}
            </p>
          </button>
        ))}

      {!searchLoading && searchResults.length > 0 && (
        <button
          onClick={handleSearchSubmit}
          className="w-full text-center text-xs font-semibold text-[#22c55e] py-2.5 hover:bg-[#f7f8f6] border-t border-gray-100 cursor-pointer"
        >
          View all results for "{searchQuery}"
        </button>
      )}
    </div>
  );

  return (
    <>
      <header
        className={`w-full sticky top-0 z-50 transition-transform duration-300 ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        {/* ===================================================================
            DESKTOP HEADER (IMAGE 3) - Full View
            Height: 80px for top dark bar | Sticky on scroll
           =================================================================== */}
        <div className="hidden md:block">
          {/* Top Dark Bar (80px height) */}
          <div className="bg-[#0b0e14] text-white h-[80px] px-6 lg:px-12 flex items-center justify-between gap-6 border-b border-[#1b2230]">
            {/* Nutriexa Brand Logo (Clean text-only with side lines matching reference) */}
            <Link to="/" className="flex flex-col items-center justify-center shrink-0 group select-none py-1">
              <div className="flex items-baseline">
                <span className="text-2xl lg:text-[28px] font-black italic tracking-wider text-white leading-none group-hover:opacity-90 transition-opacity">
                  NUTRI<span className="text-[#22c55e]">EXA</span>
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1.5 w-full justify-center">
                <span className="h-[1.5px] w-3.5 lg:w-4 bg-[#22c55e] rounded-full" />
                <span className="text-[7.5px] lg:text-[8px] tracking-[0.22em] text-[#22c55e] font-bold uppercase whitespace-nowrap leading-none">
                  Nutrition For Excellence
                </span>
                <span className="h-[1.5px] w-3.5 lg:w-4 bg-[#22c55e] rounded-full" />
              </div>
            </Link>

            {/* Desktop Search Bar (Rounded pill with green accent border) */}
            <div ref={desktopSearchRef} className="flex-1 max-w-xl relative">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowResults(true);
                  }}
                  onFocus={() => setShowResults(true)}
                  placeholder="Search for products, brands, categories..."
                  className="w-full bg-[#111722] border border-[#22c55e]/50 focus:border-[#22c55e] rounded-full pl-5 pr-12 py-2.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#22c55e] transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#22c55e] transition-colors cursor-pointer"
                  aria-label="Search"
                >
                  <FiSearch size={18} />
                </button>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-9 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    <FiX size={15} />
                  </button>
                )}
              </form>

              {showResults && searchQuery.trim() && <SearchDropdownList />}
            </div>

            {/* Top Right Actions */}
            <div className="flex items-center gap-6 text-xs text-gray-200 shrink-0">
              {/* Track Order */}
              <Link
                to="/track-order"
                className="flex items-center gap-2 hover:text-[#22c55e] transition-colors cursor-pointer"
              >
                <TbTruckDelivery size={20} className="text-gray-300" />
                <span className="font-medium whitespace-nowrap">Track Order</span>
              </Link>

              {/* Authenticator */}
              <Link
                to="/authenticator"
                className="flex items-center gap-2 hover:text-[#22c55e] transition-colors cursor-pointer"
              >
                <TbShieldCheck size={20} className="text-gray-300" />
                <span className="font-medium whitespace-nowrap">Authenticator</span>
              </Link>

              {/* Support */}
              <Link
                to="/contact"
                className="flex items-center gap-2 hover:text-[#22c55e] transition-colors cursor-pointer"
              >
                <FiHeadphones size={19} className="text-gray-300" />
                <span className="font-medium whitespace-nowrap">Support</span>
              </Link>

              {/* Account Dropdown with Hover & Click */}
              <div
                className="relative"
                ref={desktopAccountMenuRef}
                onMouseEnter={handleAccountMouseEnter}
                onMouseLeave={handleAccountMouseLeave}
              >
                <button
                  onClick={() => setDesktopAccountOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 hover:text-[#22c55e] transition-colors cursor-pointer focus:outline-none py-2"
                >
                  <FiUser size={19} className="text-gray-300" />
                  <span className="font-medium whitespace-nowrap">Account</span>
                  <FiChevronDown
                    size={14}
                    className={`text-gray-400 transition-transform ${
                      desktopAccountOpen ? "rotate-180 text-[#22c55e]" : ""
                    }`}
                  />
                </button>

                {desktopAccountOpen && (
                  <div className="absolute right-0 top-full mt-3 w-56 bg-white text-[#1a1a1a] rounded-2xl shadow-2xl border border-gray-100 py-2.5 z-50 animate-fadeIn">
                    {user ? (
                      <>
                        <div className="px-4 py-2 border-b border-gray-100 bg-[#f9fafb] rounded-t-xl">
                          <p className="text-xs font-bold text-[#1a1a1a] truncate">{user.name || "Customer"}</p>
                          <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                          <span className="inline-block mt-1 text-[9px] font-semibold text-[#22c55e] border border-[#22c55e] px-2 py-0.5 rounded-full">
                            Premium Member
                          </span>
                        </div>
                        <Link
                          to="/profile"
                          onClick={() => setDesktopAccountOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-colors"
                        >
                          <FiUser size={15} /> My Account
                        </Link>
                        <Link
                          to="/my-orders"
                          onClick={() => setDesktopAccountOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-colors"
                        >
                          <TbPackage size={15} /> My Orders
                        </Link>
                        <Link
                          to="/products"
                          onClick={() => setDesktopAccountOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-colors"
                        >
                          <FiHeart size={15} /> My Wishlist
                        </Link>
                        <Link
                          to="/deals"
                          onClick={() => setDesktopAccountOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-colors"
                        >
                          <TbTicket size={15} /> Coupons
                        </Link>
                        <Link
                          to="/profile?tab=security"
                          onClick={() => setDesktopAccountOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-colors"
                        >
                          <FiSettings size={15} /> Settings
                        </Link>
                        <div className="border-t border-gray-100 my-1" />
                        <button
                          onClick={() => {
                            setDesktopAccountOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                        >
                          <FiLogOut size={15} /> Logout
                        </button>
                      </>
                    ) : admin ? (
                      <>
                        <div className="px-4 py-2 border-b border-gray-100 bg-[#f9fafb]">
                          <p className="text-xs font-bold text-[#1a1a1a] truncate">{admin.name || "Admin"}</p>
                          <p className="text-[10px] text-emerald-700 font-bold uppercase">{admin.role || "Admin Panel"}</p>
                        </div>
                        <Link
                          to="/admin"
                          onClick={() => setDesktopAccountOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-colors"
                        >
                          🛠️ Admin Dashboard
                        </Link>
                        <div className="border-t border-gray-100 my-1" />
                        <button
                          onClick={() => {
                            setDesktopAccountOpen(false);
                            logoutAdmin();
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                        >
                          <FiLogOut size={15} /> Logout Admin
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="px-4 py-2 border-b border-gray-100 bg-[#f9fafb]">
                          <p className="text-xs font-bold text-[#1a1a1a]">Welcome to Nutriexa</p>
                          <p className="text-[10px] text-gray-500">Access orders, wishlist & more</p>
                        </div>
                        <Link
                          to="/login"
                          onClick={() => setDesktopAccountOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-[#22c55e] hover:bg-[#22c55e]/10 transition-colors"
                        >
                          <FiLogIn size={15} /> Login / Sign In
                        </Link>
                        <Link
                          to="/signup"
                          onClick={() => setDesktopAccountOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <FiUser size={15} /> Register New Account
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Theme Toggle (Dark / Light) */}
              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle dark/light mode"
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer text-xs font-semibold focus:outline-none select-none"
              >
                {isDark ? (
                  <>
                    <FiSun size={15} className="text-amber-400" />
                    <span className="text-amber-400 text-[11px]">Light</span>
                  </>
                ) : (
                  <>
                    <FiMoon size={15} className="text-blue-300" />
                    <span className="text-gray-200 text-[11px]">Dark</span>
                  </>
                )}
              </button>

              {/* Vertical Separator */}
              <div className="h-6 w-[1px] bg-gray-700" />

              {/* Cart Button with Count and Price */}
              <Link
                to="/cart"
                className="flex items-center gap-3 hover:opacity-90 transition-opacity cursor-pointer group"
              >
                <div className="relative">
                  <FiShoppingCart size={22} className="text-white group-hover:text-[#22c55e] transition-colors" />
                  <span className="absolute -top-2.5 -right-2.5 bg-[#22c55e] text-white rounded-full text-[10px] font-bold w-5 h-5 flex items-center justify-center border-2 border-[#0b0e14]">
                    {cartCount ?? 3}
                  </span>
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-[11px] font-semibold text-white">Cart</span>
                  <span className="text-[10px] text-gray-300 font-medium">
                    ₹ {cartTotal ? Number(cartTotal).toLocaleString("en-IN") : "4,497"}
                  </span>
                </div>
              </Link>
            </div>
          </div>

          {/* Bottom Navigation Bar (White row directly underneath dark bar) */}
          <div className="bg-white border-b border-gray-200 px-6 lg:px-12 flex items-center h-12">
            {/* Shop by Category with Dropdown (Hover & Click) */}
            <div
              className="relative"
              ref={categoryMenuRef}
              onMouseEnter={handleCategoryMouseEnter}
              onMouseLeave={handleCategoryMouseLeave}
            >
              <button
                onClick={() => setCategoryDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2.5 text-xs font-bold text-[#1a1a1a] hover:text-[#22c55e] transition-colors py-3 pr-6 cursor-pointer focus:outline-none"
              >
                <HiMenu size={20} className="text-[#1a1a1a]" />
                <span className="uppercase tracking-wide font-extrabold text-sm">Shop by Category</span>
                <FiChevronDown
                  size={14}
                  className={`text-gray-500 ml-1 transition-transform ${
                    categoryDropdownOpen ? "rotate-180 text-[#22c55e]" : ""
                  }`}
                />
              </button>

              {/* Categories Dropdown Popover */}
              {categoryDropdownOpen && (
                <div className="absolute left-0 top-full mt-1 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 animate-fadeIn">
                  {CATEGORY_ITEMS.map((cat) => (
                    <Link
                      key={cat.slug}
                      to={`/products?category=${cat.slug}`}
                      onClick={() => setCategoryDropdownOpen(false)}
                      className="flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-gray-800 hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-colors"
                    >
                      <span>{cat.label}</span>
                      <FiChevronRight size={13} className="text-gray-400" />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Vertical Separator */}
            <div className="h-5 w-[1px] bg-gray-200 mr-6" />

            {/* Exact Navigation Menu Sequence: Home, Products, Deals, Authenticator, Track Your Order, About Us, Contact Us */}
            <nav className="flex items-center gap-8 text-xs font-bold text-[#1a1a1a]">
              {navLinks.map((link) => {
                const isActive =
                  link.path === "/"
                    ? location.pathname === "/"
                    : location.pathname.startsWith(link.path);

                // Deals page has a solid green rounded pill badge around it as in Image 3
                if (link.isDealsPill) {
                  return (
                    <Link
                      key={link.label}
                      to={link.path}
                      className="bg-[#22c55e] text-white px-3.5 py-1 rounded-full text-xs font-bold hover:bg-[#1ea850] transition-colors shadow-sm"
                    >
                      {link.label}
                    </Link>
                  );
                }

                return (
                  <Link
                    key={link.label}
                    to={link.path}
                    className={`relative py-3 transition-colors uppercase tracking-wide text-xs ${
                      isActive
                        ? "text-[#22c55e] font-extrabold after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2.5px] after:bg-[#22c55e]"
                        : "text-[#1a1a1a] hover:text-[#22c55e]"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* ===================================================================
            MOBILE HEADER (IMAGE 2) - 3 States
            Height: 64px | Dark Theme (#0b0e14)
           =================================================================== */}
        <div className="md:hidden bg-[#0b0e14] text-white h-16 px-4 flex items-center justify-between border-b border-[#1b2230] relative">
          {/* STATE 2: Mobile Search Active (Image 2 - State 3 in user diagram) */}
          {mobileSearchActive ? (
            <div className="w-full flex items-center gap-2.5">
              {/* Back Arrow to exit search */}
              <button
                onClick={() => setMobileSearchActive(false)}
                className="text-white hover:text-[#22c55e] p-1.5 cursor-pointer shrink-0"
                aria-label="Back"
              >
                <FiArrowLeft size={22} />
              </button>

              {/* Search input with subtle green border */}
              <form onSubmit={handleSearchSubmit} className="flex-1 relative">
                <div className="relative flex items-center">
                  <FiSearch
                    size={16}
                    className="absolute left-3.5 text-gray-400 pointer-events-none"
                  />
                  <input
                    ref={mobileSearchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowResults(true);
                    }}
                    onFocus={() => setShowResults(true)}
                    placeholder="Search for products, brands, categories..."
                    className="w-full bg-[#111722] border border-[#22c55e] rounded-full pl-9 pr-9 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#22c55e]"
                  />
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-3 text-gray-400 hover:text-white"
                    >
                      <FiX size={16} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setMobileSearchActive(false)}
                      className="absolute right-3 text-gray-400 hover:text-white"
                    >
                      <FiX size={16} />
                    </button>
                  )}
                </div>

                {showResults && searchQuery.trim() && <SearchDropdownList />}
              </form>

              {/* Cart Icon on right */}
              <Link to="/cart" className="relative p-1.5 cursor-pointer shrink-0">
                <FiShoppingCart size={22} className="text-white" />
                <span className="absolute -top-1 -right-1 bg-[#22c55e] text-white rounded-full text-[10px] font-bold w-4 h-4 flex items-center justify-center">
                  {cartCount ?? 3}
                </span>
              </Link>
            </div>
          ) : (
            /* STATE 1: Mobile Header Collapsed View & STATE 3: With Account Menu */
            <>
              {/* Left: Hamburger Icon */}
              <button
                onClick={() => setDrawerOpen(true)}
                className="text-white hover:text-[#22c55e] p-1.5 cursor-pointer shrink-0"
                aria-label="Open menu"
              >
                <HiMenu size={26} />
              </button>

              {/* Center: Nutriexa Logo (Text only with side lines) */}
              <Link to="/" className="flex flex-col items-center justify-center shrink-0 select-none py-0.5">
                <div className="flex items-baseline">
                  <span className="text-xl font-black italic tracking-wider text-white leading-none">
                    NUTRI<span className="text-[#22c55e]">EXA</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1 justify-center">
                  <span className="h-[1px] w-2.5 bg-[#22c55e] rounded-full" />
                  <span className="text-[7px] tracking-[0.18em] text-[#22c55e] font-bold uppercase whitespace-nowrap leading-none">
                    Nutrition For Excellence
                  </span>
                  <span className="h-[1px] w-2.5 bg-[#22c55e] rounded-full" />
                </div>
              </Link>

              {/* Right: Search, Theme Toggle, Account & Cart */}
              <div className="flex items-center gap-2.5">
                {/* Theme Toggle Button */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                  className="text-white hover:text-amber-400 p-1 cursor-pointer focus:outline-none"
                >
                  {isDark ? <FiSun size={19} className="text-amber-400" /> : <FiMoon size={19} className="text-gray-300" />}
                </button>

                {/* Search Icon (Click to activate Search Active View) */}
                <button
                  onClick={() => {
                    setMobileSearchActive(true);
                    setMobileAccountOpen(false);
                  }}
                  className="text-white hover:text-[#22c55e] p-1 cursor-pointer"
                  aria-label="Search"
                >
                  <FiSearch size={20} />
                </button>

                {/* Account Icon (Click to toggle Account Menu) */}
                <div className="relative" ref={mobileAccountMenuRef}>
                  <button
                    onClick={() => setMobileAccountOpen((prev) => !prev)}
                    className="flex items-center text-white hover:text-[#22c55e] p-1 cursor-pointer focus:outline-none"
                    aria-label="Account menu"
                  >
                    <FiUser size={20} />
                    {mobileAccountOpen && <FiChevronDown size={12} className="ml-0.5 text-gray-300" />}
                  </button>

                  {/* STATE 3: Account Popover Dropdown Menu (Image 2 - State 4) */}
                  {mobileAccountOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white text-[#1a1a1a] rounded-2xl shadow-2xl border border-gray-100 py-2.5 z-50 animate-fadeIn">
                      {/* Triangle Pointer */}
                      <div className="absolute -top-1.5 right-4 w-3 h-3 bg-white border-t border-l border-gray-100 rotate-45" />

                      <Link
                        to={user ? "/profile" : "/login"}
                        onClick={() => setMobileAccountOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-gray-800 hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-colors"
                      >
                        <FiUser size={16} className="text-gray-500" />
                        <span>My Account</span>
                      </Link>

                      <Link
                        to="/my-orders"
                        onClick={() => setMobileAccountOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-gray-800 hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-colors"
                      >
                        <TbPackage size={16} className="text-gray-500" />
                        <span>My Orders</span>
                      </Link>

                      <Link
                        to="/products"
                        onClick={() => setMobileAccountOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-gray-800 hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-colors"
                      >
                        <FiHeart size={16} className="text-gray-500" />
                        <span>My Wishlist</span>
                      </Link>

                      <Link
                        to="/deals"
                        onClick={() => setMobileAccountOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-gray-800 hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-colors"
                      >
                        <TbTicket size={16} className="text-gray-500" />
                        <span>Coupons</span>
                      </Link>

                      <Link
                        to="/profile?tab=security"
                        onClick={() => setMobileAccountOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-gray-800 hover:bg-[#22c55e]/10 hover:text-[#22c55e] transition-colors"
                      >
                        <FiSettings size={16} className="text-gray-500" />
                        <span>Settings</span>
                      </Link>

                      <div className="border-t border-gray-100 my-1" />

                      {user ? (
                        <button
                          onClick={() => {
                            setMobileAccountOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                        >
                          <FiLogOut size={16} />
                          <span>Logout</span>
                        </button>
                      ) : admin ? (
                        <button
                          onClick={() => {
                            setMobileAccountOpen(false);
                            logoutAdmin();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                        >
                          <FiLogOut size={16} />
                          <span>Logout Admin</span>
                        </button>
                      ) : (
                        <Link
                          to="/login"
                          onClick={() => setMobileAccountOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-xs font-semibold text-[#22c55e] hover:bg-[#22c55e]/10 transition-colors"
                        >
                          <FiLogIn size={16} />
                          <span>Login</span>
                        </Link>
                      )}
                    </div>
                  )}
                </div>

                {/* Cart Icon with count badge */}
                <Link to="/cart" className="relative p-1 cursor-pointer">
                  <FiShoppingCart size={22} className="text-white" />
                  <span className="absolute -top-1 -right-1.5 bg-[#22c55e] text-white rounded-full text-[10px] font-bold w-4 h-4 flex items-center justify-center">
                    {cartCount ?? 3}
                  </span>
                </Link>
              </div>
            </>
          )}
        </div>
      </header>

      {/* ===================================================================
          MOBILE HAMBURGER MENU DRAWER (IMAGE 1)
          Exact Sequence, Dark Theme (#0b0e14), Profile Card, Authenticity Banner
         =================================================================== */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[998] bg-black/70 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setDrawerOpen(false)}
      />

      {/* Drawer Panel — Slides in from Left */}
      <aside
        className={`fixed top-0 left-0 h-full w-[85vw] max-w-[340px] bg-[#0b0e14] text-white z-[999] flex flex-col shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header: Logo on left, Close icon on right */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800/80">
          {/* Logo inside drawer */}
          <Link
            to="/"
            onClick={() => setDrawerOpen(false)}
            className="flex flex-col items-start justify-center select-none"
          >
            <div className="flex items-baseline">
              <span className="text-xl font-black italic tracking-wider text-white leading-none">
                NUTRI<span className="text-[#22c55e]">EXA</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="h-[1px] w-2.5 bg-[#22c55e] rounded-full" />
              <span className="text-[7px] tracking-[0.18em] text-[#22c55e] font-bold uppercase whitespace-nowrap">
                Nutrition For Excellence
              </span>
              <span className="h-[1px] w-2.5 bg-[#22c55e] rounded-full" />
            </div>
          </Link>

          <button
            onClick={() => setDrawerOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* User Profile Card */}
        <div className="p-4 border-b border-gray-800/80">
          <Link
            to={user ? "/profile" : "/login"}
            onClick={() => setDrawerOpen(false)}
            className="flex items-center justify-between p-3 rounded-2xl bg-[#12161f] border border-gray-800/80 hover:border-[#22c55e]/50 transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Silhouette Avatar */}
              <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-[#0b0e14] shrink-0 font-bold">
                {user?.name ? (
                  <span className="text-base font-extrabold text-[#0b0e14]">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <FiUser size={22} className="text-[#0b0e14]" />
                )}
              </div>

              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate">
                  {userName}
                </p>
                <p className="text-[11px] text-gray-400 truncate">
                  {userEmail}
                </p>
                <div className="mt-1">
                  <span className="inline-block text-[9px] font-semibold text-[#22c55e] border border-[#22c55e] px-2 py-0.5 rounded-full">
                    Premium Member
                  </span>
                </div>
              </div>
            </div>

            <FiChevronRight size={18} className="text-gray-500 group-hover:text-[#22c55e] transition-colors shrink-0 ml-2" />
          </Link>
        </div>

        {/* Scrollable Navigation List (Exact Sequence from Image 1) */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
          {/* Theme Toggle in Drawer */}
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/5 text-gray-200 mb-2">
            <span className="text-xs font-semibold">Appearance</span>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-xs font-medium cursor-pointer"
            >
              {isDark ? (
                <>
                  <FiSun size={14} className="text-amber-400" />
                  <span className="text-amber-400 text-[11px]">Light Mode</span>
                </>
              ) : (
                <>
                  <FiMoon size={14} className="text-blue-300" />
                  <span className="text-gray-300 text-[11px]">Dark Mode</span>
                </>
              )}
            </button>
          </div>

          {/* 1. Home */}
          <Link
            to="/"
            onClick={() => setDrawerOpen(false)}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              location.pathname === "/"
                ? "text-[#22c55e]"
                : "text-gray-200 hover:text-[#22c55e] hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-3.5">
              <FiHome size={18} className="text-[#22c55e]" />
              <span className="text-[#22c55e] font-semibold">Home</span>
            </div>
          </Link>

          {/* 2. Shop by Category (with expand/collapse) */}
          <div>
            <button
              onClick={() => setDrawerCategoriesOpen((prev) => !prev)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-200 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <FiGrid size={18} className="text-gray-400" />
                <span>Shop by Category</span>
              </div>
              <FiChevronRight
                size={16}
                className={`text-gray-500 transition-transform ${
                  drawerCategoriesOpen ? "rotate-90 text-[#22c55e]" : ""
                }`}
              />
            </button>

            {drawerCategoriesOpen && (
              <div className="pl-10 pr-2 py-1 space-y-1 bg-[#10141c] rounded-xl my-1">
                {CATEGORY_ITEMS.map((cat) => (
                  <Link
                    key={cat.slug}
                    to={`/products?category=${cat.slug}`}
                    onClick={() => setDrawerOpen(false)}
                    className="block py-1.5 text-xs text-gray-300 hover:text-[#22c55e] transition-colors"
                  >
                    {cat.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 3. Products */}
          <Link
            to="/products"
            onClick={() => setDrawerOpen(false)}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-200 hover:text-white hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <FiPackage size={18} className="text-gray-400" />
              <span>Products</span>
            </div>
            <FiChevronRight size={16} className="text-gray-500" />
          </Link>

          {/* 4. Deals (with Hot badge) */}
          <Link
            to="/deals"
            onClick={() => setDrawerOpen(false)}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-200 hover:text-white hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <FiTag size={18} className="text-gray-400" />
              <span>Deals</span>
              <span className="bg-[#22c55e] text-white text-[10px] font-bold px-2 py-0.5 rounded-full leading-none">
                Hot
              </span>
            </div>
            <FiChevronRight size={16} className="text-gray-500" />
          </Link>

          {/* 5. Authenticator */}
          <Link
            to="/authenticator"
            onClick={() => setDrawerOpen(false)}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-200 hover:text-white hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <TbShieldCheck size={19} className="text-gray-400" />
              <span>Authenticator</span>
            </div>
            <FiChevronRight size={16} className="text-gray-500" />
          </Link>

          {/* 6. Track Your Order */}
          <Link
            to="/track-order"
            onClick={() => setDrawerOpen(false)}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-200 hover:text-white hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <TbTruckDelivery size={19} className="text-gray-400" />
              <span>Track Your Order</span>
            </div>
            <FiChevronRight size={16} className="text-gray-500" />
          </Link>

          {/* 7. About Us */}
          <Link
            to="/about"
            onClick={() => setDrawerOpen(false)}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-200 hover:text-white hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <FiInfo size={18} className="text-gray-400" />
              <span>About Us</span>
            </div>
            <FiChevronRight size={16} className="text-gray-500" />
          </Link>

          {/* 8. Contact Us */}
          <Link
            to="/contact"
            onClick={() => setDrawerOpen(false)}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-200 hover:text-white hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <FiPhone size={18} className="text-gray-400" />
              <span>Contact Us</span>
            </div>
            <FiChevronRight size={16} className="text-gray-500" />
          </Link>

          {/* Thin Divider Line */}
          <div className="border-t border-gray-800/80 my-3" />

          {/* Lower Secondary Items: Track Order & Support */}
          <Link
            to="/track-order"
            onClick={() => setDrawerOpen(false)}
            className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            <TbTruckDelivery size={19} className="text-gray-400" />
            <span>Track Order</span>
          </Link>

          <Link
            to="/contact"
            onClick={() => setDrawerOpen(false)}
            className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            <FiHeadphones size={18} className="text-gray-400" />
            <span>Support</span>
          </Link>
        </div>

        {/* Bottom Banner Card: 100% Genuine Products (Green pill card in Image 1) */}
        <div className="p-4 border-t border-gray-800/80">
          <Link
            to="/authenticator"
            onClick={() => setDrawerOpen(false)}
            className="flex items-center justify-between bg-[#22c55e] text-white p-3.5 rounded-2xl shadow-lg hover:opacity-95 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
                <TbShieldCheck size={22} />
              </div>
              <div>
                <p className="text-xs font-black tracking-wide leading-tight">
                  100% Genuine Products
                </p>
                <p className="text-[10px] text-white/90 font-medium mt-0.5">
                  Authenticity Guaranteed
                </p>
              </div>
            </div>
            <FiChevronRight size={18} className="text-white group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </aside>
    </>
  );
}