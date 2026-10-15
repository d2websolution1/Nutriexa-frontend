import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FiCheckCircle,
  FiArrowRight,
  FiChevronLeft,
  FiChevronRight,
  FiZap,
  FiShield,
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
    }, 6000);

    return () => clearInterval(timerRef.current);
  }, [activeBanners.length, isPaused, currentIndex]);

  const currentBanner = activeBanners[currentIndex] || DEFAULT_BANNER;

  const isCustomBg =
    currentBanner?.bgGradient &&
    (currentBanner.bgGradient.startsWith("linear-gradient") ||
      currentBanner.bgGradient.startsWith("radial-gradient") ||
      currentBanner.bgGradient.startsWith("#") ||
      currentBanner.bgGradient.startsWith("rgb"));

  const bgClasses = !isCustomBg
    ? GRADIENT_MAP[currentBanner.bgGradient] || "from-slate-900 via-gray-900 to-neutral-900"
    : "";

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  const resolveBannerImage = (img) => {
    if (!img || !img.trim()) return heroProductImage;
    if (img.startsWith("http") || img.startsWith("data:")) return img;
    return `${API_URL}${img.startsWith("/") ? "" : "/"}${img}`;
  };

  const highlights = [
    { label: "100% Authentic" },
    { label: "Lab Tested" },
    { label: "Results Driven" },
    { label: "Free Shipping 999+" },
  ];

  return (
    <section
      className="relative overflow-hidden bg-[#070b12] text-white select-none transition-all duration-700"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative min-h-[360px] sm:min-h-[520px] md:min-h-[620px] flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBanner.id || currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full flex items-center"
          >
            {/* 1. Full-section Banner Image Background */}
            <div className="absolute inset-0 w-full h-full overflow-hidden">
              {/* Atmospheric blurred ambient layer for mobile so the full aspect ratio has no empty borders */}
              <img
                src={resolveBannerImage(currentBanner.image)}
                alt=""
                aria-hidden="true"
                className="md:hidden absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110 pointer-events-none"
              />

              {/* Main Banner Image: On mobile object-contain ensures 100% of the banner graphic (jar, text, graphics) is completely visible without any cropping; on desktop object-cover fills widescreen */}
              <motion.img
                initial={{ scale: 1.04 }}
                animate={{ scale: 1 }}
                transition={{ duration: 5, ease: "easeOut" }}
                src={resolveBannerImage(currentBanner.image)}
                alt={currentBanner.title}
                className="w-full h-full object-contain md:object-cover object-center"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = heroProductImage;
                }}
              />

              {/* 2. Responsive Gradient Scrim: On mobile, a gentle vertical gradient keeps the banner bright & vibrant; on desktop, horizontal contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#070b12]/95 via-[#070b12]/40 to-[#070b12]/20 md:bg-gradient-to-r md:from-[#070b12]/95 md:via-[#070b12]/55 md:to-black/20" />

              {/* 3. Top and Bottom Vignette to seamlessly blend with header and next section */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#070b12]/60 via-transparent to-[#070b12]" />

              {/* 4. Subtle Tint Matching Custom/Preset Gradient */}
              <div
                className={`absolute inset-0 opacity-25 mix-blend-color-dodge transition-all duration-700 pointer-events-none ${
                  !isCustomBg ? `bg-gradient-to-br ${bgClasses}` : ""
                }`}
                style={isCustomBg ? { background: currentBanner.bgGradient } : undefined}
              />

              {/* 5. Micro grid texture overlay */}
              <div
                className="absolute inset-0 opacity-[0.035] pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                  backgroundSize: "28px 28px",
                }}
              />
            </div>

            {/* Decorative ambient glowing orbs */}
            <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-emerald-500/15 blur-[120px] pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-indigo-500/15 blur-[140px] pointer-events-none" />

            {/* Foreground Content Container */}
            <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 md:px-10 py-2.5 sm:py-12 md:py-20 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-6 md:gap-8">
              {/* Left Column: Promotion Badge, Headline, Subtitle, Trust Highlights, CTAs */}
              <div className="w-full max-w-2xl text-center md:text-left">
                {/* Official Store Promotion Badge */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.35 }}
                  className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] sm:text-xs font-semibold tracking-wide uppercase mb-1.5 sm:mb-5 shadow-lg shadow-black/30"
                >
                  <FiZap className="text-amber-400 animate-pulse" size={13} />
                  <span className="text-white/95 font-medium tracking-wider">Official Nutriexa Store Promotion</span>
                </motion.div>

                {/* Main Headline */}
                <motion.h1
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.45 }}
                  className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[1.12] sm:leading-[1.08] tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]"
                >
                  {currentBanner.title}
                </motion.h1>

                {/* Subtitle */}
                {currentBanner.subtitle && (
                  <motion.p
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.22, duration: 0.45 }}
                    className="mt-1 sm:mt-4 text-gray-200 text-xs sm:text-base md:text-lg max-w-xl mx-auto md:mx-0 leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]"
                  >
                    {currentBanner.subtitle}
                  </motion.p>
                )}

                {/* Trust Highlights */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.45 }}
                  className="mt-2.5 sm:mt-7 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 max-w-lg mx-auto md:mx-0"
                >
                  {highlights.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-center md:justify-start gap-1.5 p-1.5 sm:p-2 rounded-lg bg-black/45 backdrop-blur-md border border-white/15 shadow-md shadow-black/30"
                    >
                      <FiCheckCircle className="text-emerald-400 shrink-0" size={14} />
                      <span className="text-[10px] sm:text-[11px] font-semibold text-gray-100 truncate">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.38, duration: 0.45 }}
                  className="mt-3.5 sm:mt-8 flex flex-row items-center justify-center md:justify-start gap-3 sm:gap-4"
                >
                  <Link
                    to={currentBanner.ctaLink || "/products"}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#4CAF37] to-[#3d912c] hover:from-[#57c93f] hover:to-[#46a532] text-white font-bold text-xs sm:text-base px-5 sm:px-8 py-3 sm:py-3.5 rounded-xl shadow-lg shadow-green-950/60 hover:shadow-green-900/80 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {currentBanner.cta || "Shop Now"}
                    <FiArrowRight size={16} />
                  </Link>

                  <Link
                    to="/deals"
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl bg-black/40 hover:bg-black/60 border border-white/20 text-white text-xs sm:text-sm font-semibold transition backdrop-blur-md shadow-lg shadow-black/30"
                  >
                    View All Offers
                  </Link>
                </motion.div>
              </div>

              {/* Right Side: Sleek Authenticity Seal floating in place */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25, duration: 0.45 }}
                className="hidden lg:flex flex-col items-end justify-center self-end mb-4 z-10 pointer-events-none"
              >
                <div className="bg-black/60 backdrop-blur-md border border-emerald-500/30 rounded-2xl p-4 flex items-center gap-3.5 shadow-2xl shadow-black/80">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-inner">
                    <FiShield size={24} />
                  </div>
                  <div>
                    <div className="text-[10px] font-extrabold tracking-widest uppercase text-emerald-400">
                      100% Genuine
                    </div>
                    <div className="text-xs font-bold text-white tracking-wide">
                      Verified Authentic Supplements
                    </div>
                    <div className="text-[10px] text-gray-300 mt-0.5">
                      Directly from Authorized Importers
                    </div>
                  </div>
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
              className="absolute left-1.5 sm:left-4 top-1/2 -translate-y-1/2 w-8 sm:w-11 h-8 sm:h-11 rounded-full bg-black/40 hover:bg-black/75 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-20 cursor-pointer shadow-xl shadow-black/40"
            >
              <FiChevronLeft size={18} className="sm:hidden" />
              <FiChevronLeft size={22} className="hidden sm:block" />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next Banner"
              className="absolute right-1.5 sm:right-4 top-1/2 -translate-y-1/2 w-8 sm:w-11 h-8 sm:h-11 rounded-full bg-black/40 hover:bg-black/75 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-20 cursor-pointer shadow-xl shadow-black/40"
            >
              <FiChevronRight size={18} className="sm:hidden" />
              <FiChevronRight size={22} className="hidden sm:block" />
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
                      ? "w-8 bg-[#4CAF37] shadow-md shadow-emerald-500/50"
                      : "w-2 bg-white/40 hover:bg-white/70"
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
