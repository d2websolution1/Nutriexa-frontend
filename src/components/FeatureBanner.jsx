import { GiWeightLiftingUp } from "react-icons/gi";
import { FiFeather, FiTarget } from "react-icons/fi";
import { LuUsers } from "react-icons/lu";

export default function FeatureBanner() {
  const items = [
    {
      icon: GiWeightLiftingUp,
      title: "Expert Formulated",
      subtitle: "By Nutrition Experts",
    },
    {
      icon: FiFeather,
      title: "Premium Ingredients",
      subtitle: "Sourced Globally",
    },
    {
      icon: FiTarget,
      title: "For Every Goal",
      subtitle: "Bulk | Cut | Strength | Wellness",
    },
    {
      icon: LuUsers,
      title: "Trusted by Athletes",
      subtitle: "Real People, Real Results",
    },
  ];

  return (
    <section className="bg-gradient-to-r from-[#4CAF37] to-[#1f5c8f] py-8">
      <div className="max-w-7xl mx-auto px-4 md:px-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {items.map(({ icon: Icon, title, subtitle }) => (
          <div key={title} className="flex items-center gap-3 text-white">
            <Icon size={26} className="shrink-0" strokeWidth={1.6} />
            <div>
              <p className="text-sm font-bold leading-tight">{title}</p>
              <p className="text-xs text-white/80 mt-0.5">{subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}