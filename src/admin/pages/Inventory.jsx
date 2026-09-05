import { useEffect, useState } from "react";
import { FiArchive, FiSearch, FiAlertTriangle, FiCheckCircle, FiEdit3, FiRefreshCw } from "react-icons/fi";
import { API_URL as BASE_URL } from "../../config";

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [editStockMap, setEditStockMap] = useState({});

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/products`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
        const map = {};
        data.forEach((p) => {
          map[p.id] = p.stock;
        });
        setEditStockMap(map);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleUpdateStock = async (id) => {
    const newStock = editStockMap[id];
    setUpdatingId(id);
    try {
      const token = localStorage.getItem("adminToken");
      const prod = products.find((p) => p.id === id);
      const res = await fetch(`${BASE_URL}/api/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: prod.name,
          category: prod.category,
          price: prod.price,
          stock: parseInt(newStock, 10) || 0,
          status: parseInt(newStock, 10) <= 0 ? "Out of Stock" : "Active",
        }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === id
              ? {
                  ...p,
                  stock: parseInt(newStock, 10) || 0,
                  status: parseInt(newStock, 10) <= 0 ? "Out of Stock" : "Active",
                }
              : p
          )
        );
        alert("Stock updated successfully.");
      }
    } catch (err) {
      alert("Failed to update stock: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockCount = products.filter((p) => Number(p.stock) <= 5 && Number(p.stock) > 0).length;
  const outOfStockCount = products.filter((p) => Number(p.stock) <= 0).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1a1a1a]">Inventory &amp; Stock</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Monitor real-time warehouse inventory, stock thresholds, and quick stock overrides.
          </p>
        </div>
        <button
          onClick={fetchInventory}
          className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-700 hover:text-[#22c55e] text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
        >
          <FiRefreshCw size={14} /> Refresh Stock
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <FiArchive size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Tracked Items</p>
            <p className="text-xl font-bold text-gray-900">{products.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <FiAlertTriangle size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Low Stock Warning (&le;5)</p>
            <p className="text-xl font-bold text-amber-600">{lowStockCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold">
            <FiAlertTriangle size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Out of Stock</p>
            <p className="text-xl font-bold text-red-600">{outOfStockCount}</p>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-[#f5f6f4] rounded-lg px-3 py-2 w-full sm:w-72 border border-gray-200/50">
            <FiSearch className="text-gray-400" size={15} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product or SKU..."
              className="bg-transparent text-xs outline-none w-full placeholder:text-gray-400 text-gray-800"
            />
          </div>
          <span className="text-xs text-gray-400 font-medium">
            Showing {filtered.length} products
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-gray-500 border-b border-gray-100 bg-[#fafbf9]">
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">SKU</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Current Stock</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Update Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400 text-xs">
                    Loading inventory details...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400 text-xs">
                    No products matching search.
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => {
                  const stockNum = Number(prod.stock);
                  const isLow = stockNum <= 5 && stockNum > 0;
                  const isOut = stockNum <= 0;

                  return (
                    <tr key={prod.id} className="hover:bg-[#fafbf9] transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">{prod.name}</p>
                        <p className="text-[11px] text-gray-400">{prod.variant || "-"}</p>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-gray-600">
                        {prod.sku || `NX-PRD-${prod.id}`}
                      </td>
                      <td className="px-4 py-3 text-gray-600 capitalize">
                        {prod.category?.replace(/-/g, " ")}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`font-bold text-xs ${
                            isOut ? "text-red-600" : isLow ? "text-amber-600" : "text-emerald-700"
                          }`}
                        >
                          {prod.stock} units
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                            isOut
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : isLow
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {isOut ? "Out of Stock" : isLow ? "Low Stock" : "In Stock"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <input
                            type="number"
                            min="0"
                            value={editStockMap[prod.id] ?? prod.stock}
                            onChange={(e) =>
                              setEditStockMap({ ...editStockMap, [prod.id]: e.target.value })
                            }
                            className="w-16 border border-gray-200 rounded-md px-2 py-1 text-xs text-center font-semibold text-gray-800 focus:outline-none focus:border-[#22c55e]"
                          />
                          <button
                            onClick={() => handleUpdateStock(prod.id)}
                            disabled={updatingId === prod.id}
                            className="px-2.5 py-1 bg-[#22c55e] hover:bg-[#16a34a] text-white font-semibold rounded-md text-xs shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            {updatingId === prod.id ? "Saving..." : "Save"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
