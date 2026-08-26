const categories = [
  "Whey Proteins",
  "Mass Gainers",
  "Pre-Workouts",
  "Amino Acids",
  "Health & Wellness",
  "Accessories",
];

export default function CategoryGrid() {
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-10 py-12">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg md:text-xl font-bold text-ink tracking-wide">
          SHOP BY CATEGORY
        </h3>
        <a href="#" className="text-sm font-medium text-brand-green flex items-center gap-1">
          View All →
        </a>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        {categories.map((cat) => (
          <div
            key={cat}
            className="bg-graybg rounded-lg p-4 flex flex-col items-center gap-3 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="w-full aspect-square bg-ink/90 rounded-md" />
            <p className="text-xs md:text-sm font-medium text-center text-ink">{cat}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
