import { useEffect, useState, useCallback } from "react";
import { FiEye, FiSearch, FiX, FiCalendar, FiFilter, FiDownload, FiRotateCcw } from "react-icons/fi";
import { API_URL as API_BASE } from "../../config";
import { useAuth } from "../../context/AuthContext";

const STATUS_STYLES = {
  Delivered: "bg-green-100 text-green-700",
  Shipped: "bg-blue-100 text-blue-700",
  Processing: "bg-amber-100 text-amber-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Cancelled: "bg-red-100 text-red-700",
};

const TABS = ["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
const STATUS_OPTIONS = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

function formatDateTime(isoString) {
  if (!isoString) return "-";
  const date = new Date(isoString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateOnly(isoString) {
  if (!isoString) return "-";
  const date = new Date(isoString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function Orders() {
  const { hasPermission } = useAuth();
  const canEditOrders = hasPermission("orders.edit");

  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [datePreset, setDatePreset] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailLoading, setOrderDetailLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const getToken = () => localStorage.getItem("adminToken");

  const applyPreset = (preset) => {
    setDatePreset(preset);
    const today = new Date();
    const formatYMD = (d) => d.toISOString().split("T")[0];

    if (preset === "all") {
      setStartDate("");
      setEndDate("");
    } else if (preset === "today") {
      const s = formatYMD(today);
      setStartDate(s);
      setEndDate(s);
    } else if (preset === "yesterday") {
      const y = new Date();
      y.setDate(today.getDate() - 1);
      const s = formatYMD(y);
      setStartDate(s);
      setEndDate(s);
    } else if (preset === "last7") {
      const d7 = new Date();
      d7.setDate(today.getDate() - 7);
      setStartDate(formatYMD(d7));
      setEndDate(formatYMD(today));
    } else if (preset === "month") {
      const mStart = new Date(today.getFullYear(), today.getMonth(), 1);
      setStartDate(formatYMD(mStart));
      setEndDate(formatYMD(today));
    }
  };

  const clearFilters = () => {
    setActiveTab("All");
    setSearch("");
    setDatePreset("all");
    setStartDate("");
    setEndDate("");
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (activeTab !== "All") params.set("status", activeTab);
      if (search) params.set("search", search);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);

      const res = await fetch(`${API_BASE}/api/orders?${params.toString()}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      if (!res.ok) throw new Error("Failed to fetch orders.");
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab, search, startDate, endDate]);

  useEffect(() => {
    const timeout = setTimeout(fetchOrders, 300);
    return () => clearTimeout(timeout);
  }, [fetchOrders]);

  const viewOrder = async (id) => {
    setOrderDetailLoading(true);
    setSelectedOrder({ id });
    try {
      const res = await fetch(`${API_BASE}/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("Failed to fetch order details.");
      const data = await res.json();
      setSelectedOrder(data);
    } catch (err) {
      setSelectedOrder(null);
      alert(err.message);
    } finally {
      setOrderDetailLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    if (!canEditOrders) {
      alert("You do not have permission to update order status.");
      return;
    }
    setUpdatingId(id);
    try {
      const res = await fetch(`${API_BASE}/api/orders/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update status.");
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder?.id === id) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // Export filtered orders to CSV
  const handleExportCSV = () => {
    if (!orders.length) {
      alert("No orders to export.");
      return;
    }

    // Escapes a single CSV field: wraps in quotes and doubles any
    // internal quotes, per the CSV spec — prevents corruption when a
    // customer name/email contains a comma, quote, or newline.
    const escapeCSV = (value) => {
      const str = String(value ?? "");
      return `"${str.replace(/"/g, '""')}"`;
    };

    const headers = [
      "Order ID",
      "Customer Name",
      "Customer Email",
      "Date",
      "Status",
      "Payment Method",
      "Amount",
    ];

    const rows = orders.map((o) => [
      escapeCSV(o.order_number),
      escapeCSV(o.customer_name),
      escapeCSV(o.customer_email),
      escapeCSV(formatDateTime(o.created_at)),
      escapeCSV(o.status),
      escapeCSV(o.payment_method),
      o.total_amount || 0,
    ]);

    const csvString = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    // Prefix with a UTF-8 BOM so Excel renders ₹ and other special
    // characters correctly instead of showing garbled text.
    const blob = new Blob(["\uFEFF" + csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Nutriexa_Orders_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1a1a1a]">Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Track and manage customer purchases, delivery statuses, and dates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-[#22c55e] hover:border-[#22c55e] text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <FiDownload size={14} />
            <span>Export Orders</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-gray-500 flex items-center gap-1 mr-1">
              <FiCalendar size={13} className="text-[#22c55e]" /> Date Filter:
            </span>
            {[
              { key: "all", label: "All Time" },
              { key: "today", label: "Today" },
              { key: "yesterday", label: "Yesterday" },
              { key: "last7", label: "Last 7 Days" },
              { key: "month", label: "This Month" },
            ].map((p) => (
              <button
                key={p.key}
                onClick={() => applyPreset(p.key)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  datePreset === p.key && !startDate
                    ? "bg-[#22c55e] text-white"
                    : datePreset === p.key
                    ? "bg-[#22c55e] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1">
              <span className="text-gray-400 font-medium">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setDatePreset("custom");
                }}
                className="bg-transparent text-gray-700 outline-none text-xs cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1">
              <span className="text-gray-400 font-medium">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setDatePreset("custom");
                }}
                className="bg-transparent text-gray-700 outline-none text-xs cursor-pointer"
              />
            </div>
            {(startDate || endDate || activeTab !== "All" || search) && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-rose-600 hover:underline px-2 py-1 font-semibold cursor-pointer"
                title="Clear all filters"
              >
                <FiRotateCcw size={12} /> Clear
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-1.5 flex-wrap">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === tab
                    ? "bg-[#16a34a] text-white shadow-xs"
                    : "bg-[#f5f6f4] text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-[#f5f6f4] rounded-lg px-3 py-1.5 w-full sm:w-64 border border-gray-200/50">
            <FiSearch className="text-gray-400" size={15} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order ID or customer..."
              className="bg-transparent text-xs outline-none w-full placeholder:text-gray-400 text-gray-800"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-gray-500 border-b border-gray-100 bg-[#fafbf9]">
                <th className="px-4 py-3 font-semibold">Order ID</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Date &amp; Time</th>
                <th className="px-4 py-3 font-semibold">Items</th>
                <th className="px-4 py-3 font-semibold">Payment</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400 text-xs">
                    Loading orders...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-red-500 text-xs">
                    {error}
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400 text-xs">
                    No orders found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#fafbf9] transition-colors">
                    <td className="px-4 py-3 font-bold text-gray-900 whitespace-nowrap">
                      {order.order_number}
                    </td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap font-medium">
                      {order.customer_name}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-800">
                          {formatDateOnly(order.created_at)}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {order.item_count || 1} items
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {order.payment_method || "Online"}
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-900 whitespace-nowrap">
                      ₹{Number(order.total_amount).toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <select
                        value={order.status}
                        disabled={!canEditOrders || updatingId === order.id}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold border-0 outline-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                          STATUS_STYLES[order.status] || "bg-gray-100 text-gray-700"
                        }`}
                        title={!canEditOrders ? "You don't have permission to edit order status" : ""}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s} className="bg-white text-gray-800 font-normal">
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => viewOrder(order.id)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-[#22c55e] hover:bg-[#22c55e]/10 transition-colors cursor-pointer"
                        title="View Details"
                      >
                        <FiEye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setSelectedOrder(null)}
          />
          <div className="relative bg-white rounded-2xl w-full max-w-lg p-6 z-10 shadow-2xl border border-gray-100">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <FiX size={18} />
            </button>

            {orderDetailLoading ? (
              <p className="text-xs text-gray-500 py-10 text-center">Loading order details...</p>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <h2 className="text-base font-extrabold text-gray-900">
                      Order {selectedOrder.order_number}
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {selectedOrder.customer_name} {selectedOrder.customer_email && `· ${selectedOrder.customer_email}`}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      STATUS_STYLES[selectedOrder.status] || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {selectedOrder.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 py-3 text-xs border-b border-gray-100 text-gray-600">
                  <div>
                    <p className="text-gray-400 text-[10.5px]">Placed On</p>
                    <p className="font-semibold text-gray-800">{formatDateTime(selectedOrder.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-[10.5px]">Payment Method</p>
                    <p className="font-semibold text-gray-800">{selectedOrder.payment_method || "Online"}</p>
                  </div>
                </div>

                <div className="my-4 max-h-56 overflow-y-auto space-y-2.5 pr-1">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Ordered Items</p>
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs py-1">
                      <div>
                        <p className="font-medium text-gray-900">{item.product_name}</p>
                        <p className="text-gray-400 text-[11px]">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-bold text-gray-900">
                        ₹{Number(item.price * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-xs font-bold text-gray-700">Total Amount</span>
                  <span className="text-base font-extrabold text-[#16a34a]">
                    ₹{Number(selectedOrder.total_amount).toLocaleString("en-IN")}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}