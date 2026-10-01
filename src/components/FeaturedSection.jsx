import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiChevronLeft,
  FiChevronRight,
  FiShoppingCart,
  FiZap,
  FiStar,
  FiArrowRight,
  FiCheck,
} from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { API_URL as API_BASE } from "../config";

function buildImageUrl(path) {
  if (!path) return "https://placehold.co/400x400/f0f4ee/4CAF37?text=Nutriexa";
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path}`;
}

export default function FeaturedSection() {
  const [sections, setSections] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedMap, setAddedMap] = useState({});
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const scrollContainers = useRef({});

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Fetch active featured sections and products in parallel
        const [secRes, prodRes] = await Promise.allSettled([
          fetch(`${API_BASE}/api/cms/featured-sections?activeOnly=true`),
          fetch(`${API_BASE}/api/products`),
        ]);

        let loadedProducts = [];
        if (prodRes.status === "fulfilled" && prodRes.value.ok) {
          const pData = await prodRes.value.json();
          loadedProducts = Array.isArray(pData) ? pData : pData.products || [];
          setAllProducts(loadedProducts);
        }

        if (secRes.status === "fulfilled" && secRes.value.ok) {
          const sData = await secRes.value.json();
          if (Array.isArray(sData) && sData.length > 0) {
            setSections(sData);
            return;
          }
        }

        // Fallback default featured section
        setSections([
          {
            id: "default-featured-1",
            title: "Featured Supplements",
            subtitle: "Handpicked performance supplements crafted for real, measurable results",
            badge: "TOP PICKS",
            productIds: [],
            category: "All",
            layoutType: "carousel",
            maxItems: 8,
            isActive: true,
          },
        ]);
      } catch (err) {
        console.warn("Featured sections fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      variant: product.variant || "Standard",
      price: product.price,
      mrp: product.mrp || Math.round(product.price * 1.25),
      image: buildImageUrl(product.image),
    });
    setAddedMap((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedMap((prev) => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  const handleBuyNow = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      variant: product.variant || "Standard",
      price: product.price,
      mrp: product.mrp || Math.round(product.price * 1.25),
      image: buildImageUrl(product.image),
    });
    navigate("/checkout");
  };

  const scroll = (secId, direction) => {
    const el = scrollContainers.current[secId];
    if (!el) return;
    const scrollAmount = direction === "left" ? -320 : 320;
    el.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  if (!loading && sections.length === 0) return null;

  return (
    <div className="space-y-16 py-12 md:py-16 bg-[#fbfcfb] dark:bg-[#0c121e]/40 transition-colors">
      {sections.map((section) => {
        // Resolve products for this section
        let displayProducts = [];
        if (section.productIds && section.productIds.length > 0) {
          // Explicit product selection
          displayProducts = allProducts.filter((p) =>
            section.productIds.includes(Number(p.id)) || section.productIds.includes(String(p.id))
          );
        } else if (section.category && section.category !== "All") {
          displayProducts = allProducts.filter(
            (p) => p.category?.toLowerCase() === section.category.toLowerCase()
          );
        }

        // Fallback to top products if none matched
        if (displayProducts.length === 0) {
          displayProducts = allProducts.slice(0, section.maxItems || 8);
        } else if (section.maxItems) {
          displayProducts = displayProducts.slice(0, section.maxItems);
        }

        if (displayProducts.length === 0 && !loading) return null;

        const isCarousel = section.layoutType === "carousel" || section.layoutType !== "grid";

        return (
          <section key={section.id} className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                {section.badge && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 mb-2">
                    <FiZap size={12} className="text-emerald-600 dark:text-emerald-400" />
                    {section.badge}
                  </span>
                )}
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  {section.title}
                </h2>
                {section.subtitle && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">
                    {section.subtitle}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#2e7d32] dark:text-[#4ade80] hover:underline uppercase tracking-wide mr-2"
                >
                  View All <FiArrowRight size={13} />
                </Link>

                {isCarousel && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => scroll(section.id, "left")}
                      className="w-8 h-8 rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-white/10 hover:bg-gray-50 dark:hover:bg-white/20 text-gray-700 dark:text-gray-200 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                      aria-label="Scroll left"
                    >
                      <FiChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() => scroll(section.id, "right")}
                      className="w-8 h-8 rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-white/10 hover:bg-gray-50 dark:hover:bg-white/20 text-gray-700 dark:text-gray-200 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                      aria-label="Scroll right"
                    >
                      <FiChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Product Cards Container */}
            <div
              ref={(el) => (scrollContainers.current[section.id] = el)}
              className={
                isCarousel
                  ? "flex gap-5 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory"
                  : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5"
              }
            >
              {displayProducts.map((prod) => {
                const isAdded = addedMap[prod.id];
                const mrp = prod.mrp || Math.round(prod.price * 1.25);
                const discount = mrp > prod.price ? Math.round(((mrp - prod.price) / mrp) * 100) : 0;

                return (
                  <div
                    key={prod.id}
                    className={`group bg-white dark:bg-[#111722] rounded-2xl border border-gray-100 dark:border-white/10 p-4 transition-all duration-300 hover:shadow-xl hover:border-emerald-500/30 dark:hover:border-emerald-400/30 flex flex-col justify-between ${
                      isCarousel ? "min-w-[260px] sm:min-w-[280px] max-w-[280px] snap-start shrink-0" : ""
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-1 mb-2">
                        {discount > 0 ? (
                          <span className="bg-[#4CAF37] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md tracking-wider">
                            {discount}% OFF
                          </span>
                        ) : (
                          <span className="bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            FEATURED
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-500">
                          <FiStar size={12} className="fill-amber-400" />
                          4.9
                        </span>
                      </div>

                      {/* Image */}
                      <Link to={`/product/${prod.id}`} className="block relative aspect-square rounded-xl overflow-hidden bg-[#f7f8f6] dark:bg-white/5 mb-3 p-3">
                        <img
                          src={buildImageUrl(prod.image)}
                          alt={prod.name}
                          className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-500"
                          loading="lazy"
                        />
                      </Link>

                      {/* Category & Title */}
                      <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
                        {prod.category || "Supplements"}
                      </p>
                      <Link to={`/product/${prod.id}`} className="block">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {prod.name}
                        </h3>
                      </Link>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5">
                      {/* Pricing */}
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-lg font-black text-gray-900 dark:text-white">
                          ₹{Number(prod.price || 0).toLocaleString("en-IN")}
                        </span>
                        {mrp > prod.price && (
                          <span className="text-xs text-gray-400 line-through">
                            ₹{Number(mrp).toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={(e) => handleAddToCart(e, prod)}
                          className={`w-full py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            isAdded
                              ? "bg-emerald-600 text-white"
                              : "bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-800 dark:text-white"
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <FiCheck size={13} /> Added
                            </>
                          ) : (
                            <>
                              <FiShoppingCart size={13} /> Cart
                            </>
                          )}
                        </button>

                        <button
                          onClick={(e) => handleBuyNow(e, prod)}
                          className="w-full py-2 px-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs hover:shadow flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <FiZap size={13} /> Buy
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
