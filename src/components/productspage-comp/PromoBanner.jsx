import { FiTruck, FiPercent, FiShield } from "react-icons/fi";

const getDiscountPercent = (product) => {
  if (!product?.mrp || product.mrp <= product.price) return 0;
  return Math.round(((product.mrp - product.price) / product.mrp) * 100);
};

export default function PromoBanner({
  products = [],
  selectedDiscount = null,
  onSelectDiscount,
}) {
  const promoOffers = products
    .map((product) => ({
      product,
      percent: getDiscountPercent(product),
    }))
    .filter((item) => item.percent > 0)
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 3);

  const items =
    promoOffers.length > 0
      ? promoOffers.map(({ product, percent }) => ({
          key: `discount-${product.id}`,
          text: `${percent}% OFF on ${product.name}`,
          value:
            percent <= 30
              ? "up-to-30"
              : percent <= 40
              ? "30-to-40"
              : percent <= 70
              ? "40-to-70"
              : "70-plus",
          icon: <FiPercent size={18} />,
        }))
      : [
          {
            key: "shipping",
            text: "Free Shipping above ₹999",
            value: null,
            icon: <FiTruck size={18} />,
          },
          {
            key: "extra-off",
            text: "Extra 5% OFF on Prepaid Orders",
            value: null,
            icon: <FiPercent size={18} />,
          },
          {
            key: "authentic",
            text: "100% Authentic Products",
            value: null,
            icon: <FiShield size={18} />,
          },
        ];

  return (
    <div className="bg-[#f3f6f2] border border-[#4CAF37]/20 rounded-lg mb-6">
      <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-[#4CAF37]/20">
        {items.map((item) => {
          const isActive = selectedDiscount === item.value;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() =>
                item.value &&
                onSelectDiscount?.(isActive ? null : item.value)
              }
              className={`flex-1 flex items-center gap-2.5 px-4 py-3 justify-center transition-colors ${
                item.value
                  ? "hover:bg-[#4CAF37]/5 cursor-pointer"
                  : "cursor-default"
              } ${isActive ? "bg-[#4CAF37]/10" : ""}`}
            >
              <span className="text-[#4CAF37]">{item.icon}</span>
              <span className="text-xs sm:text-sm font-medium text-[#1a1a1a]">
                {item.text}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}