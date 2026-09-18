import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FiSliders, FiChevronRight } from "react-icons/fi";

import ProductFilters from "../components/ProductFilters";
import PromoBanner from "../components/productspage-comp/PromoBanner";
import RecommendedProducts from "../components/productspage-comp/RecommendedProducts";
import ProductCard from "../components/productspage-comp/ProductCard";

const API_URL = "https://nutriexa-backend.onrender.com/api/products";
const BASE_URL = "https://nutriexa-backend.onrender.com";

function buildImageUrl(path) {
  if (!path) return "/images/placeholder.png";
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path}`;
}

const CATEGORIES = [
  { slug: "whey-proteins", label: "Whey Proteins" },
  { slug: "mass-gainers", label: "Mass Gainers" },
  { slug: "pre-workouts", label: "Pre-Workouts" },
  { slug: "creatine", label: "Creatine" },
  { slug: "amino-acids", label: "Amino Acids" },
  { slug: "health-wellness", label: "Health & Wellness" },
  { slug: "accessories", label: "Accessories" },
];

const GOALS = ["Muscle Gain", "Weight Loss", "Strength", "Endurance", "Wellness"];

const GOAL_MAPPINGS = {
  "Muscle Gain": {
    categories: ["whey-proteins", "mass-gainers", "creatine", "amino-acids"],
    keywords: ["protein", "mass", "gainer", "creatine", "muscle", "bulk", "whey"],
  },
  "Weight Loss": {
    categories: ["health-wellness", "pre-workouts", "amino-acids"],
    keywords: ["loss", "burn", "shred", "lean", "isolate", "wellness", "cut", "omega"],
  },
  "Strength": {
    categories: ["pre-workouts", "creatine", "whey-proteins"],
    keywords: ["strength", "power", "creatine", "pre workout", "pump"],
  },
  "Endurance": {
    categories: ["pre-workouts", "amino-acids", "health-wellness"],
    keywords: ["endurance", "energy", "bcaa", "amino", "recovery", "intra"],
  },
  "Wellness": {
    categories: ["health-wellness", "accessories"],
    keywords: ["wellness", "health", "vitamin", "omega", "shaker", "fish oil", "daily"],
  },
};

const DISCOUNT_OPTIONS = [
  { value: "up-to-30", label: "Up to 30% OFF" },
  { value: "30-to-40", label: "30% - 40% OFF" },
  { value: "40-to-70", label: "40% - 70% OFF" },
  { value: "70-plus", label: "70% OFF & above" },
];

const getDiscountPercent = (product) => {
  if (!product.mrp || product.mrp <= product.price) return 0;
  return Math.round(((product.mrp - product.price) / product.mrp) * 100);
};

const matchesDiscountFilter = (product, discountValue) => {
  if (!discountValue) return true;
  const pct = getDiscountPercent(product);

  switch (discountValue) {
    case "up-to-30":
      return pct > 0 && pct <= 30;
    case "30-to-40":
      return pct > 30 && pct <= 40;
    case "40-to-70":
      return pct > 40 && pct <= 70;
    case "70-plus":
      return pct > 70;
    default:
      return true;
  }
};

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category");
  const initialGoal = searchParams.get("goal");
  const searchQuery = searchParams.get("search") || "";

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedCategories, setSelectedCategories] = useState(
    initialCategory ? [initialCategory] : []
  );
  const [selectedGoals, setSelectedGoals] = useState(
    initialGoal ? [initialGoal] : []
  );
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [sortBy, setSortBy] = useState("featured");
  const [isSorting, setIsSorting] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) {
      setSelectedCategories([cat]);
    }
    const g = searchParams.get("goal");
    if (g) {
      setSelectedGoals([g]);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(API_URL);
        const data = await res.json();

        const transformed = data
          .filter((p) => p.status === "Active")
          .map((p) => ({
            slug: String(p.id),
            id: p.id,
            name: p.name,
            variant: p.variant,
            category: p.category,
            price: Number(p.price),
            mrp: p.mrp ? Number(p.mrp) : null,
            discount:
              p.mrp && p.price
                ? `${Math.round(((p.mrp - p.price) / p.mrp) * 100)}% OFF`
                : null,
            rating: 4.5,
            reviews: 0,
            image: buildImageUrl(p.image),
          }));

        setAllProducts(transformed);
      } catch (err) {
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categoriesWithCount = useMemo(
    () =>
      CATEGORIES.map((cat) => ({
        ...cat,
        count: allProducts.filter((p) => p.category === cat.slug).length,
      })),
    [allProducts]
  );

  const toggleCategory = (slug) =>
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]
    );

  const toggleGoal = (goal) =>
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );

  const clearAll = () => {
    setSelectedCategories([]);
    setSelectedGoals([]);
    setSelectedDiscount(null);
    setPriceRange({ min: 0, max: 10000 });
  };

  const handleSortChange = (e) => {
    const nextSort = e.target.value;
    setIsSorting(true);
    setSortBy(nextSort);
    setTimeout(() => {
      setIsSorting(false);
    }, 300);
  };

  const filteredProducts = useMemo(() => {
    const minP = typeof priceRange === "object" && priceRange !== null ? priceRange.min : 0;
    const maxP = typeof priceRange === "object" && priceRange !== null ? priceRange.max : (typeof priceRange === "number" ? priceRange : 10000);

    let list = allProducts.filter((p) => p.price >= minP && p.price <= maxP);

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((p) =>
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.variant?.toLowerCase().includes(q)
      );
    }

    if (selectedCategories.length > 0) {
      list = list.filter((p) => selectedCategories.includes(p.category));
    }

    if (selectedDiscount) {
      list = list.filter((p) => matchesDiscountFilter(p, selectedDiscount));
    }

    if (selectedGoals.length > 0) {
      list = list.filter((p) => {
        const prodName = (p.name || "").toLowerCase();
        const prodVariant = (p.variant || "").toLowerCase();
        const prodCat = (p.category || "").toLowerCase();

        return selectedGoals.some((goal) => {
          const mapping = GOAL_MAPPINGS[goal];
          if (!mapping) return false;
          if (mapping.categories.includes(prodCat)) return true;
          return mapping.keywords.some(
            (kw) => prodName.includes(kw) || prodVariant.includes(kw) || prodCat.includes(kw)
          );
        });
      });
    }

    if (sortBy === "price-low") {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      list = [...list].sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      list = [...list].sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "alpha-asc") {
      list = [...list].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (sortBy === "alpha-desc") {
      list = [...list].sort((a, b) => (b.name || "").localeCompare(a.name || ""));
    } else if (sortBy === "date-old") {
      list = [...list].sort((a, b) => Number(a.id) - Number(b.id));
    } else if (sortBy === "date-new") {
      list = [...list].sort((a, b) => Number(b.id) - Number(a.id));
    }

    return list;
  }, [allProducts, selectedCategories, selectedGoals, selectedDiscount, priceRange, sortBy, searchQuery]);

  const recommended = useMemo(
    () =>
      allProducts
        .filter((p) => !filteredProducts.some((fp) => fp.slug === p.slug))
        .slice(0, 4),
    [allProducts, filteredProducts]
  );

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-10 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
        <Link to="/" className="hover:text-[#4CAF37]">
          Home
        </Link>
        <FiChevronRight size={12} />
        <span className="text-[#1a1a1a] font-medium">Products</span>
      </div>

      <PromoBanner
        products={allProducts}
        selectedDiscount={selectedDiscount}
        onSelectDiscount={setSelectedDiscount}
      />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#1a1a1a]">
          All Products
        </h1>
        <span className="text-sm text-gray-500 hidden sm:block">
          {filteredProducts.length} products
        </span>
      </div>

      <div className="grid md:grid-cols-[260px_1fr] gap-8">
        {/* Filters — desktop */}
        <aside className="hidden md:block">
          <ProductFilters
            categories={categoriesWithCount}
            selectedCategories={selectedCategories}
            onToggleCategory={toggleCategory}
            priceRange={priceRange}
            onPriceChange={setPriceRange}
            goals={GOALS}
            selectedGoals={selectedGoals}
            onToggleGoal={toggleGoal}
            onClearAll={clearAll}
            discountOptions={DISCOUNT_OPTIONS}
            selectedDiscount={selectedDiscount}
            onSelectDiscount={setSelectedDiscount}
          />
        </aside>

        {/* Filters — mobile drawer */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setShowMobileFilters(false)}
            />
            <div className="absolute left-0 top-0 bottom-0 w-[85%] max-w-sm bg-[#f8f9f7] overflow-y-auto p-4">
              <ProductFilters
                categories={categoriesWithCount}
                selectedCategories={selectedCategories}
                onToggleCategory={toggleCategory}
                priceRange={priceRange}
                onPriceChange={setPriceRange}
                goals={GOALS}
                selectedGoals={selectedGoals}
                onToggleGoal={toggleGoal}
                onClearAll={clearAll}
                discountOptions={DISCOUNT_OPTIONS}
                selectedDiscount={selectedDiscount}
                onSelectDiscount={setSelectedDiscount}
                onClose={() => setShowMobileFilters(false)}
              />
            </div>
          </div>
        )}

        {/* Product grid */}
        <div>
          <div className="flex items-center justify-between mb-5 gap-3">
            <button
              onClick={() => setShowMobileFilters(true)}
              className="md:hidden flex items-center gap-2 text-sm font-semibold text-[#1a1a1a] border border-gray-200 rounded-md px-3 py-2"
            >
              <FiSliders size={16} /> Filters
            </button>

            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-gray-500 hidden sm:inline font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="text-sm font-semibold border border-gray-200 rounded-lg px-3 py-2 text-[#1a1a1a] bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF37]/30 focus:border-[#4CAF37] transition-all cursor-pointer hover:border-gray-300"
              >
                <option value="featured">Featured</option>
                <option value="most-relevant">Most relevant</option>
                <option value="best-selling">Best selling</option>
                <option value="alpha-asc">Alphabetically, A-Z</option>
                <option value="alpha-desc">Alphabetically, Z-A</option>
                <option value="price-low">Price, low to high</option>
                <option value="price-high">Price, high to low</option>
                <option value="date-old">Date, old to new</option>
                <option value="date-new">Date, new to old</option>
                <option value="rating">Customer Rating ★</option>
              </select>
            </div>
          </div>

          {/* Active Search Query Pill */}
          {searchQuery && (
            <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#22c55e]/10 border border-[#22c55e]/30 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 text-xs text-gray-800 dark:text-gray-200 flex-wrap">
                <span>Search results for</span>
                <span className="font-bold text-[#22c55e]">"{searchQuery}"</span>
                <span className="text-gray-500">
                  ({filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"} found)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to="/products"
                  className="text-xs font-semibold text-[#22c55e] hover:text-[#1ea850] flex items-center gap-1 border border-[#22c55e]/40 rounded-lg px-3 py-1.5 transition-colors hover:bg-[#22c55e]/10"
                >
                  View All Products →
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    const next = new URLSearchParams(searchParams);
                    next.delete("search");
                    setSearchParams(next);
                  }}
                  className="text-xs font-semibold text-gray-500 hover:text-red-500 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  Clear Search ✕
                </button>
              </div>
            </div>
          )}

          {/* Active Goal or Category Filters Pills */}
          {(selectedGoals.length > 0 || selectedCategories.length > 0 || selectedDiscount) && (
            <div className="mb-4 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-500 font-semibold">Active:</span>
              {selectedDiscount && (
                <span className="inline-flex items-center gap-1.5 bg-[#4CAF37]/15 text-[#4CAF37] text-xs font-bold px-3 py-1 rounded-full border border-[#4CAF37]/30">
                  🔥 {DISCOUNT_OPTIONS.find((opt) => opt.value === selectedDiscount)?.label}
                  <button
                    type="button"
                    onClick={() => setSelectedDiscount(null)}
                    className="hover:text-red-500 cursor-pointer ml-1 text-sm font-black"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedGoals.map((g) => (
                <span
                  key={g}
                  className="inline-flex items-center gap-1.5 bg-[#4CAF37]/15 text-[#4CAF37] dark:text-[#22c55e] text-xs font-bold px-3 py-1 rounded-full border border-[#4CAF37]/30"
                >
                  🎯 {g}
                  <button
                    type="button"
                    onClick={() => toggleGoal(g)}
                    className="hover:text-red-500 cursor-pointer ml-1 text-sm font-black"
                  >
                    ×
                  </button>
                </span>
              ))}
              {selectedCategories.map((c) => {
                const catObj = CATEGORIES.find((cat) => cat.slug === c);
                return (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200 text-xs font-medium px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700"
                  >
                    {catObj?.label || c}
                    <button
                      type="button"
                      onClick={() => toggleCategory(c)}
                      className="hover:text-red-500 cursor-pointer ml-1 text-sm font-black"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
              <button
                type="button"
                onClick={clearAll}
                className="text-xs font-semibold text-gray-400 hover:text-red-500 underline ml-1 cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}


          {loading && (
            <div className="text-center py-20 text-gray-500 text-sm">
              Loading products...
            </div>
          )}

          {!loading && error && (
            <div className="text-center py-20 text-red-500 text-sm">{error}</div>
          )}

          {!loading && !error && filteredProducts.length === 0 && (
            <div className="text-center py-20 text-gray-500 text-sm">
              No products match the selected filters.
            </div>
          )}

          {!loading && !error && filteredProducts.length > 0 && (
            <div
              key={sortBy}
              className={`grid grid-cols-2 sm:grid-cols-3 gap-4 transition-all duration-300 ${
                isSorting
                  ? "opacity-30 scale-[0.99] translate-y-1"
                  : "opacity-100 scale-100 translate-y-0"
              }`}
            >
              {filteredProducts.map((product, idx) => (
                <div
                  key={product.slug}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${Math.min(idx * 35, 200)}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {!loading && !error && <RecommendedProducts products={recommended} />}
    </main>
  );
}