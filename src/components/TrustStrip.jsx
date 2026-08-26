import { TbTruckDelivery, TbRefresh, TbLock, TbHeadset } from "react-icons/tb";

export default function TrustStrip() {
  const items = [
    {
      icon: TbTruckDelivery,
      title: "Fast & Free Shipping",
      subtitle: "On orders above ₹1999",
    },
    {
      icon: TbRefresh,
      title: "Easy Returns",
      subtitle: "7 Days Return Policy",
    },
    {
      icon: TbLock,
      title: "Secure Payments",
      subtitle: "100% Secure Checkout",
    },
    {
      icon: TbHeadset,
      title: "Customer Support",
      subtitle: "We're here to help",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-10 -mt-8 md:-mt-10 relative z-10">
      <div className="bg-white rounded-xl shadow-md border border-gray-100 grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-100">
        {items.map(({ icon: Icon, title, subtitle }) => (
          <div
            key={title}
            className="flex items-center gap-3 px-5 py-5 md:py-6"
          >
            <Icon size={30} className="text-[#4CAF37] shrink-0" strokeWidth={1.6} />
            <div>
              <p className="text-sm font-bold text-[#1a1a1a] leading-tight">
                {title}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}