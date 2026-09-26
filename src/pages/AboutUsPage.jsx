import { Link } from "react-router-dom";
import { GoPeople } from "react-icons/go";
import { LuPackage, LuFlaskConical } from "react-icons/lu";
import { FiStar, FiArrowRight, FiCheckCircle } from "react-icons/fi";
import {
  MdOutlineVerified,
  MdOutlineScience,
  MdOutlineLocalShipping,
} from "react-icons/md";
import { TbShieldCheck } from "react-icons/tb";
import heroProductImage from "../assets/homepage-img/hero-product.png";

export default function AboutUsPage() {
  const stats = [
    { icon: GoPeople, value: "50,000+", label: "Happy Customers" },
    { icon: LuPackage, value: "200+", label: "Premium Products" },
    { icon: FiStar, value: "4.8/5", label: "Customer Rating" },
    { icon: MdOutlineVerified, value: "100%", label: "Authentic Products" },
  ];

  const values = [
    {
      icon: LuFlaskConical,
      title: "Science-Backed Formulas",
      description:
        "Every product is developed with nutrition experts and backed by research, not guesswork.",
    },
    {
      icon: TbShieldCheck,
      title: "100% Authentic & Tested",
      description:
        "Every batch is lab-tested for purity and potency, with a built-in authenticator to verify your product.",
    },
    {
      icon: MdOutlineScience,
      title: "Premium Ingredients",
      description:
        "We source high-quality raw materials globally, so you get real results without compromise.",
    },
    {
      icon: MdOutlineLocalShipping,
      title: "Fast, Reliable Delivery",
      description:
        "From our warehouse to your doorstep, quickly and safely, with easy returns if something's not right.",
    },
  ];

  return (
    <main className="bg-white dark:bg-[#0b0e14] text-gray-900 dark:text-white transition-colors">
      {/* Intro */}
      <section className="max-w-5xl mx-auto px-4 md:px-10 py-16">
        <p className="text-sm font-bold text-[#4CAF37] dark:text-[#57c93f] uppercase tracking-wide text-center">
          About Us
        </p>
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#1a1a1a] dark:text-white mt-2 text-center">
          About Nutriexa
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-5 leading-relaxed max-w-2xl mx-auto text-center">
          Nutriexa is more than just a supplement brand — it's a commitment to
          your fitness journey. We create premium quality, science-backed
          nutrition to help you achieve your goals faster and safer. Every
          product is clinically tested, sourced from trusted ingredients, and
          crafted for real results.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-12 max-w-2xl mx-auto">
          {stats.map(({ icon: Icon, value, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1.5 text-center p-3 rounded-xl bg-gray-50/50 dark:bg-[#111722] border border-transparent dark:border-[#1f2a3c]"
            >
              <Icon size={24} className="text-[#4CAF37] dark:text-[#57c93f]" />
              <span className="text-lg font-extrabold text-[#1a1a1a] dark:text-white">
                {value}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Our Story */}
      <section className="bg-[#f7f8f6] dark:bg-[#0d121c] py-16 transition-colors">
        <div className="max-w-6xl mx-auto px-4 md:px-10 grid md:grid-cols-2 gap-10 items-center">
          <div className="rounded-2xl overflow-hidden order-2 md:order-1 bg-gradient-to-br from-[#f3f6f2] via-white to-[#eef4ea] dark:from-[#111722] dark:via-[#0f172a] dark:to-[#0b0e14] p-6 sm:p-8 flex items-center justify-center border border-gray-100 dark:border-[#1f2a3c] shadow-lg relative">
            {/* Ambient decorative glow */}
            <div className="absolute inset-0 bg-emerald-500/10 dark:bg-emerald-500/15 blur-2xl rounded-full pointer-events-none" />
            <img
              src={heroProductImage}
              alt="Nutriexa manufacturing and quality process"
              className="relative z-10 w-full max-h-[380px] object-contain drop-shadow-2xl hover:scale-102 transition-transform duration-300"
            />
          </div>

          <div className="order-1 md:order-2">
            <p className="text-sm font-bold text-[#4CAF37] dark:text-[#57c93f] uppercase tracking-wide">
              Our Story
            </p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#1a1a1a] dark:text-white mt-2">
              Built By Athletes, For Athletes
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-4 leading-relaxed">
              Nutriexa started with a simple frustration: too many supplement
              brands cut corners on quality while charging premium prices. We
              set out to change that, partnering with nutrition scientists
              and manufacturing partners who share our obsession with purity,
              potency, and real-world results.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mt-4 leading-relaxed">
              Today, every Nutriexa product goes through rigorous testing
              before it reaches you, backed by a promise: what's on the
              label is exactly what's in the bottle.
            </p>

            <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold text-gray-700 dark:text-gray-300">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#111722] border border-gray-200 dark:border-[#1f2a3c]">
                <FiCheckCircle className="text-[#4CAF37] dark:text-[#57c93f]" /> 100% Authentic
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#111722] border border-gray-200 dark:border-[#1f2a3c]">
                <FiCheckCircle className="text-[#4CAF37] dark:text-[#57c93f]" /> Lab Tested
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#111722] border border-gray-200 dark:border-[#1f2a3c]">
                <FiCheckCircle className="text-[#4CAF37] dark:text-[#57c93f]" /> Premium Quality
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="max-w-6xl mx-auto px-4 md:px-10 py-16">
        <div className="text-center mb-10">
          <p className="text-sm font-bold text-[#4CAF37] dark:text-[#57c93f] uppercase tracking-wide">
            Why Choose Nutriexa
          </p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#1a1a1a] dark:text-white mt-2">
            What Sets Us Apart
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {values.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex gap-4 p-5 rounded-xl border border-gray-100 dark:border-[#1f2a3c] bg-white dark:bg-[#111722] hover:border-[#4CAF37] dark:hover:border-[#4CAF37] transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-[#4CAF37]/10 dark:bg-[#4CAF37]/20 flex items-center justify-center shrink-0">
                <Icon size={22} className="text-[#4CAF37] dark:text-[#57c93f]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1a1a1a] dark:text-white">{title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1.5 leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-[#4CAF37] to-[#1f5c8f]">
        <div className="max-w-4xl mx-auto px-4 md:px-10 py-14 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-extrabold">
            Ready to Fuel Your Potential?
          </h2>
          <p className="text-white/85 mt-3 max-w-md mx-auto">
            Explore our range of clinically tested, premium supplements built
            for real results.
          </p>
          <Link
            to="/products"
            onClick={() => window.scrollTo({ top: 0, left: 0, behavior: "instant" })}
            className="mt-6 inline-flex items-center gap-2 bg-white text-[#1a1a1a] font-semibold px-7 py-3 rounded-md hover:opacity-90 cursor-pointer shadow-lg hover:shadow-xl transition-all"
          >
            Shop All Products <FiArrowRight />
          </Link>
        </div>
      </section>
    </main>
  );
}