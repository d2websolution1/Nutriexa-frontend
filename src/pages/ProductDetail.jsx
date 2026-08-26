import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FiCheckCircle, FiChevronRight, FiShoppingCart, FiCheck, FiStar } from "react-icons/fi";
import { useCart } from "../context/CartContext";

const API_URL = "http://localhost:5000/api/products";

export default function ProductDetail() {
  const { slug } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError("");

    fetch(`${API_URL}/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Product not found");
        return res.json();
      })
      .then((data) => setProduct(data))
      .catch(() => setError("Product not found."))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;

    addToCart(
      {
        id: product.id,
        name: product.name,
        variant: product.variant,
        price: Number(product.price),
        mrp: product.mrp ? Number(product.mrp) : null,
        image: product.image
          ? `http://localhost:5000${product.image}`
          : "/images/placeholder.png",
      },
      qty
    );

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-20 text-center text-gray-500 text-sm">
        Loading product...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-20 text-center">
        <p className="text-gray-500 mb-4">Product not found.</p>
        <Link to="/products" className="text-[#4CAF37] font-semibold hover:underline">
          ← Back to Products
        </Link>
      </div>
    );
  }

  const price = Number(product.price);
  const mrp = product.mrp ? Number(product.mrp) : null;
  const discountPercent = mrp && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : null;
  const image = product.image
    ? `http://localhost:5000${product.image}`
    : "/images/placeholder.png";
  const inStock = product.stock > 0 && product.status === "Active";

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-10 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-6">
        <Link to="/" className="hover:text-[#4CAF37]">Home</Link>
        <FiChevronRight size={12} />
        <Link to="/products" className="hover:text-[#4CAF37]">Products</Link>
        <FiChevronRight size={12} />
        <span className="text-[#1a1a1a] font-medium truncate">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Image */}
        <div className="w-full aspect-square bg-[#f3f6f2] rounded-xl flex items-center justify-center overflow-hidden relative">
          {discountPercent && (
            <span className="absolute top-4 left-4 bg-[#4CAF37] text-white text-xs font-bold px-2.5 py-1 rounded">
              {discountPercent}% OFF
            </span>
          )}
          <img
            src={image}
            alt={product.name}
            className="w-4/5 h-4/5 object-contain"
          />
        </div>

        {/* Details */}
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1a1a1a] mb-2">
            {product.name}
          </h1>
          {product.variant && (
            <p className="text-gray-500 mb-3">{product.variant}</p>
          )}

          <div className="flex items-center gap-1 mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <FiStar key={i} size={14} className="fill-[#4CAF37] text-[#4CAF37]" />
            ))}
            <span className="text-xs text-gray-400 ml-1">(4.5)</span>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl font-extrabold text-[#1a1a1a]">
              ₹{price.toLocaleString("en-IN")}
            </span>
            {mrp && mrp > price && (
              <span className="text-gray-400 line-through">
                ₹{mrp.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          <p className="text-sm mb-6">
            {inStock ? (
              <span className="text-green-600 font-semibold">In Stock</span>
            ) : (
              <span className="text-red-500 font-semibold">Out of Stock</span>
            )}
          </p>

          <p className="text-gray-600 mb-6 max-w-md leading-relaxed">
            {product.description ||
              "Premium quality, lab-tested formula built for real results."}
          </p>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border border-gray-200 rounded-md">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-3.5 py-2.5 text-gray-600 hover:text-[#4CAF37]"
              >
                −
              </button>
              <span className="px-4 text-sm font-medium">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="px-3.5 py-2.5 text-gray-600 hover:text-[#4CAF37]"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!inStock || added}
              className={`flex-1 flex items-center justify-center gap-2 font-semibold py-3 rounded-md transition-colors ${
                !inStock
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : added
                  ? "bg-green-600 text-white"
                  : "bg-[#4CAF37] text-white hover:opacity-90"
              }`}
            >
              {added ? (
                <>
                  <FiCheck size={16} /> Added to Cart
                </>
              ) : (
                <>
                  <FiShoppingCart size={16} />
                  {inStock ? "Add to Cart" : "Out of Stock"}
                </>
              )}
            </button>
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <FiCheckCircle className="text-[#4CAF37]" /> 100% Authentic
            </span>
            <span className="flex items-center gap-1">
              <FiCheckCircle className="text-[#4CAF37]" /> Lab Tested
            </span>
            <span className="flex items-center gap-1">
              <FiCheckCircle className="text-[#4CAF37]" /> Free Shipping above ₹1999
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}