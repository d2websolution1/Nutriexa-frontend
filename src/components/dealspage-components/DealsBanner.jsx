import { FiZap } from "react-icons/fi";

export default function DealsBanner() {
  return (
    <section className="bg-gradient-to-r from-[#4CAF37] to-[#1f5c8f] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-10 md:py-14 text-center text-white relative z-10">
        <div className="inline-flex items-center gap-2 bg-white/15 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
          <FiZap size={14} /> LIMITED TIME OFFERS
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold">
          Deals of the Week
        </h1>
        <p className="text-white/85 text-sm md:text-base mt-3 max-w-lg mx-auto">
          Grab your favourite supplements at unbeatable prices — before the
          clock runs out.
        </p>
      </div>

      {/* Decorative circles */}
      <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-14 -right-8 w-52 h-52 rounded-full bg-white/10 blur-2xl" />
    </section>
  );
}