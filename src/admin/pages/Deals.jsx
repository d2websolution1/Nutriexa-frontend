import { useEffect, useState, useCallback } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiCopy, FiSearch, FiX } from "react-icons/fi";

const STATUS_STYLES = {
  Active: "bg-green-100 text-green-700",
  Expired: "bg-red-100 text-red-700",
  Scheduled: "bg-blue-100 text-blue-700",
};

const API_BASE = import.meta.env.VITE_API_URL || "   https://nutriexa-backend.onrender.com";

const emptyForm = {
  code: "",
  type: "Percentage",
  value: "",
  minOrder: "",
  usageLimit: "",
  expiryDate: "",
};

export default function Deals() {
  const [search, setSearch] = useState("");
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [weeklyDeals, setWeeklyDeals] = useState([]);
  const [dealsLoading, setDealsLoading] = useState(true);
  const [showDealPicker, setShowDealPicker] = useState(false);
  const [products, setProducts] = useState([]);
  const [dealForm, setDealForm] = useState({ product_id: "", discount_percent: "", ends_at: "" });

  const getToken = () => localStorage.getItem("adminToken");

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`${API_BASE}/api/coupons?${params.toString()}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("Failed to fetch coupons.");
      const data = await res.json();
      setCoupons(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search]);

  const fetchWeeklyDeals = useCallback(async () => {
    setDealsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/coupons/weekly-deals/list`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("Failed to fetch deals.");
      const data = await res.json();
      setWeeklyDeals(data);
    } catch (err) {
      console.error(err.message);
    } finally {
      setDealsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(fetchCoupons, 300);
    return () => clearTimeout(timeout);
  }, [fetchCoupons]);

  useEffect(() => {
    fetchWeeklyDeals();
  }, [fetchWeeklyDeals]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (c) => {
    setEditingId(c.id);
    setForm({
      code: c.code,
      type: c.type,
      value: c.value,
      minOrder: c.min_order,
      usageLimit: c.usage_limit || "",
      expiryDate: c.expiry_date?.slice(0, 10) || "",
    });
    setShowForm(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitCoupon = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId
        ? `${API_BASE}/api/coupons/${editingId}`
        : `${API_BASE}/api/coupons`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to save coupon.");
      }

      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      fetchCoupons();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteCoupon = async (id) => {
    if (!confirm("Delete this coupon?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/coupons/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("Failed to delete coupon.");
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
  };

  const openDealPicker = async () => {
    setShowDealPicker(true);
    try {
      const res = await fetch(`${API_BASE}/api/products`);
      if (!res.ok) throw new Error("Failed to fetch products.");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err.message);
    }
  };

  const submitDeal = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/coupons/weekly-deals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(dealForm),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to add deal.");
      }
      setShowDealPicker(false);
      setDealForm({ product_id: "", discount_percent: "", ends_at: "" });
      fetchWeeklyDeals();
    } catch (err) {
      alert(err.message);
    }
  };

  const removeDeal = async (id) => {
    if (!confirm("Remove this deal?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/coupons/weekly-deals/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("Failed to remove deal.");
      setWeeklyDeals((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const daysLeft = (endsAt) => {
    const diff = Math.ceil((new Date(endsAt) - new Date()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? `${diff} days left` : "Ended";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1a1a1a]">Deals & Coupons</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage discount coupons and weekly deals.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#4CAF37] text-white text-sm font-semibold px-5 py-2.5 rounded-md hover:opacity-90"
        >
          <FiPlus size={18} /> Create Coupon
        </button>
      </div>

      {/* Create/Edit coupon form (inline card) */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[#1a1a1a] text-sm">
              {editingId ? "Edit Coupon" : "New Coupon"}
            </h2>
            <button
              onClick={() => { setShowForm(false); setEditingId(null); }}
              className="text-xs text-gray-500 hover:text-red-500"
            >
              Cancel
            </button>
          </div>
          <form onSubmit={submitCoupon} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                Coupon Code
              </label>
              <input
                name="code"
                value={form.code}
                onChange={handleChange}
                type="text"
                placeholder="e.g. SAVE15"
                className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF37] uppercase"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                Discount Type
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF37]"
              >
                <option>Percentage</option>
                <option>Flat</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                Value
              </label>
              <input
                name="value"
                value={form.value}
                onChange={handleChange}
                type="number"
                placeholder={form.type === "Percentage" ? "e.g. 15" : "e.g. 150"}
                className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF37]"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                Min Order (₹)
              </label>
              <input
                name="minOrder"
                value={form.minOrder}
                onChange={handleChange}
                type="number"
                placeholder="e.g. 999"
                className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF37]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                Usage Limit
              </label>
              <input
                name="usageLimit"
                value={form.usageLimit}
                onChange={handleChange}
                type="number"
                placeholder="e.g. 500"
                className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF37]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                Expiry Date
              </label>
              <input
                name="expiryDate"
                value={form.expiryDate}
                onChange={handleChange}
                type="date"
                className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF37]"
                required
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-4 flex justify-end gap-2.5 mt-1">
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingId(null); }}
                className="border border-gray-200 text-[#1a1a1a] font-semibold text-sm px-5 py-2.5 rounded-md hover:bg-gray-50"
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-[#4CAF37] text-white font-semibold text-sm px-5 py-2.5 rounded-md hover:opacity-90 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Coupon"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Coupons table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-2 bg-[#f5f6f4] rounded-md px-3 py-2 max-w-sm">
              <FiSearch className="text-gray-400" size={16} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search coupon code..."
                className="bg-transparent text-sm outline-none w-full placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100 bg-[#fafbf9]">
                  <th className="px-4 py-3 font-medium">Code</th>
                  <th className="px-4 py-3 font-medium">Value</th>
                  <th className="px-4 py-3 font-medium">Min Order</th>
                  <th className="px-4 py-3 font-medium">Usage</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-400 text-sm">
                      Loading coupons...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-red-500 text-sm">
                      {error}
                    </td>
                  </tr>
                ) : coupons.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-500 text-sm">
                      No coupons found.
                    </td>
                  </tr>
                ) : (
                  coupons.map((c) => (
                    <tr key={c.id} className="border-b border-gray-50 last:border-0 hover:bg-[#fafbf9]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-[#1a1a1a] bg-[#f3f6f2] px-2 py-1 rounded text-xs">
                            {c.code}
                          </span>
                          <button
                            onClick={() => copyCode(c.code)}
                            className="text-gray-400 hover:text-[#4CAF37]"
                          >
                            <FiCopy size={13} />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {c.type === "Percentage" ? `${c.value}%` : `₹${c.value}`}
                      </td>
                      <td className="px-4 py-3 text-gray-600">₹{c.min_order}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {c.used_count} / {c.usage_limit || "∞"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[c.status]}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(c)}
                            className="p-2 rounded-md text-gray-500 hover:text-[#4CAF37] hover:bg-[#4CAF37]/10"
                          >
                            <FiEdit2 size={15} />
                          </button>
                          <button
                            onClick={() => deleteCoupon(c.id)}
                            className="p-2 rounded-md text-gray-500 hover:text-red-500 hover:bg-red-50"
                          >
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Deals of the week */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-[#1a1a1a] mb-4 text-sm">Deals of the Week</h2>

          {dealsLoading ? (
            <p className="text-xs text-gray-400">Loading...</p>
          ) : weeklyDeals.length === 0 ? (
            <p className="text-xs text-gray-400">No active deals.</p>
          ) : (
            <div className="space-y-4">
              {weeklyDeals.map((d) => (
                <div key={d.id} className="flex items-center justify-between gap-3 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#1a1a1a] truncate">{d.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{daysLeft(d.ends_at)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-semibold text-[#4CAF37] bg-[#4CAF37]/10 px-2.5 py-1 rounded-full">
                      {d.discount_percent}% OFF
                    </span>
                    <button
                      onClick={() => removeDeal(d.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={openDealPicker}
            className="mt-4 w-full text-center text-xs font-semibold text-[#4CAF37] hover:underline"
          >
            + Add Product to Deals
          </button>
        </div>
      </div>

      {/* Add product to deals modal */}
      {showDealPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowDealPicker(false)} />
          <div className="relative bg-white rounded-xl w-full max-w-md p-6 z-10">
            <button
              onClick={() => setShowDealPicker(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-[#1a1a1a]"
            >
              <FiX size={20} />
            </button>
            <h2 className="text-lg font-extrabold text-[#1a1a1a] mb-4">Add Product to Deals</h2>

            <form onSubmit={submitDeal} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">Product</label>
                <select
                  value={dealForm.product_id}
                  onChange={(e) => setDealForm({ ...dealForm, product_id: e.target.value })}
                  className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF37]"
                  required
                >
                  <option value="">Select a product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">Discount %</label>
                <input
                  type="number"
                  value={dealForm.discount_percent}
                  onChange={(e) => setDealForm({ ...dealForm, discount_percent: e.target.value })}
                  placeholder="e.g. 20"
                  className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF37]"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">Ends On</label>
                <input
                  type="date"
                  value={dealForm.ends_at}
                  onChange={(e) => setDealForm({ ...dealForm, ends_at: e.target.value })}
                  className="w-full border border-gray-200 rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF37]"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#4CAF37] text-white font-semibold py-2.5 rounded-md hover:opacity-90"
              >
                Add to Deals
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}