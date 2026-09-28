import { useEffect, useState } from "react";
import {
  FiArchive,
  FiSearch,
  FiAlertTriangle,
  FiCheckCircle,
  FiFilter,
  FiRefreshCw,
  FiSliders,
} from "react-icons/fi";
import { API_URL as BASE_URL } from "../../config";

const STATUS_BADGES = {
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Inactive: "bg-amber-50 text-amber-700 border-amber-200",
  Disabled: "bg-rose-50 text-rose-700 border-rose-200",
  "Out of Stock": "bg-red-50 text-red-700 border-red-200",
};

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [updatingId, setUpdatingId] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
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

  // Sync status changes directly with Products API
  const handleStatusChange = async (id, newStatus) => {
    setUpdatingStatusId(id);
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(`${BASE_URL}/api/products/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || data.error || "Failed to update product status.");
      }

      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
      );
    } catch (err) {
      alert("Status Update Error: " + err.message);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Update stock level and auto-sync status appropriately
  const handleUpdateStock = async (id) => {
    const newStock = parseInt(editStockMap[id], 10) || 0;
    setUpdatingId(id);
    try {
      const token = localStorage.getItem("adminToken");
      const prod = products.find((p) => p.id === id);
      
      // If out of stock, set Out of Stock. If re-stocked and was Out of Stock, set Active. Otherwise retain existing status (Active, Inactive, Disabled).
      let targetStatus = prod.status || "Active";
      if (newStock <= 0) {
        targetStatus = "Out of Stock";
      } else if (targetStatus === "Out of Stock") {
        targetStatus = "Active";
      }

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
          stock: newStock,
          status: targetStatus,
        }),
      });

      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === id
              ? {
                  ...p,
                  stock: newStock,
                  status: targetStatus,
                }
              : p
          )
        );
        alert("Stock updated successfully.");
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to update stock");
      }
    } catch (err) {
      alert("Failed to update stock: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter products by search and status
  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase());

    const stockNum = Number(p.stock);
    const prodStatus = p.status || (stockNum <= 0 ? "Out of Stock" : "Active");

    if (!matchesSearch) return false;
    if (statusFilter === "All") return true;
    if (statusFilter === "Active") return prodStatus === "Active";
    if (statusFilter === "Inactive") return prodStatus === "Inactive";
    if (statusFilter === "Disabled") return prodStatus === "Disabled";
    if (statusFilter === "Out of Stock") return stockNum <= 0 || prodStatus === "Out of Stock";
    if (statusFilter === "Low Stock") return stockNum <= 5 && stockNum > 0;
    return true;
  });

  const activeCount = products.filter((p) => (p.status || "Active") === "Active" && Number(p.stock) > 0).length;
  const inactiveCount = products.filter((p) => p.status === "Inactive").length;
  const disabledCount = products.filter((p) => p.status === "Disabled").length;
  const lowStockCount = products.filter((p) => Number(p.stock) <= 5 && Number(p.stock) > 0).length;
  const outOfStockCount = products.filter((p) => Number(p.stock) <= 0 || p.status === "Out of Stock").length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1a1a1a]">Inventory &amp; Stock Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Monitor real-time warehouse inventory, status synchronization with Products page, and quick stock updates.
          </p>
        </div>
        <button
          onClick={fetchInventory}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-[#22c55e] text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
        >
          <FiRefreshCw size={14} className={loading ? "animate-spin text-[#22c55e]" : ""} />
          <span>Refresh Stock</span>
        </button>
      </div>

      {/* Overview Stat Cards with Connected Statuses */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
            <FiArchive size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-gray-500 font-medium truncate">Total Tracked Items</p>
            <p className="text-xl font-bold text-gray-900">{products.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center font-bold shrink-0">
            <FiCheckCircle size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-gray-500 font-medium truncate">Active Products</p>
            <p className="text-xl font-bold text-green-600">{activeCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
            <FiAlertTriangle size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-gray-500 font-medium truncate">Inactive / Disabled</p>
            <p className="text-xl font-bold text-amber-600">{inactiveCount + disabledCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center font-bold shrink-0">
            <FiSliders size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-gray-500 font-medium truncate">Low Stock (≤5)</p>
            <p className="text-xl font-bold text-yellow-600">{lowStockCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold shrink-0">
            <FiAlertTriangle size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-gray-500 font-medium truncate">Out of Stock</p>
            <p className="text-xl font-bold text-rose-600">{outOfStockCount}</p>
          </div>
        </div>
      </div>

      {/* Filter Bar & Status Controls */}
      <div className="bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 shadow-xs p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1 mr-1">
              <FiFilter size={13} className="text-[#22c55e]" /> Status:
            </span>
            {[
              { key: "All", label: "All Products" },
              { key: "Active", label: "Active" },
              { key: "Inactive", label: "Inactive" },
              { key: "Disabled", label: "Disabled" },
              { key: "Low Stock", label: "Low Stock (≤5)" },
              { key: "Out of Stock", label: "Out of Stock" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === tab.key
                    ? "bg-[#22c55e] text-white shadow-xs font-bold"
                    : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-2 bg-[#f5f6f4] dark:bg-white/10 rounded-lg px-3 py-2 w-full sm:w-72 border border-gray-200/50 dark:border-white/10">
            <FiSearch className="text-gray-400" size={15} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product, category or SKU..."
              className="bg-transparent text-xs outline-none w-full placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-800 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-white/10 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-medium">
          <span>Showing {filtered.length} of {products.length} products</span>
          <span className="text-[11px] text-gray-400">Status changes instantly sync with Product Catalog</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-white/10 bg-[#fafbf9] dark:bg-white/5">
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">SKU</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Current Stock</th>
                <th className="px-4 py-3 font-semibold">Product Status</th>
                <th className="px-4 py-3 font-semibold text-right">Update Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400 text-xs">
                    Loading inventory details...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400 text-xs">
                    No products matching search or selected status filter.
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => {
                  const stockNum = Number(prod.stock);
                  const isLow = stockNum <= 5 && stockNum > 0;
                  const isOut = stockNum <= 0;
                  const currentStatus = prod.status || (isOut ? "Out of Stock" : "Active");

                  return (
                    <tr key={prod.id} className="hover:bg-[#fafbf9] dark:hover:bg-white/5 transition-colors">
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
                        <div className="flex flex-col">
                          <span
                            className={`font-bold text-xs ${
                              isOut ? "text-rose-600" : isLow ? "text-amber-600" : "text-emerald-700"
                            }`}
                          >
                            {prod.stock} units
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {isOut ? "Out of stock" : isLow ? "Low stock threshold" : "Available"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {/* Synced Status Dropdown */}
                        <div className="relative inline-block">
                          <select
                            value={currentStatus}
                            disabled={updatingStatusId === prod.id}
                            onChange={(e) => handleStatusChange(prod.id, e.target.value)}
                            className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer outline-none ${
                              STATUS_BADGES[currentStatus] || "bg-gray-100 text-gray-700 border-gray-200"
                            } ${updatingStatusId === prod.id ? "opacity-50" : ""}`}
                            title="Change product status (syncs with Products page)"
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Disabled">Disabled</option>
                            <option value="Out of Stock">Out of Stock</option>
                          </select>
                        </div>
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
                            className="w-16 border border-gray-200 dark:border-white/20 rounded-md px-2 py-1 text-xs text-center font-semibold text-gray-800 dark:text-white dark:bg-white/10 focus:outline-none focus:border-[#22c55e]"
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
