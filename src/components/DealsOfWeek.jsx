import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiChevronLeft, FiChevronRight, FiArrowRight, FiCheck, FiShoppingCart } from "react-icons/fi";
import { useCart } from "../context/CartContext";

const API_URL = "http://localhost:5000/api/products";

function DealCard({ deal }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: deal.id,
      name: deal.name,
      variant: deal.variant,
      price: deal.price,
      mrp: deal.mrp,
      image: deal.image,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div
      data-deal-card
      className="snap-start bg-[#f7f8f6] rounded-lg border border-gray-100 p-4 relative flex flex-col"
    >
      <span className="absolute top-3 left-3 bg-[#4CAF37] text-white text-[10px] font-bold px-2 py-1 rounded">
        {deal.discount}
      </span>

      <Link to={`/product/${deal.id}`} className="block">
        <div className="w-full aspect-square flex items-center justify-center mb-3">
          <img
            src={deal.image}
            alt={deal.name}
            className="max-h-full max-w-full object-contain"
          />
        </div>
        <h4 className="text-sm font-bold text-[#1a1a1a] leading-tight line-clamp-2">
          {deal.name}
        </h4>
        <p className="text-xs text-gray-500 mt-1">{deal.variant}</p>
      </Link>

      <div className="flex items-baseline gap-2 mt-2">
        <span className="text-base font-extrabold text-[#1a1a1a]">
          ₹{deal.price.toLocaleString("en-IN")}
        </span>
        <span className="text-xs text-gray-400 line-through">
          ₹{deal.mrp.toLocaleString("en-IN")}
        </span>
      </div>

      <button
        onClick={handleAddToCart}
        disabled={added}
        className={`mt-3 w-full flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wide py-2.5 rounded-md transition-all duration-200 ${
          added
            ? "bg-green-600 text-white scale-[0.98]"
            : "bg-[#4CAF37] text-white hover:opacity-90"
        }`}
      >
        {added ? (
          <>
            <FiCheck size={14} /> Added
          </>
        ) : (
          <>
            <FiShoppingCart size={14} /> Add to Cart
          </>
        )}
      </button>
    </div>
  );
}

export default function DealsOfWeek() {
  const scrollRef = useRef(null);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();

        const withDiscount = data
          .filter(
            (p) =>
              p.status === "Active" &&
              p.mrp &&
              Number(p.mrp) > Number(p.price)
          )
          .map((p) => ({
            id: p.id,
            name: p.name,
            variant: p.variant,
            price: Number(p.price),
            mrp: Number(p.mrp),
            discount: `${Math.round(
              ((p.mrp - p.price) / p.mrp) * 100
            )}% OFF`,
            image: p.image
              ? `http://localhost:5000${p.image}`
              : "https://placehold.co/300x300/f0f4ee/4CAF37?text=No+Image",
          }))
          .sort(
            (a, b) =>
              Math.round(((b.mrp - b.price) / b.mrp) * 100) -
              Math.round(((a.mrp - a.price) / a.mrp) * 100)
          )
          .slice(0, 8);

        setDeals(withDiscount);
      } catch (err) {
        console.error("Failed to fetch deals:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  const scrollByCard = (direction) => {
    if (!scrollRef.current) return;
    const card = scrollRef.current.querySelector("[data-deal-card]");
    const amount = card ? card.offsetWidth + 16 : 220;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (loading || deals.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-10 py-10 md:py-14">
      {/* Section header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl md:text-2xl font-extrabold text-[#1a1a1a] uppercase tracking-tight">
          Deals of the Week
        </h3>
        <Link
          to="/deals"
          className="flex items-center gap-1 text-sm font-semibold text-[#4CAF37] hover:underline"
        >
          View All Deals <FiArrowRight size={16} />
        </Link>
      </div>

      <div className="relative">
        {/* Left arrow */}
        <button
          onClick={() => scrollByCard("left")}
          aria-label="Scroll left"
          className="hidden md:flex absolute -left-4 top-[38%] -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-gray-200 shadow items-center justify-center text-gray-500 hover:border-[#4CAF37] hover:text-[#4CAF37]"
        >
          <FiChevronLeft size={18} />
        </button>

        {/* Cards row */}
        <div
          ref={scrollRef}
          className="grid grid-flow-col auto-cols-[calc(50%-8px)] sm:auto-cols-[220px] md:auto-cols-fr md:grid-flow-row md:grid-cols-5 gap-4 overflow-x-auto md:overflow-visible scroll-smooth snap-x snap-mandatory no-scrollbar pb-1"
        >
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scrollByCard("right")}
          aria-label="Scroll right"
          className="hidden md:flex absolute -right-4 top-[38%] -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-gray-200 shadow items-center justify-center text-gray-500 hover:border-[#4CAF37] hover:text-[#4CAF37]"
        >
          <FiChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}