import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";

const API_URL = "https://nutriexa-backend.onrender.com/api/products";
const BASE_URL = "https://nutriexa-backend.onrender.com";

const CATEGORY_LABELS = {
  "whey-proteins": "Whey Proteins",
  "mass-gainers": "Mass Gainers",
  "pre-workouts": "Pre-Workouts",
  "amino-acids": "Amino Acids",
  "health-wellness": "Health & Wellness",
  accessories: "Accessories",
};

function buildImageUrl(path, label) {
  if (!path) {
    return `https://placehold.co/300x300/f0f4ee/4CAF37?text=${encodeURIComponent(label)}`;
  }
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path}`;
}

export default function ShopByCategory() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();

        const active = data.filter((p) => p.status === "Active");

        const built = Object.entries(CATEGORY_LABELS).map(([slug, label]) => {
          const productInCategory = active.find((p) => p.category === slug);
          return {
            slug,
            label,
            image: buildImageUrl(productInCategory?.image, label),
          };
        });

        setCategories(built);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-10 py-12 md:py-16">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl md:text-2xl font-extrabold text-[#1a1a1a] uppercase tracking-tight">
          Shop By Category
        </h3>
        <Link
          to="/products"
          className="flex items-center gap-1 text-sm font-semibold text-[#4CAF37] hover:underline"
        >
          View All <FiArrowRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            to={`/products?category=${cat.slug}`}
            className="group flex flex-col items-center text-center"
          >
            <div className="w-full aspect-square rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden group-hover:border-[#4CAF37] transition-colors">
              <img
                src={cat.image}
                alt={cat.label}
                className="w-4/5 h-4/5 object-contain group-hover:scale-105 transition-transform"
              />
            </div>
            <span className="mt-3 text-sm font-semibold text-[#1a1a1a] group-hover:text-[#4CAF37]">
              {cat.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}