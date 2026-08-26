import { useState } from "react";
import { Link } from "react-router-dom";
import { FiHeart, FiShoppingCart, FiStar, FiCheck } from "react-icons/fi";
import { useCart } from "../../context/CartContext";

const API_BASE = import.meta.env.VITE_API_URL || "   https://nutriexa-backend.onrender.com";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const {
    slug,
    id,
    name,
    variant,
    image,
    price,
    mrp,
    rating = 4.5,
    reviews = 0,
    discount,
  } = product;

  const imageSrc = image?.startsWith("/") ? `${API_BASE}${image}` : image;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: id ?? slug,
      name,
      variant,
      price,
      mrp,
      image: imageSrc,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group relative bg-white rounded-lg border border-gray-100 hover:border-[#4CAF37] hover:shadow-md transition-all p-4">
      {discount && (
        <span className="absolute top-3 left-3 z-10 bg-[#4CAF37] text-white text-[10px] font-bold px-2 py-1 rounded">
          {discount}
        </span>
      )}

      <button
        aria-label="Add to wishlist"
        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#4CAF37] hover:border-[#4CAF37]"
      >
        <FiHeart size={15} />
      </button>

      <Link to={`/product/${slug ?? id}`} className="block">
        <div className="w-full aspect-square flex items-center justify-center mb-3">
          <img
            src={imageSrc}
            alt={name}
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
          />
        </div>

        <div className="flex items-center gap-1 mb-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <FiStar
              key={i}
              size={12}
              className={
                i < Math.round(rating)
                  ? "fill-[#4CAF37] text-[#4CAF37]"
                  : "text-gray-300"
              }
            />
          ))}
          {reviews > 0 && (
            <span className="text-[10px] text-gray-400 ml-1">({reviews})</span>
          )}
        </div>

        <h4 className="text-sm font-bold text-[#1a1a1a] leading-tight line-clamp-2">
          {name}
        </h4>
        <p className="text-xs text-gray-500 mt-1">{variant}</p>
      </Link>

      <div className="flex items-baseline gap-2 mt-2">
        <span className="text-base font-extrabold text-[#1a1a1a]">
          ₹{price.toLocaleString("en-IN")}
        </span>
        {mrp && mrp > price && (
          <span className="text-xs text-gray-400 line-through">
            ₹{mrp.toLocaleString("en-IN")}
          </span>
        )}
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