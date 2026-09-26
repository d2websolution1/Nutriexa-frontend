import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FiCheckCircle,
  FiArrowRight,
  FiChevronLeft,
  FiChevronRight,
  FiZap,
} from "react-icons/fi";
import heroProductImage from "../assets/homepage-img/hero-product.png";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "../config";

const DEFAULT_BANNER = {
  id: "default-1",
  title: "FUEL YOUR POTENTIAL",
  subtitle: "Premium Supplements for Peak Performance & Faster Results",
  cta: "SHOP NOW",
  ctaLink: "/products",
  image: heroProductImage,
  bgGradient: "from-emerald-600 to-teal-700",
  isActive: true,
};

const GRADIENT_MAP = {
  "from-indigo-600 to-purple-700": "from-indigo-900/90 via-[#1e1b4b] to-purple-950/90",
  "from-emerald-600 to-teal-700": "from-emerald-950/90 via-[#062c24] to-teal-950/90",
  "from-orange-500 to-rose-600": "from-amber-950/90 via-[#351010] to-rose-950/90",
  "from-blue-600 to-cyan-500": "from-blue-950/90 via-[#0b2447] to-cyan-950/90",
  "from-violet-600 to-pink-600": "from-purple-950/90 via-[#2f0c3d] to-pink-950/90",
};

const ACCENT_COLOR_MAP = {
  "from-indigo-600 to-purple-700": { bg: "bg-indigo-500", text: "text-indigo-400", border: "border-indigo-500/30" },
  "from-emerald-600 to-teal-700": { bg: "bg-[#4CAF37]", text: "text-[#4CAF37]", border: "border-[#4CAF37]/30" },
  "from-orange-500 to-rose-600": { bg: "bg-orange-500", text: "text-orange-400", border: "border-orange-500/30" },
  "from-blue-600 to-cyan-500": { bg: "bg-cyan-500", text: "text-cyan-400", border: "border-cyan-500/30" },
  "from-violet-600 to-pink-600": { bg: "bg-pink-500", text: "text-pink-400", border: "border-pink-500/30" },
};

export default function Hero() {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    async function loadBanners() {
      try {
        const res = await fetch(`${API_URL}/api/cms/banners?activeOnly=true`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setBanners(data);
            return;
          }
        }
      } catch (err) {
        console.warn("Could not fetch CMS banners, using defaults:", err.message);
      }
      setBanners([
        {
          id: 1,
          title: "Summer Sale - Up to 50% OFF",
          subtitle: "On all Whey Proteins & Mass Gainers. Limited stock available!",
          cta: "Shop Now",
          ctaLink: "/deals",
          image: heroProductImage,
          bgGradient: "from-indigo-600 to-purple-700",
          isActive: true,
        },
        {
          id: 2,
          title: "New Arrivals: Pre-Workout Stack",
          subtitle: "Maximum Energy. Maximum Results. Fuel your peak performance.",
          cta: "Explore Now",
          ctaLink: "/products",
          image: heroProductImage,
          bgGradient: "from-emerald-600 to-teal-700",
          isActive: true,
        },
      ]);
    }
    loadBanners();
  }, []);

  const activeBanners = banners.length > 0 ? banners : [DEFAULT_BANNER];

  // Auto-advance slider
  useEffect(() => {
    if (activeBanners.length <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 5500);

    return () => clearInterval(timerRef.current);
  }, [activeBanners.length, isPaused, currentIndex]);

  const currentBanner = activeBanners[currentIndex] || activeBanners[0];
  const bgClasses = GRADIENT_MAP[currentBanner.bgGradient] || "from-slate-900 via-gray-900 to-neutral-900";
  const accent = ACCENT_COLOR_MAP[currentBanner.bgGradient] || {
    bg: "bg-[#4CAF37]",
    text: "text-[#4CAF37]",
    border: "border-[#4CAF37]/30",
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  const highlights = [
    { label: "100% Authentic" },
    { label: "Lab Tested" },
    { label: "Results Driven" },
    { label: "Free Shipping 999+" },
  ];

  return (
    <section
      className="relative overflow-hidden bg-[#090d16] text-white transition-all duration-700 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background dynamic gradient mesh */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${bgClasses} opacity-95 transition-all duration-1000`}
      />

      {/* Decorative ambient glowing orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-indigo-500/15 blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-white/[0.02] blur-[100px] pointer-events-none" />

      {/* Subtle Grid texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-12 sm:py-16 md:py-20 min-h-[500px] md:min-h-[560px] flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBanner.id || currentIndex}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="w-full grid md:grid-cols-12 gap-8 md:gap-12 items-center"
          >
            {/* Left Column: Headline, Subtitle, Highlights, CTA */}
            <div className="md:col-span-7 text-center md:text-left z-10">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold tracking-wide uppercase mb-5"
              >
                <FiZap className="text-amber-400 animate-pulse" size={13} />
                <span className="text-white/90">Official Nutriexa Store Promotion</span>
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[1.08] tracking-tight drop-shadow-sm text-white"
              >
                {currentBanner.title}
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22, duration: 0.4 }}
                className="mt-4 sm:mt-5 text-gray-300 text-sm sm:text-base md:text-lg max-w-xl mx-auto md:mx-0 leading-relaxed"
              >
                {currentBanner.subtitle}
              </motion.p>

              {/* Trust badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="mt-6 sm:mt-7 grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-lg mx-auto md:mx-0"
              >
                {highlights.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-center md:justify-start gap-1.5 p-2 rounded-lg bg-white/[0.06] backdrop-blur-xs border border-white/[0.08]"
                  >
                    <FiCheckCircle className="text-emerald-400 shrink-0" size={15} />
                    <span className="text-[11px] font-semibold text-gray-200 truncate">
                      {item.label}
                    </span>
                  </div>
                ))}
              </motion.div>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38, duration: 0.4 }}
                className="mt-8 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4"
              >
                <Link
                  to={currentBanner.ctaLink || "/products"}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#4CAF37] to-[#3d912c] hover:from-[#57c93f] hover:to-[#46a532] text-white font-bold text-sm sm:text-base px-8 py-3.5 rounded-xl shadow-lg shadow-green-900/40 hover:shadow-green-900/60 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  {currentBanner.cta || "Shop Now"}
                  <FiArrowRight size={18} />
                </Link>

                <Link
                  to="/deals"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-white/90 text-sm font-semibold transition backdrop-blur-md"
                >
                  View All Offers
                </Link>
              </motion.div>
            </div>

            {/* Right Column: Hero Showcase Image with Authenticity Stamp */}
            <div className="md:col-span-5 relative flex justify-center items-center mt-6 md:mt-0">
              {/* Product Glow */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-full bg-emerald-500/20 blur-3xl" />
              </div>

              {/* Product Image */}
              <motion.div
                initial={{ scale: 0.88, opacity: 0, rotate: -2 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative z-10 max-w-[280px] sm:max-w-[340px] md:max-w-[400px] flex items-center justify-center"
              >
                <img
                  src={currentBanner.image || heroProductImage}
                  alt={currentBanner.title}
                  className="w-full h-auto max-h-[380px] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.7)]"
                  onError={(e) => {
                    // Fallback to default product image if custom image URL fails
                    e.target.onerror = null;
                    e.target.src = heroProductImage;
                  }}
                />

                {/* Rotating Authenticity Badge */}
                <div className="absolute -top-3 -right-2 sm:right-2 bg-black/70 backdrop-blur-md border border-emerald-400/40 text-emerald-400 rounded-full w-20 h-20 sm:w-22 sm:h-22 p-2 flex flex-col items-center justify-center text-center shadow-xl shadow-black/50 rotate-6 pointer-events-none">
                  <span className="text-[9px] font-extrabold tracking-wider uppercase text-gray-300">100%</span>
                  <span className="text-[10px] font-black tracking-tight text-emerald-400">ORIGINAL</span>
                  <span className="text-[8px] font-medium text-gray-400">VERIFIED</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Prev/Next Navigation Controls */}
        {activeBanners.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              aria-label="Previous Banner"
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-20 cursor-pointer shadow-lg"
            >
              <FiChevronLeft size={22} />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next Banner"
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-20 cursor-pointer shadow-lg"
            >
              <FiChevronRight size={22} />
            </button>

            {/* Bottom Dots Indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
              {activeBanners.map((b, idx) => (
                <button
                  key={b.id || idx}
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Slide ${idx + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentIndex
                      ? "w-8 bg-[#4CAF37]"
                      : "w-2 bg-white/30 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}