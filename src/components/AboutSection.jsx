import { Link } from "react-router-dom";
import { GoPeople } from "react-icons/go";
import { LuPackage } from "react-icons/lu";
import { FiStar } from "react-icons/fi";
import { MdOutlineVerified } from "react-icons/md";
import aboutImage from "../assets/homepage-img/about-athlete.png";

export default function AboutSection() {
  const stats = [
    { icon: GoPeople, value: "50,000+", label: "Happy Customers" },
    { icon: LuPackage, value: "200+", label: "Premium Products" },
    { icon: FiStar, value: "4.8/5", label: "Customer Rating" },
    { icon: MdOutlineVerified, value: "100%", label: "Authentic Products" },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-10 py-14 md:py-20 grid md:grid-cols-2 gap-10 items-center">
      <div className="rounded-xl overflow-hidden">
        <img
          src={aboutImage}
          alt="Athlete training with Nutriexa supplements"
          className="w-full h-full object-cover"
        />
      </div>

      <div>
        <p className="text-sm font-bold text-[#4CAF37] uppercase tracking-wide">
          About Us
        </p>
        <h3 className="text-2xl md:text-3xl font-extrabold text-[#1a1a1a] mt-2">
          About Nutriexa
        </h3>
        <p className="text-gray-600 mt-4 leading-relaxed max-w-lg">
          Nutriexa is more than just a supplement brand — it's a commitment to
          your fitness journey. We create premium quality, science-backed
          nutrition to help you achieve your goals faster and safer.
        </p>

        <Link
          to="/about"
          className="mt-6 inline-block bg-[#4CAF37] text-white text-sm font-semibold px-6 py-3 rounded-md hover:opacity-90"
        >
          KNOW MORE ABOUT US
        </Link>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-10">
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex flex-col gap-1.5">
              <Icon size={22} className="text-[#4CAF37]" />
              <span className="text-lg font-extrabold text-[#1a1a1a]">
                {value}
              </span>
              <span className="text-xs text-gray-500">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}