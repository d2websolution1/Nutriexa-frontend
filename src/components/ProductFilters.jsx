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
  return (
    <div className="bg-white rounded-lg border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-5">
        <h4 className="text-sm font-extrabold text-[#1a1a1a] uppercase tracking-wide">
          Filters
        </h4>
        <div className="flex items-center gap-3">
          <button
            onClick={onClearAll}
            className="text-xs font-semibold text-[#4CAF37] hover:underline"
          >
            Clear All
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden text-gray-500 hover:text-[#1a1a1a]"
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
              className="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat.slug)}
                onChange={() => onToggleCategory(cat.slug)}
                className="w-4 h-4 rounded border-gray-300 text-[#4CAF37] focus:ring-[#4CAF37]"
              />
              {cat.label}
              <span className="text-xs text-gray-400 ml-auto">
                ({cat.count})
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price */}
      <div className="mb-6">
        <h5 className="text-xs font-bold text-[#1a1a1a] uppercase tracking-wide mb-3">
          Price Range
        </h5>
        <input
          type="range"
          min={0}
          max={10000}
          step={100}
          value={priceRange}
          onChange={(e) => onPriceChange(Number(e.target.value))}
          className="w-full accent-[#4CAF37]"
        />
        <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
          <span>₹0</span>
          <span className="font-semibold text-[#1a1a1a]">
            Up to ₹{priceRange.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Goals */}
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
                onClick={() => onToggleGoal(goal)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                  active
                    ? "bg-[#4CAF37] text-white border-[#4CAF37]"
                    : "border-gray-200 text-gray-600 hover:border-[#4CAF37] hover:text-[#4CAF37]"
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