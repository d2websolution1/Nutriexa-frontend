import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from "react-icons/fi";
import { API_URL as BASE_URL } from "../../config";
import { useAuth } from "../../context/AuthContext";

const STATUS_STYLES = {
  Active: "bg-green-100 text-green-700",
  "Out of Stock": "bg-red-100 text-red-700",
  Draft: "bg-gray-100 text-gray-600",
};

const PRODUCTS_API = `${BASE_URL}/api/products`;

function buildImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path}`;
}

export default function Products() {
  const { hasPermission } = useAuth();
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const canCreate = hasPermission("products.create");
  const canEdit = hasPermission("products.edit");
  const canDelete = hasPermission("products.delete");

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(PRODUCTS_API);
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("Failed to load products. Please check if the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    setDeletingId(id);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${PRODUCTS_API}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Delete failed");
      }

      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.message || "Failed to delete product. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1a1a1a]">Products</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your store's product catalog.
          </p>
        </div>
        {canCreate && (
          <Link
            to="/admin/products/new"
            className="flex items-center gap-2 bg-[#4CAF37] text-white text-sm font-semibold px-5 py-2.5 rounded-md hover:opacity-90"
          >
            <FiPlus size={18} /> Add Product
          </Link>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2 bg-[#f5f6f4] rounded-md px-3 py-2 max-w-sm">
            <FiSearch className="text-gray-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="bg-transparent text-sm outline-none w-full placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100 bg-[#fafbf9]">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-500 text-sm">
                    Loading products...
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-red-500 text-sm">
                    {error}
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                filtered.map((product) => (
                  <tr key={product.id} className="border-b border-gray-50 last:border-0 hover:bg-[#fafbf9]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-[#f3f6f2] overflow-hidden shrink-0">
                          {buildImageUrl(product.image) ? (
                            <img
                              src={buildImageUrl(product.image)}
                              alt={product.name}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[9px] text-gray-400">
                              No Image
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-[#1a1a1a]">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.variant}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{product.category}</td>
                    <td className="px-4 py-3 text-gray-600">₹{product.price}</td>
                    <td className="px-4 py-3 text-gray-600">{product.stock}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[product.status]}`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {canEdit && (
                          <Link
                            to={`/admin/products/edit/${product.id}`}
                            className="p-2 rounded-md text-gray-500 hover:text-[#4CAF37] hover:bg-[#4CAF37]/10"
                          >
                            <FiEdit2 size={16} />
                          </Link>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(product.id)}
                            disabled={deletingId === product.id}
                            className="p-2 rounded-md text-gray-500 hover:text-red-500 hover:bg-red-50 disabled:opacity-50"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        )}
                        {!canEdit && !canDelete && (
                          <span className="text-xs text-gray-400 italic">Read-only</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

              {!loading && !error && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-500 text-sm">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}