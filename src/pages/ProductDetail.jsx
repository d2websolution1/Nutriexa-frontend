import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCheckCircle,
  FiChevronRight,
  FiShoppingCart,
  FiCheck,
  FiStar,
  FiChevronLeft,
  FiZap,
} from "react-icons/fi";
import { useCart } from "../context/CartContext";
import AnimateOnView from "../components/animation/AnimateOnView";

const API_URL = "https://nutriexa-backend.onrender.com/api/products";
const BASE_URL = "https://nutriexa-backend.onrender.com";

function buildUrl(path) {
  if (!path) return "/images/placeholder.png";
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path}`;
}

export default function ProductDetail() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    setLoading(true);
    setError("");
    setActiveIdx(0);

    fetch(`${API_URL}/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Product not found");
        return res.json();
      })
      .then((data) => {
        setProduct(data);

        let imgs = [];
        if (data.images) {
          try { imgs = JSON.parse(data.images); } catch (_) { imgs = []; }
        }
        if (imgs.length === 0 && data.image) imgs = [data.image];
        setImages(imgs.map(buildUrl));
      })
      .catch(() => setError("Product not found."))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(
      {
        id: product.id,
        name: product.name,
        variant: product.variant,
        price: Number(product.price),
        mrp: product.mrp ? Number(product.mrp) : null,
        image: images[0] || "/images/placeholder.png",
      },
      qty
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(
      {
        id: product.id,
        name: product.name,
        variant: product.variant,
        price: Number(product.price),
        mrp: product.mrp ? Number(product.mrp) : null,
        image: images[0] || "/images/placeholder.png",
      },
      qty
    );
    navigate("/checkout");
  };

  const prev = () => {
    setDirection(-1);
    setActiveIdx((i) => (i === 0 ? images.length - 1 : i - 1));
  };
  const next = () => {
    setDirection(1);
    setActiveIdx((i) => (i === images.length - 1 ? 0 : i + 1));
  };
  const handleThumbnailClick = (idx) => {
    setDirection(idx > activeIdx ? 1 : -1);
    setActiveIdx(idx);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-16 md:py-20 text-center text-gray-500 text-sm">
        Loading product...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-16 md:py-20 text-center">
        <p className="text-gray-500 mb-4">Product not found.</p>
        <Link to="/products" className="text-[#4CAF37] font-semibold hover:underline">
          ← Back to Products
        </Link>
      </div>
    );
  }

  const price = Number(product.price);
  const mrp = product.mrp ? Number(product.mrp) : null;
  const discountPercent =
    mrp && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : null;
  const inStock = product.stock > 0 && product.status === "Active";
  const mainImage = images[activeIdx] || "/images/placeholder.png";

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-6 md:py-8 pb-28 md:pb-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4 md:mb-6 overflow-x-auto whitespace-nowrap">
        <Link to="/" className="hover:text-[#4CAF37]">Home</Link>
        <FiChevronRight size={12} className="flex-shrink-0" />
        <Link to="/products" className="hover:text-[#4CAF37]">Products</Link>
        <FiChevronRight size={12} className="flex-shrink-0" />
        <span className="text-[#1a1a1a] font-medium truncate">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
        {/* ── Image Gallery ── */}
        <div className="flex flex-col-reverse sm:flex-row gap-3">
          {/* Thumbnail strip: horizontal on mobile, vertical on desktop */}
          {images.length > 1 && (
            <div className="flex flex-row sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto sm:max-h-[480px] pb-1 sm:pb-0 sm:pr-0.5 scrollbar-thin">
              {images.map((src, idx) => (
                <motion.button
                  key={idx}
                  type="button"
                  onClick={() => handleThumbnailClick(idx)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${idx === activeIdx
                    ? "border-[#4CAF37] shadow-md"
                    : "border-gray-200 hover:border-gray-300"
                    }`}
                >
                  <img
                    src={src}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-contain bg-[#f3f6f2]"
                  />
                </motion.button>
              ))}
            </div>
          )}

          {/* Main image */}
          <div className="relative flex-1 aspect-square bg-[#f3f6f2] rounded-xl flex items-center justify-center overflow-hidden" onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
            {discountPercent && (
              <span className="absolute top-3 left-3 md:top-4 md:left-4 z-10 bg-[#4CAF37] text-white text-[10px] md:text-xs font-bold px-2 py-0.5 md:px-2.5 md:py-1 rounded">
                {discountPercent}% OFF
              </span>
            )}

            {images.length > 1 && (
              <>
                <motion.button
                  type="button"
                  onClick={prev}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute left-1.5 md:left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow rounded-full p-1 md:p-1.5 text-gray-600 hover:text-[#4CAF37] transition"
                >
                  <FiChevronLeft size={16} className="md:w-[18px] md:h-[18px]" />
                </motion.button>
                <motion.button
                  type="button"
                  onClick={next}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute right-1.5 md:right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow rounded-full p-1 md:p-1.5 text-gray-600 hover:text-[#4CAF37] transition"
                >
                  <FiChevronRight size={16} className="md:w-[18px] md:h-[18px]" />
                </motion.button>
              </>
            )}

            <AnimatePresence mode="wait">
              <motion.img
                key={mainImage}
                src={mainImage}
                alt={product.name}
                className="w-4/5 h-4/5 object-contain"
                initial={{ opacity: 0, x: direction > 0 ? 40 : -40 }}
                animate={{ opacity: 1, scale: hovering ? 1.2 : 1, x: 0 }}
                exit={{ opacity: 0, x: direction > 0 ? -40 : 40 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </AnimatePresence>

            {images.length > 1 && (
              <div className="absolute bottom-2 md:bottom-3 left-0 right-0 flex justify-center gap-1.5">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveIdx(idx)}
                    className={`h-1.5 md:h-2 rounded-full transition-all ${idx === activeIdx ? "bg-[#4CAF37] w-3.5 md:w-4" : "bg-gray-300 w-1.5 md:w-2"
                      }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Product Details ── */}
        <div>
          <motion.h1 initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} viewport={{ once: true }} className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#1a1a1a] mb-2">
            {product.name}
          </motion.h1>
          {product.variant && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="text-sm md:text-base text-gray-500 mb-3">{product.variant}</motion.p>
          )}

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex items-center gap-1 mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <FiStar key={i} size={13} className="md:w-[14px] md:h-[14px] fill-[#4CAF37] text-[#4CAF37]" />
            ))}
            <span className="text-xs text-gray-400 ml-1">(4.5)</span>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="flex flex-wrap items-center gap-2 md:gap-3 mb-4">
            <span className="text-xl sm:text-2xl font-extrabold text-[#1a1a1a]">
              ₹{price.toLocaleString("en-IN")}
            </span>
            {mrp && mrp > price && (
              <span className="text-gray-400 line-through text-sm md:text-base">
                ₹{mrp.toLocaleString("en-IN")}
              </span>
            )}
          </motion.div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-sm mb-5 md:mb-6">
            {inStock ? (
              <span className="text-green-600 font-semibold">In Stock</span>
            ) : (
              <span className="text-red-500 font-semibold">Out of Stock</span>
            )}
          </motion.p>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="text-sm md:text-base text-gray-600 mb-5 md:mb-6 max-w-md leading-relaxed">
            {product.description ||
              "Premium quality, lab-tested formula built for real results."}
          </motion.p>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center border border-gray-200 rounded-md">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-3 md:px-3.5 py-2 md:py-2.5 text-gray-600 hover:text-[#4CAF37]"
              >
                −
              </button>
              <span className="px-4 text-sm font-medium">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="px-3 md:px-3.5 py-2 md:py-2.5 text-gray-600 hover:text-[#4CAF37]"
              >
                +
              </button>
            </div>
          </div>

          {/* Action buttons: normal flow on desktop, sticky bottom bar on mobile */}
          <div className="hidden md:flex items-center gap-3 mb-6">
            <button
              onClick={handleAddToCart}
              disabled={!inStock || added}
              className={`flex-1 flex items-center justify-center gap-2 font-semibold py-3 rounded-md transition-colors ${!inStock
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : added
                  ? "bg-green-600 text-white"
                  : "bg-[#4CAF37] text-white hover:opacity-90"
                }`}
            >
              {added ? (
                <>
                  <FiCheck size={16} /> Added to Cart
                </>
              ) : (
                <>
                  <FiShoppingCart size={16} />
                  {inStock ? "Add to Cart" : "Out of Stock"}
                </>
              )}
            </button>

            <button
              onClick={handleBuyNow}
              disabled={!inStock}
              className={`flex-1 flex items-center justify-center gap-2 font-semibold py-3 rounded-md transition-colors ${!inStock
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-[#1a1a1a] text-white hover:opacity-90"
                }`}
            >
              <FiZap size={16} />
              Buy Now
            </button>
          </div>

          <div className="flex flex-wrap gap-3 md:gap-4 text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <FiCheckCircle className="text-[#4CAF37]" /> 100% Authentic
            </span>
            <span className="flex items-center gap-1">
              <FiCheckCircle className="text-[#4CAF37]" /> Lab Tested
            </span>
            <span className="flex items-center gap-1">
              <FiCheckCircle className="text-[#4CAF37]" /> Free Shipping above ₹1999
            </span>
          </div>
        </div>
      </div>

      {/* Sticky bottom action bar — mobile only */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3 shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
        <button
          onClick={handleAddToCart}
          disabled={!inStock || added}
          className={`flex-1 flex items-center justify-center gap-2 font-semibold py-3 rounded-md text-sm transition-colors ${!inStock
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : added
              ? "bg-green-600 text-white"
              : "bg-[#4CAF37] text-white hover:opacity-90"
            }`}
        >
          {added ? (
            <>
              <FiCheck size={16} /> Added
            </>
          ) : (
            <>
              <FiShoppingCart size={16} />
              {inStock ? "Add to Cart" : "Out of Stock"}
            </>
          )}
        </button>

        <button
          onClick={handleBuyNow}
          disabled={!inStock}
          className={`flex-1 flex items-center justify-center gap-2 font-semibold py-3 rounded-md text-sm transition-colors ${!inStock
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-[#1a1a1a] text-white hover:opacity-90"
            }`}
        >
          <FiZap size={16} />
          Buy Now
        </button>
      </div>
    </main>
  );
}