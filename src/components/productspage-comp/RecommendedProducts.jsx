import ProductCard from "./ProductCard";

export default function RecommendedProducts({ products = [] }) {
  if (!products.length) return null;

  return (
    <section className="mt-14 border-t border-gray-100 pt-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl md:text-2xl font-extrabold text-[#1a1a1a]">
          You Might Also Like
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </section>
  );
}