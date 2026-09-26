import { useEffect, useState, useRef } from "react";
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
  FiMaximize2,
  FiX,
  FiThumbsUp,
  FiMessageSquare,
  FiEdit3,
} from "react-icons/fi";
import { useCart } from "../context/CartContext";
import AnimateOnView from "../components/animation/AnimateOnView";
import { API_URL as BASE_URL } from "../config";

const API_URL = `${BASE_URL}/api/products`;

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
  const [direction, setDirection] = useState(1);

  // Amazon-style Magnifier Zoom State
  const [isZooming, setIsZooming] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 });
  const [bgPos, setBgPos] = useState({ x: 0, y: 0 });
  const [containerDim, setContainerDim] = useState({ width: 450, height: 450 });

  // Customer Reviews State
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewName, setReviewName] = useState("");
  const [reviewEmail, setReviewEmail] = useState("");
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [helpfulVotes, setHelpfulVotes] = useState({});

  const RATING_LABELS = {
    1: "★ Poor",
    2: "★★ Fair",
    3: "★★★ Good",
    4: "★★★★ Very Good",
    5: "★★★★★ Excellent!",
  };
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const mainImgRef = useRef(null);
  const zoomFactor = 2.5;

  const lensW = Math.round(containerDim.width / zoomFactor);
  const lensH = Math.round(containerDim.height / zoomFactor);

  const handleMouseEnter = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      if (mainImgRef.current) {
        const rect = mainImgRef.current.getBoundingClientRect();
        setContainerDim({ width: rect.width, height: rect.height });
      }
      setIsZooming(true);
    }
  };

  const handleMouseLeave = () => {
    setIsZooming(false);
  };

  const handleMouseMove = (e) => {
    if (!mainImgRef.current) return;
    const rect = mainImgRef.current.getBoundingClientRect();
    if (rect.width !== containerDim.width || rect.height !== containerDim.height) {
      setContainerDim({ width: rect.width, height: rect.height });
    }

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const currLensW = Math.round(rect.width / zoomFactor);
    const currLensH = Math.round(rect.height / zoomFactor);

    let x = mouseX - currLensW / 2;
    let y = mouseY - currLensH / 2;

    x = Math.max(0, Math.min(x, rect.width - currLensW));
    y = Math.max(0, Math.min(y, rect.height - currLensH));

    setLensPos({ x, y });
    setBgPos({ x: x * zoomFactor, y: y * zoomFactor });
  };

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

        fetchReviews(data.id, data.name);
      })
      .catch(() => setError("Product not found."))
      .finally(() => setLoading(false));
  }, [slug]);

  const fetchReviews = async (prodId, prodName) => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/reviews?status=Approved&productId=${prodId || ""}&productName=${encodeURIComponent(prodName || "")}`
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setReviews(data);
        }
      }
    } catch (err) {
      console.warn("Could not load reviews:", err);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) {
      setSubmitError("Please enter your name and review comments.");
      return;
    }
    setSubmittingReview(true);
    setSubmitError("");
    try {
      const res = await fetch(`${BASE_URL}/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product?.id,
          productName: product?.name,
          customerName: reviewName.trim(),
          customerEmail: reviewEmail.trim(),
          rating: reviewRating,
          title: reviewTitle.trim(),
          comment: reviewComment.trim(),
          status: "Approved",
        }),
      });

      if (res.ok) {
        const result = await res.json();
        setReviews((prev) => [result.review, ...prev]);
        setSubmitSuccess(true);
        setReviewTitle("");
        setReviewComment("");
        setTimeout(() => {
          setShowReviewForm(false);
          setSubmitSuccess(false);
        }, 3000);
      } else {
        const errData = await res.json();
        setSubmitError(errData.message || "Failed to submit review.");
      }
    } catch (err) {
      setSubmitError("Network error. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleHelpful = async (reviewId) => {
    if (helpfulVotes[reviewId]) return;
    setHelpfulVotes((prev) => ({ ...prev, [reviewId]: true }));
    try {
      await fetch(`${BASE_URL}/api/reviews/${reviewId}/helpful`, { method: "POST" });
    } catch (_) {}
  };

  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) /
          reviews.length
        ).toFixed(1)
      : "5.0";

  const ratingCounts = {
    5: reviews.filter((r) => Math.round(Number(r.rating)) === 5).length,
    4: reviews.filter((r) => Math.round(Number(r.rating)) === 4).length,
    3: reviews.filter((r) => Math.round(Number(r.rating)) === 3).length,
    2: reviews.filter((r) => Math.round(Number(r.rating)) === 2).length,
    1: reviews.filter((r) => Math.round(Number(r.rating)) === 1).length,
  };

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

      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
        {/* ── Image Gallery ── */}
        <div className="flex flex-col-reverse sm:flex-row gap-3">
          {/* Thumbnail strip: horizontal on mobile, vertical on desktop — handles 7+ images seamlessly */}
          {images.length > 1 && (
            <div className="flex flex-row sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto sm:max-h-[500px] pb-1 sm:pb-0 sm:pr-1 scrollbar-thin">
              {images.map((src, idx) => (
                <motion.button
                  key={idx}
                  type="button"
                  onClick={() => handleThumbnailClick(idx)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                    idx === activeIdx
                      ? "border-[#4CAF37] shadow-md ring-2 ring-[#4CAF37]/20"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  title={`Thumbnail ${idx + 1}`}
                >
                  <img
                    src={src}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-contain p-1 bg-[#f3f6f2]"
                  />
                </motion.button>
              ))}
            </div>
          )}

          {/* Main image container */}
          <div className="flex-1 flex flex-col">
            <div
              ref={mainImgRef}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
              onClick={() => setLightboxOpen(true)}
              className="relative aspect-square bg-[#f3f6f2] rounded-2xl flex items-center justify-center overflow-hidden cursor-crosshair border border-gray-100 shadow-xs select-none"
            >
              {discountPercent && (
                <span className="absolute top-3 left-3 md:top-4 md:left-4 z-10 bg-[#4CAF37] text-white text-[10px] md:text-xs font-bold px-2 py-0.5 md:px-2.5 md:py-1 rounded shadow-xs">
                  {discountPercent}% OFF
                </span>
              )}

              {/* Magnifier Lens on Image (Desktop) */}
              {isZooming && (
                <div
                  className="hidden md:block absolute pointer-events-none rounded-sm z-20"
                  style={{
                    left: `${lensPos.x}px`,
                    top: `${lensPos.y}px`,
                    width: `${lensW}px`,
                    height: `${lensH}px`,
                    border: "1.5px solid rgba(37, 99, 235, 0.7)",
                    backgroundColor: "rgba(59, 130, 246, 0.16)",
                    backgroundImage: "radial-gradient(rgba(37, 99, 235, 0.5) 1.5px, transparent 1.5px)",
                    backgroundSize: "8px 8px",
                    boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.5) inset, 0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
              )}

              {images.length > 1 && (
                <>
                  <motion.button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); prev(); }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow rounded-full p-2 text-gray-700 hover:text-[#4CAF37] transition cursor-pointer"
                  >
                    <FiChevronLeft size={18} />
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); next(); }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow rounded-full p-2 text-gray-700 hover:text-[#4CAF37] transition cursor-pointer"
                  >
                    <FiChevronRight size={18} />
                  </motion.button>
                </>
              )}

              <AnimatePresence mode="wait">
                <motion.img
                  key={mainImage}
                  src={mainImage}
                  alt={product.name}
                  className="w-full h-full object-contain p-6"
                  initial={{ opacity: 0, x: direction > 0 ? 30 : -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction > 0 ? -30 : 30 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                />
              </AnimatePresence>

              {images.length > 1 && (
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setActiveIdx(idx); }}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        idx === activeIdx ? "bg-[#4CAF37] w-5" : "bg-gray-300 w-1.5 hover:bg-gray-400"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Click to see full view & Hover hint */}
            <div className="flex items-center justify-between text-xs text-gray-400 mt-2.5 px-1">
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="text-gray-500 hover:text-[#4CAF37] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FiMaximize2 size={13} /> Click to see full view
              </button>
              <span className="hidden md:flex items-center gap-1 text-[11px] text-gray-400 font-medium">
                🔍 Roll over image to magnify
              </span>
            </div>
          </div>
        </div>

        {/* ── Side Magnified View Window (Desktop Amazon style) ── */}
        {isZooming && (
          <div
            className="hidden md:block absolute left-[calc(50%+1.25rem)] top-0 w-[calc(50%-1.25rem)] aspect-square z-30 bg-[#f3f6f2] rounded-2xl shadow-2xl border-2 border-gray-200 overflow-hidden pointer-events-none"
          >
            <div className="relative w-full h-full overflow-hidden">
              <img
                src={mainImage}
                alt="Magnified View"
                className="absolute pointer-events-none max-w-none"
                style={{
                  width: `${containerDim.width * zoomFactor}px`,
                  height: `${containerDim.height * zoomFactor}px`,
                  objectFit: "contain",
                  padding: `${24 * zoomFactor}px`,
                  left: `-${bgPos.x}px`,
                  top: `-${bgPos.y}px`,
                }}
              />
            </div>
            <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow flex items-center gap-1">
              <span>🔍</span> {zoomFactor}x Magnified View
            </div>
          </div>
        )}

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
              <FiStar
                key={i}
                size={14}
                className={
                  i < Math.round(Number(avgRating))
                    ? "fill-[#f59e0b] text-[#f59e0b]"
                    : "fill-none text-gray-300"
                }
              />
            ))}
            <span className="text-xs text-gray-700 font-bold ml-1.5">{avgRating}</span>
            <a
              href="#reviews-section"
              className="text-xs font-semibold text-[#4CAF37] hover:underline ml-2"
            >
              ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
            </a>
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

      {/* ═══════════════════════════════════════════════════════
          CUSTOMER REVIEWS & RATINGS SECTION
         ═══════════════════════════════════════════════════════ */}
      <section id="reviews-section" className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-12 border-t border-gray-100 mt-12 scroll-mt-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold tracking-wide uppercase mb-2">
              <FiCheckCircle size={13} /> Verified Customers Feedback
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1a1a1a]">
              Customer Ratings &amp; Reviews
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Real reviews from verified fitness enthusiasts and athletes.
            </p>
          </div>

          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="self-start md:self-auto inline-flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#333] text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <FiEdit3 size={16} />
            {showReviewForm ? "Close Review Form" : "Write a Review"}
          </button>
        </div>

        {/* Rating Breakdown Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-gradient-to-br from-gray-50 via-white to-emerald-50/20 p-6 sm:p-8 rounded-2xl border border-gray-200/80 shadow-xs mb-10">
          {/* Average Rating Block */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-4 border-b md:border-b-0 md:border-r border-gray-200/80 text-center">
            <span className="text-5xl sm:text-6xl font-black text-[#1a1a1a] tracking-tight">
              {avgRating}
            </span>
            <div className="flex items-center gap-1 mt-2 mb-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar
                  key={star}
                  size={18}
                  className={star <= Math.round(Number(avgRating)) ? "fill-[#f59e0b] text-[#f59e0b]" : "fill-none text-gray-300"}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 font-medium">
              Based on {reviews.length} {reviews.length === 1 ? "rating" : "ratings"}
            </span>
            <div className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/60 px-3 py-1 rounded-full">
              <FiCheckCircle size={12} /> 100% Genuine Reviews
            </div>
          </div>

          {/* Star Percentage Bars */}
          <div className="md:col-span-5 flex flex-col justify-center gap-2.5 px-2 md:px-6">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = ratingCounts[stars] || 0;
              const percent = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
              return (
                <div key={stars} className="flex items-center gap-3 text-xs">
                  <span className="w-12 font-semibold text-gray-700 flex items-center gap-1">
                    {stars} <FiStar size={11} className="fill-[#f59e0b] text-[#f59e0b]" />
                  </span>
                  <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#f59e0b] rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-10 text-right font-medium text-gray-400 text-[11px]">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Callout box */}
          <div className="md:col-span-3 flex flex-col justify-center items-center md:items-start text-center md:text-left bg-white p-5 rounded-xl border border-gray-100 shadow-xs">
            <span className="text-sm font-bold text-gray-800 mb-1">
              Have you used this product?
            </span>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Share your workout results and experience with fellow athletes.
            </p>
            <button
              onClick={() => setShowReviewForm(true)}
              className="w-full text-center bg-[#4CAF37] hover:bg-[#439e30] text-white text-xs font-bold py-2.5 px-4 rounded-lg shadow-xs transition cursor-pointer"
            >
              Share Your Experience
            </button>
          </div>
        </div>

        {/* REVIEW SUBMISSION FORM */}
        <AnimatePresence>
          {showReviewForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-10"
            >
              <form
                onSubmit={handleReviewSubmit}
                className="bg-white border-2 border-emerald-500/30 rounded-2xl p-6 sm:p-8 shadow-lg shadow-emerald-500/5 relative"
              >
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Write a Review for {product.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Your review will be verified and published for other shoppers.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                  >
                    <FiX size={20} />
                  </button>
                </div>

                {submitSuccess && (
                  <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2">
                    <FiCheckCircle className="text-emerald-600 shrink-0" size={18} />
                    <span>Thank you! Your review has been submitted successfully and published in real time.</span>
                  </div>
                )}

                {submitError && (
                  <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                    {submitError}
                  </div>
                )}

                {/* Rating Picker */}
                <div className="mb-6">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Overall Rating *
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setReviewRating(star)}
                          className="p-1 hover:scale-120 transition-transform cursor-pointer focus:outline-none"
                        >
                          <FiStar
                            size={28}
                            className={`transition-colors ${
                              star <= (hoverRating || reviewRating)
                                ? "fill-[#f59e0b] text-[#f59e0b]"
                                : "fill-none text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-sm font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md">
                      {RATING_LABELS[hoverRating || reviewRating]}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF37]/30 focus:border-[#4CAF37]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Your Email (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. rahul@example.com"
                      value={reviewEmail}
                      onChange={(e) => setReviewEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF37]/30 focus:border-[#4CAF37]"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Review Headline / Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Best protein supplement I have ever used!"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF37]/30 focus:border-[#4CAF37]"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Detailed Review *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us what you liked, mixability, taste, energy boost, or recovery results..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF37]/30 focus:border-[#4CAF37]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-[#4CAF37] hover:bg-[#439e30] rounded-lg shadow-sm transition disabled:opacity-60 cursor-pointer"
                  >
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Customer Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-12 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <FiMessageSquare className="mx-auto text-gray-400 mb-3" size={36} />
              <h4 className="text-base font-bold text-gray-800">No reviews yet for this product</h4>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Be the first athlete to review {product.name} and share your feedback!
              </p>
              <button
                onClick={() => setShowReviewForm(true)}
                className="mt-4 inline-flex items-center gap-2 bg-[#4CAF37] text-white text-xs font-bold px-5 py-2.5 rounded-lg hover:opacity-90 transition cursor-pointer"
              >
                <FiEdit3 size={14} /> Write First Review
              </button>
            </div>
          ) : (
            reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-xs hover:border-gray-200 transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {/* User Avatar Initials */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0">
                      {(rev.customerName || rev.customer_name || "U").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-gray-900">
                          {rev.customerName || rev.customer_name || "Customer"}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                          <FiCheck size={10} /> Verified Buyer
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-400">
                        {rev.date || rev.created_at
                          ? new Date(rev.date || rev.created_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "Verified Customer"}
                      </span>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-1 shrink-0">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FiStar
                        key={star}
                        size={14}
                        className={
                          star <= (Number(rev.rating) || 5)
                            ? "fill-[#f59e0b] text-[#f59e0b]"
                            : "fill-none text-gray-300"
                        }
                      />
                    ))}
                  </div>
                </div>

                {/* Review Title & Comment */}
                <div className="mt-3.5 sm:pl-13">
                  {rev.title && (
                    <h4 className="text-sm font-bold text-gray-900 mb-1">
                      {rev.title}
                    </h4>
                  )}
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {rev.comment}
                  </p>

                  {/* Helpful Button */}
                  <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                    <button
                      onClick={() => handleHelpful(rev.id)}
                      className="inline-flex items-center gap-1.5 hover:text-gray-700 text-gray-500 font-medium transition cursor-pointer"
                    >
                      <FiThumbsUp size={13} className={helpfulVotes[rev.id] ? "text-emerald-600" : ""} />
                      <span>Helpful ({Number(rev.helpful || 0) + (helpfulVotes[rev.id] ? 1 : 0)})</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

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

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-5 right-5 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer"
              title="Close"
            >
              <FiX size={24} />
            </button>

            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prev(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer"
                  title="Previous image"
                >
                  <FiChevronLeft size={28} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); next(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer"
                  title="Next image"
                >
                  <FiChevronRight size={28} />
                </button>
              </>
            )}

            <div
              className="max-w-4xl max-h-[80vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={mainImage}
                alt={product.name}
                className="max-w-full max-h-[80vh] object-contain drop-shadow-2xl rounded-lg"
              />
            </div>

            {images.length > 1 && (
              <div
                className="flex items-center gap-2 mt-4 overflow-x-auto max-w-full p-2"
                onClick={(e) => e.stopPropagation()}
              >
                {images.map((src, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIdx(idx)}
                    className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      idx === activeIdx ? "border-[#4CAF37] scale-105" : "border-white/30 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={src} alt="" className="w-full h-full object-contain bg-white/5 p-1" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}