import { FiTruck, FiPercent, FiShield } from "react-icons/fi";

export default function PromoBanner() {
  const items = [
    { icon: <FiTruck size={18} />, text: "Free Shipping above ₹999" },
    { icon: <FiPercent size={18} />, text: "Extra 5% OFF on Prepaid Orders" },
    { icon: <FiShield size={18} />, text: "100% Authentic Products" },
  ];

  return (
    <div className="bg-[#f3f6f2] border border-[#4CAF37]/20 rounded-lg mb-6">
      <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-[#4CAF37]/20">
        {items.map((item) => (
          <div
            key={item.text}
            className="flex items-center gap-2.5 px-4 py-3 flex-1 justify-center"
          >
            <span className="text-[#4CAF37]">{item.icon}</span>
            <span className="text-xs sm:text-sm font-medium text-[#1a1a1a]">
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}