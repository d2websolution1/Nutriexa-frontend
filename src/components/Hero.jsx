import { Link } from "react-router-dom";
import { FiCheckCircle, FiArrowRight } from "react-icons/fi";
import heroProductImage from "../assets/homepage-img/hero-product.png";
import { motion } from "framer-motion";
import MotionButton from "./animation/MotionButton";
import AnimateOnView from "./animation/AnimateOnView";

export default function Hero() {
  const highlights = [
    { label: "100% Authentic" },
    { label: "Top Quality" },
    { label: "Clinically Tested" },
    { label: "Results Driven" },
  ];

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } },
  };

  const child = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#f3f6f2] via-white to-[#eef4ea] dark:from-[#0b0e14] dark:via-[#111722] dark:to-[#0d131f] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-10 sm:py-14 md:py-20 grid md:grid-cols-2 gap-8 md:gap-10 items-center">
        {/* Left copy */}
        <motion.div
          className="relative z-10 text-center md:text-left"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.h2 variants={child} className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-[1.1] text-[#1a1a1a] dark:text-white">
            FUEL YOUR
            <br />
            <span className="text-[#4CAF37]">POTENTIAL</span>
          </motion.h2>

          <motion.p variants={child} className="mt-4 sm:mt-5 text-gray-600 dark:text-gray-300 text-sm sm:text-base md:text-lg max-w-md mx-auto md:mx-0">
            Premium Supplements for Peak Performance &amp; Faster Results
          </motion.p>

          <motion.div variants={child} className="mt-6 sm:mt-7 grid grid-cols-2 gap-3 sm:gap-4 max-w-xs sm:max-w-md mx-auto md:mx-0">
            {highlights.map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center md:items-start gap-1.5 sm:gap-2 text-center md:text-left p-2 rounded-lg dark:bg-[#141c2b]/80 border border-transparent dark:border-[#1f2a3c]"
              >
                <FiCheckCircle className="text-[#4CAF37]" size={20} />
                <span className="text-[11px] sm:text-xs font-semibold text-[#1a1a1a] dark:text-white leading-tight">
                  {item.label}
                </span>
              </div>
            ))}
          </motion.div>

          <motion.div variants={child} className="mt-7 sm:mt-8">
            <MotionButton
              className="inline-flex items-center justify-center gap-2 bg-[#4CAF37] text-white font-semibold px-6 sm:px-7 py-3 sm:py-3.5 rounded-md hover:opacity-90 transition-opacity w-full sm:w-auto"
              as={Link}
              to="/products"
            >
              SHOP NOW <FiArrowRight />
            </MotionButton>
          </motion.div>
        </motion.div>

        {/* Right product image + Lottie */}
        <div className="relative flex justify-center items-center mt-2 md:mt-0">
          {/* Decorative leaf/swoosh background */}
          <div className="absolute inset-0 -z-10 opacity-40">
            <div className="w-52 h-52 sm:w-72 sm:h-72 md:w-96 md:h-96 rounded-full bg-[#4CAF37]/10 blur-3xl mx-auto" />
          </div>

          <div className="relative z-10 w-full max-w-[320px] md:max-w-[420px] flex items-center justify-center">
              {/* Decorative Lottie placeholder removed to avoid runtime mismatch with installed Lottie package */}

            <motion.img
              src={heroProductImage}
              alt="Nutriexa Whey Protein, Creatine Monohydrate and BCAA product lineup"
              className="relative z-20 w-full max-w-[220px] sm:max-w-md md:max-w-lg object-contain drop-shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              viewport={{ once: true, amount: 0.3 }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}