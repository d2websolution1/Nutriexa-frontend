import { Link } from "react-router-dom";
import { FiCheckCircle, FiArrowRight } from "react-icons/fi";
import heroProductImage from "../assets/homepage-img/hero-product.png";

export default function Hero() {
  const highlights = [
    { label: "100% Authentic" },
    { label: "Top Quality" },
    { label: "Clinically Tested" },
    { label: "Results Driven" },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#f3f6f2] via-white to-[#eef4ea]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-10 sm:py-14 md:py-20 grid md:grid-cols-2 gap-8 md:gap-10 items-center">
        {/* Left copy */}
        <div className="relative z-10 text-center md:text-left">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-[1.1] text-[#1a1a1a]">
            FUEL YOUR
            <br />
            <span className="text-[#4CAF37]">POTENTIAL</span>
          </h2>
          <p className="mt-4 sm:mt-5 text-gray-600 text-sm sm:text-base md:text-lg max-w-md mx-auto md:mx-0">
            Premium Supplements for Peak Performance &amp; Faster Results
          </p>

          <div className="mt-6 sm:mt-7 grid grid-cols-2 gap-3 sm:gap-4 max-w-xs sm:max-w-md mx-auto md:mx-0">
            {highlights.map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center md:items-start gap-1.5 sm:gap-2 text-center md:text-left"
              >
                <FiCheckCircle className="text-[#4CAF37]" size={20} />
                <span className="text-[11px] sm:text-xs font-semibold text-[#1a1a1a] leading-tight">
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          <Link
            to="/products"
            className="mt-7 sm:mt-8 inline-flex items-center justify-center gap-2 bg-[#4CAF37] text-white font-semibold px-6 sm:px-7 py-3 sm:py-3.5 rounded-md hover:opacity-90 transition-opacity w-full sm:w-auto"
          >
            SHOP NOW <FiArrowRight />
          </Link>
        </div>

        {/* Right product image */}
        <div className="relative flex justify-center items-center mt-2 md:mt-0">
          {/* Decorative leaf/swoosh background */}
          <div className="absolute inset-0 -z-10 opacity-40">
            <div className="w-52 h-52 sm:w-72 sm:h-72 md:w-96 md:h-96 rounded-full bg-[#4CAF37]/10 blur-3xl mx-auto" />
          </div>

          <img
            src={heroProductImage}
            alt="Nutriexa Whey Protein, Creatine Monohydrate and BCAA product lineup"
            className="relative z-10 w-full max-w-[220px] sm:max-w-md md:max-w-lg object-contain drop-shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
}