import { FiArrowRight, FiCheckCircle } from "react-icons/fi";
import heroProductImage from "../assets/homepage-img/hero-product.png";

const features = [
  "100% Authentic",
  "Top Quality",
  "Clinically Tested",
  "Results Driven",
];

export default function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-white to-brand-light">
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-14 grid md:grid-cols-2 gap-10 items-center">
        {/* Left copy */}
        <div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-ink leading-tight">
            FUEL YOUR
            <br />
            <span className="text-brand-green">POTENTIAL</span>
          </h2>
          <p className="text-gray-600 mt-4 max-w-md">
            Premium Supplements for Peak Performance &amp; Faster Results
          </p>

          <div className="flex flex-wrap gap-6 mt-6">
            {features.map((f) => (
              <div key={f} className="flex flex-col items-center text-xs text-gray-700 w-16">
                <FiCheckCircle className="text-brand-green mb-1" size={20} />
                <span className="text-center">{f}</span>
              </div>
            ))}
          </div>

          <button className="mt-8 inline-flex items-center gap-2 bg-brand-green hover:bg-brand-darkgreen text-white font-semibold px-6 py-3 rounded-md transition-colors">
            SHOP NOW <FiArrowRight />
          </button>
        </div>

        {/* Right product image */}
        <div className="relative flex items-center justify-center">
          <img
            src={heroProductImage}
            alt="Nutriexa Whey Protein, Creatine Monohydrate and BCAA product lineup"
            className="w-full max-w-md md:max-w-lg object-contain drop-shadow-2xl"
          />

          <span className="absolute top-2 right-2 md:right-6 border-2 border-brand-green text-brand-green text-[10px] font-bold rounded-full w-20 h-20 flex items-center justify-center text-center rotate-6 bg-white/80 backdrop-blur-sm">
            100% ORIGINAL
          </span>
        </div>
      </div>
    </section>
  );
}