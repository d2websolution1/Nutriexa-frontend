import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";

import ProductCard from "../components/productspage-comp/ProductCard";
import DealsBanner from "../components/dealspage-components/DealsBanner";
import CountdownTimer from "../components/dealspage-components/CountdownTimer";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Deals() {
  const [sortBy, setSortBy] = useState("discount");
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDeals = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/coupons/weekly-deals/public`);
        if (!res.ok) throw new Error("Failed to fetch deals.");
        const data = await res.json();

        const mapped = data.map((d) => ({
          id: d.id,
          slug: d.id,
          name: d.name,
          variant: d.variant,
          price: Number(d.price),
          mrp: Number(d.mrp) || Number(d.price),
          discountPercent: Number(d.discount_percent),
          discount: `${d.discount_percent}% OFF`,
          rating: 4.5,
          reviews: 0,
          image: d.image,
        }));

        setDeals(mapped);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  const sortedDeals = useMemo(() => {
    const list = [...deals];
    if (sortBy === "discount") {
      return list.sort((a, b) => b.discountPercent - a.discountPercent);
    }
    if (sortBy === "price-low") {
      return list.sort((a, b) => a.price - b.price);
    }
    if (sortBy === "price-high") {
      return list.sort((a, b) => b.price - a.price);
    }
    return list;
  }, [sortBy, deals]);

  return (
    <main>
      <DealsBanner />

      <div className="max-w-7xl mx-auto px-4 md:px-10">
        <div className="-mt-7 relative z-10 flex justify-center">
          <CountdownTimer />
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-8 mb-4">
          <Link to="/" className="hover:text-[#4CAF37]">
            Home
          </Link>
          <FiChevronRight size={12} />
          <span className="text-[#1a1a1a] font-medium">Deals</span>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-extrabold text-[#1a1a1a] uppercase tracking-tight">
            All Deals
          </h2>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-gray-200 rounded-md px-3 py-2 text-[#1a1a1a] focus:outline-none focus:ring-1 focus:ring-[#4CAF37]"
          >
            <option value="discount">Sort: Biggest Discount</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        {loading ? (
          <p className="text-center text-gray-400 text-sm py-16">Loading deals...</p>
        ) : error ? (
          <p className="text-center text-red-500 text-sm py-16">{error}</p>
        ) : sortedDeals.length === 0 ? (
          <p className="text-center text-gray-500 text-sm py-16">No active deals right now.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pb-16">
            {sortedDeals.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}