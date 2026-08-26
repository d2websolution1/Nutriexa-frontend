import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FiSliders, FiChevronRight } from "react-icons/fi";

import ProductFilters from "../components/ProductFilters";
import PromoBanner from "../components/productspage-comp/PromoBanner";
import RecommendedProducts from "../components/productspage-comp/RecommendedProducts";
import ProductCard from "../components/productspage-comp/ProductCard";

const API_URL = "http://https://nutriexa-backend.onrender.com/api/products";

const CATEGORIES = [
  { slug: "whey-proteins", label: "Whey Proteins" },
  { slug: "mass-gainers", label: "Mass Gainers" },
  { slug: "pre-workouts", label: "Pre-Workouts" },
  { slug: "amino-acids", label: "Amino Acids" },
  { slug: "health-wellness", label: "Health & Wellness" },
  { slug: "accessories", label: "Accessories" },
];

const GOALS = ["Muscle Gain", "Weight Loss", "Strength", "Endurance", "Wellness"];

export default function Products() {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category");

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedCategories, setSelectedCategories] = useState(
    initialCategory ? [initialCategory] : []
  );
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [priceRange, setPriceRange] = useState(10000);
  const [sortBy, setSortBy] = useState("popular");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(API_URL);
        const data = await res.json();

        // Backend se aayi hui shape ko ProductCard ke expected shape mein transform karo
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
            image: p.image ? `http://https://nutriexa-backend.onrender.com${p.image}` : "/images/placeholder.png",
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
    setPriceRange(10000);
  };

  const filteredProducts = useMemo(() => {
    let list = allProducts.filter((p) => p.price <= priceRange);

    if (selectedCategories.length > 0) {
      list = list.filter((p) => selectedCategories.includes(p.category));
    }

    if (sortBy === "price-low") {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      list = [...list].sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      list = [...list].sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [allProducts, selectedCategories, priceRange, sortBy]);

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

      <PromoBanner />

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

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="ml-auto text-sm border border-gray-200 rounded-md px-3 py-2 text-[#1a1a1a] focus:outline-none focus:ring-1 focus:ring-[#4CAF37]"
            >
              <option value="popular">Sort: Popularity</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
            </select>
          </div>

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
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {!loading && !error && <RecommendedProducts products={recommended} />}
    </main>
  );
}