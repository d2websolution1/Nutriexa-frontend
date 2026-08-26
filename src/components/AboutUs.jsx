const stats = [
  { label: "Happy Customers", value: "50,000+" },
  { label: "Premium Products", value: "200+" },
  { label: "Customer Rating", value: "4.8/5" },
  { label: "Authentic Products", value: "100%" },
];

export default function AboutUs() {
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-10 py-12 grid md:grid-cols-2 gap-10 items-center">
      <div className="w-full aspect-[4/3] bg-ink rounded-xl" />

      <div>
        <p className="text-brand-green text-sm font-semibold mb-2">ABOUT US</p>
        <h3 className="text-2xl md:text-3xl font-extrabold text-ink mb-4">
          ABOUT NUTRIEXA
        </h3>
        <p className="text-gray-600 mb-6 max-w-md">
          Nutriexa is more than just a supplement brand — it's a commitment to
          your fitness journey. We create premium quality, science-backed
          nutrition to help you achieve your goals faster and safer.
        </p>
        <button className="bg-brand-green hover:bg-brand-darkgreen text-white text-sm font-semibold px-5 py-3 rounded-md transition-colors">
          KNOW MORE ABOUT US
        </button>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-xl font-extrabold text-ink">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
