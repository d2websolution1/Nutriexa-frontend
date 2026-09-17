import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";

import ProductCard from "../components/productspage-comp/ProductCard";
import DealsBanner from "../components/dealspage-components/DealsBanner";
import CountdownTimer from "../components/dealspage-components/CountdownTimer";

import { API_URL as API_BASE } from "../config";


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
        const endpoints = [
          API_BASE,
          "https://nutriexa-backend.onrender.com",
        ];

        let weeklyDealsData = [];
        let allProductsData = [];

        // Try primary API_BASE first, then fallback to live Render backend
        for (const base of endpoints) {
          try {
            if (weeklyDealsData.length === 0) {
              const res = await fetch(`${base}/api/coupons/weekly-deals/public`);
              if (res.ok) {
                weeklyDealsData = await res.json();
              }
            }
          } catch (e) {
            // silent retry on next endpoint
          }

          try {
            if (allProductsData.length === 0) {
              const resProd = await fetch(`${base}/api/products`);
              if (resProd.ok) {
                allProductsData = await resProd.json();
              }
            }
          } catch (e) {
            // silent retry
          }

          if (weeklyDealsData.length > 0 && allProductsData.length > 0) break;
        }

        // Map weekly deals
        const dealsMap = new Map();

        if (Array.isArray(weeklyDealsData)) {
          weeklyDealsData.forEach((d) => {
            const discPercent = Number(d.discount_percent) || 0;
            dealsMap.set(d.id, {
              id: d.id,
              slug: d.id,
              name: d.name,
              variant: d.variant,
              price: Number(d.price),
              mrp: Number(d.mrp) || Number(d.price),
              discountPercent: discPercent,
              discount: `${Math.round(discPercent)}% OFF`,
              rating: 4.8,
              reviews: 24,
              image: d.image,
            });
          });
        }

        // Also add any active products that have a discount (mrp > price)
        if (Array.isArray(allProductsData)) {
          allProductsData
            .filter(
              (p) =>
                p.status === "Active" &&
                p.mrp &&
                Number(p.mrp) > Number(p.price)
            )
            .forEach((p) => {
              if (!dealsMap.has(p.id)) {
                const discPercent = Math.round(
                  ((Number(p.mrp) - Number(p.price)) / Number(p.mrp)) * 100
                );
                dealsMap.set(p.id, {
                  id: p.id,
                  slug: p.id,
                  name: p.name,
                  variant: p.variant,
                  price: Number(p.price),
                  mrp: Number(p.mrp),
                  discountPercent: discPercent,
                  discount: `${discPercent}% OFF`,
                  rating: 4.7,
                  reviews: 18,
                  image: p.image,
                });
              }
            });
        }

        const combined = Array.from(dealsMap.values());
        if (combined.length > 0) {
          setDeals(combined);
        } else {
          setError(null);
          setDeals([]);
        }
      } catch (err) {
        console.error("Error loading deals:", err);
        setError("Unable to load deals right now. Please check back shortly.");
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