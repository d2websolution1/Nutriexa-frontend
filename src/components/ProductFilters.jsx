import { FiX } from "react-icons/fi";

export default function ProductFilters({
  categories,
  selectedCategories,
  onToggleCategory,
  priceRange,
  onPriceChange,
  goals,
  selectedGoals,
  onToggleGoal,
  onClearAll,
  onClose,
}) {
  const minVal = typeof priceRange === "object" && priceRange !== null ? (priceRange.min ?? 0) : 0;
  const maxVal = typeof priceRange === "object" && priceRange !== null ? (priceRange.max ?? 10000) : (typeof priceRange === "number" ? priceRange : 10000);

  const SLIDER_MIN = 0;
  const SLIDER_MAX = 10000;
  const STEP = 100;

  const minPercent = Math.min(100, Math.max(0, ((minVal - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100));
  const maxPercent = Math.min(100, Math.max(0, ((maxVal - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100));

  const handleMinChange = (e) => {
    const value = Math.min(Number(e.target.value), maxVal - STEP);
    onPriceChange({ min: Math.max(SLIDER_MIN, value), max: maxVal });
  };

  const handleMaxChange = (e) => {
    const value = Math.max(Number(e.target.value), minVal + STEP);
    onPriceChange({ min: minVal, max: Math.min(SLIDER_MAX, value) });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-5">
        <h4 className="text-sm font-extrabold text-[#1a1a1a] uppercase tracking-wide">
          Filters
        </h4>
        <div className="flex items-center gap-3">
          <button
            onClick={onClearAll}
            className="text-xs font-semibold text-[#4CAF37] hover:underline cursor-pointer"
          >
            Clear All
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden text-gray-500 hover:text-[#1a1a1a] cursor-pointer"
              aria-label="Close filters"
            >
              <FiX size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Category */}
      <div className="mb-6">
        <h5 className="text-xs font-bold text-[#1a1a1a] uppercase tracking-wide mb-3">
          Category
        </h5>
        <div className="space-y-2.5">
          {categories.map((cat) => (
            <label
              key={cat.slug}
              className="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer select-none"
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat.slug)}
                onChange={() => onToggleCategory(cat.slug)}
                className="w-4 h-4 rounded border-gray-300 text-[#4CAF37] focus:ring-[#4CAF37] cursor-pointer"
              />
              <span>{cat.label}</span>
              <span className="text-xs text-gray-400 ml-auto">
                ({cat.count})
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range — Dual Slider (Between min and max) */}
      <div className="mb-6">
        <h5 className="text-xs font-bold text-[#1a1a1a] uppercase tracking-wide mb-3">
          Price Range
        </h5>

        {/* Dual Slider Container */}
        <div className="relative pt-2 pb-1">
          {/* Base Track */}
          <div className="relative w-full h-1.5 bg-gray-200 rounded-full">
            {/* Active Range Highlight */}
            <div
              className="absolute top-0 bottom-0 bg-[#4CAF37] rounded-full"
              style={{
                left: `${minPercent}%`,
                width: `${Math.max(0, maxPercent - minPercent)}%`,
              }}
            />
          </div>

          {/* Min Input Slider */}
          <input
            type="range"
            min={SLIDER_MIN}
            max={SLIDER_MAX}
            step={STEP}
            value={minVal}
            onChange={handleMinChange}
            aria-label="Minimum price"
            className="dual-range-slider absolute inset-x-0 -top-1 w-full h-6 z-20"
          />

          {/* Max Input Slider */}
          <input
            type="range"
            min={SLIDER_MIN}
            max={SLIDER_MAX}
            step={STEP}
            value={maxVal}
            onChange={handleMaxChange}
            aria-label="Maximum price"
            className="dual-range-slider absolute inset-x-0 -top-1 w-full h-6 z-30"
          />
        </div>

        {/* Price Numbers matching reference image: ₹0 to ₹6,100 */}
        <div className="flex items-center justify-between text-xs font-semibold text-[#1a1a1a] mt-2 px-0.5">
          <span>₹{minVal.toLocaleString("en-IN")}</span>
          <span className="text-gray-400 font-normal text-[11px]">to</span>
          <span>₹{maxVal.toLocaleString("en-IN")}</span>
        </div>
      </div>

      {/* Fitness Goals */}
      <div>
        <h5 className="text-xs font-bold text-[#1a1a1a] uppercase tracking-wide mb-3">
          Fitness Goal
        </h5>
        <div className="flex flex-wrap gap-2">
          {goals.map((goal) => {
            const active = selectedGoals.includes(goal);
            return (
              <button
                key={goal}
                type="button"
                onClick={() => onToggleGoal(goal)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                  active
                    ? "bg-[#4CAF37] text-white border-[#4CAF37] shadow-sm"
                    : "border-gray-200 text-gray-600 hover:border-[#4CAF37] hover:text-[#4CAF37] bg-white"
                }`}
              >
                {goal}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}