import { useState, useEffect } from "react";
import {
  FiCreditCard,
  FiDollarSign,
  FiSearch,
  FiFilter,
  FiDownload,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiTrendingUp,
  FiTrendingDown,
  FiCheck,
} from "react-icons/fi";
import { API_URL as API_BASE } from "../../config";

const MOCK_TRANSACTIONS = [
  {
    id: "TXN-8821",
    orderId: "#ORD-1045",
    customer: "Rahul Sharma",
    amount: 2499,
    method: "Razorpay",
    status: "Success",
    type: "Payment",
    date: "2024-05-18T10:30:00Z",
    razorpayId: "pay_NxV82kLmQpT9w3",
  },
  {
    id: "TXN-8820",
    orderId: "#ORD-1044",
    customer: "Priya Singh",
    amount: 1850,
    method: "COD",
    status: "Collected",
    type: "Payment",
    date: "2024-05-17T14:20:00Z",
    razorpayId: null,
  },
  {
    id: "TXN-8819",
    orderId: "#ORD-1043",
    customer: "Arjun Patel",
    amount: 3299,
    method: "Razorpay",
    status: "Success",
    type: "Payment",
    date: "2024-05-16T09:15:00Z",
    razorpayId: "pay_MwU71jKnRoS8v2",
  },
  {
    id: "TXN-8818",
    orderId: "#ORD-1042",
    customer: "Sneha Rao",
    amount: 899,
    method: "Razorpay",
    status: "Refunded",
    type: "Refund",
    date: "2024-05-15T16:10:00Z",
    razorpayId: "pay_LvT60iJmQnR7u1",
  },
  {
    id: "TXN-8817",
    orderId: "#ORD-1041",
    customer: "Vikram Kumar",
    amount: 4500,
    method: "Razorpay",
    status: "Failed",
    type: "Payment",
    date: "2024-05-15T11:20:00Z",
    razorpayId: "pay_KuS59hIlPmQ6t0",
  },
  {
    id: "TXN-8816",
    orderId: "#ORD-1040",
    customer: "Deepika Nair",
    amount: 1299,
    method: "COD",
    status: "Pending",
    type: "Payment",
    date: "2024-05-14T08:45:00Z",
    razorpayId: null,
  },
  {
    id: "TXN-8815",
    orderId: "#ORD-1039",
    customer: "Amit Gupta",
    amount: 5999,
    method: "Razorpay",
    status: "Success",
    type: "Payment",
    date: "2024-05-13T15:30:00Z",
    razorpayId: "pay_JtR48gHkOlP5s9",
  },
];

const STATUS_STYLES = {
  Success: { bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800" },
  Collected: { bg: "bg-teal-50 dark:bg-teal-950/40", text: "text-teal-700 dark:text-teal-300", border: "border-teal-200 dark:border-teal-800" },
  Refunded: { bg: "bg-indigo-50 dark:bg-indigo-950/40", text: "text-indigo-700 dark:text-indigo-300", border: "border-indigo-200 dark:border-indigo-800" },
  Failed: { bg: "bg-rose-50 dark:bg-rose-950/40", text: "text-rose-700 dark:text-rose-300", border: "border-rose-200 dark:border-rose-800" },
  Pending: { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800" },
};

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function Payments() {
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [methodFilter, setMethodFilter] = useState("All");
  const [loading, setLoading] = useState(false);

  // Fetch real orders from database if available to enrich payments
  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        const token = localStorage.getItem("adminToken");
        const res = await fetch(`${API_BASE}/api/orders`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const orders = await res.json();
          if (Array.isArray(orders) && orders.length > 0) {
            const mappedOrders = orders.map((o) => {
              const method = o.payment_method?.toLowerCase() === "cod" ? "COD" : "Razorpay";
              let status = "Success";
              if (o.status === "Cancelled") status = "Refunded";
              else if (o.status === "Payment Failed") status = "Failed";
              else if (o.status === "Pending" && method === "COD") status = "Pending";
              else if (o.status === "Delivered" && method === "COD") status = "Collected";

              return {
                id: `TXN-${o.id || o.order_number}`,
                orderId: o.order_number || `#ORD-${o.id}`,
                customer: o.customer_name || "Customer",
                amount: Number(o.total_amount || 0),
                method: method,
                status: status,
                type: status === "Refunded" ? "Refund" : "Payment",
                date: o.created_at || new Date().toISOString(),
                razorpayId: o.razorpay_payment_id || null,
              };
            });

            // Combine with unique mock transactions
            setTransactions((prev) => {
              const combined = [...mappedOrders];
              for (const m of MOCK_TRANSACTIONS) {
                if (!combined.some((c) => c.orderId === m.orderId)) {
                  combined.push(m);
                }
              }
              return combined;
            });
          }
        }
      } catch (err) {
        console.warn("Could not load backend orders for payments:", err);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  const filtered = transactions.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch =
      t.id.toLowerCase().includes(q) ||
      t.customer.toLowerCase().includes(q) ||
      t.orderId.toLowerCase().includes(q);
    const matchStatus = statusFilter === "All" || t.status === statusFilter;
    const matchMethod = methodFilter === "All" || t.method === methodFilter;
    return matchSearch && matchStatus && matchMethod;
  });

  // Calculate dynamic subtotals per category
  const categorySubtotals = {
    All: transactions
      .filter((t) => t.status === "Success" || t.status === "Collected")
      .reduce((a, t) => a + t.amount, 0),
    Success: transactions
      .filter((t) => t.status === "Success")
      .reduce((a, t) => a + t.amount, 0),
    Collected: transactions
      .filter((t) => t.status === "Collected")
      .reduce((a, t) => a + t.amount, 0),
    Refunded: transactions
      .filter((t) => t.status === "Refunded")
      .reduce((a, t) => a + t.amount, 0),
    Failed: transactions
      .filter((t) => t.status === "Failed")
      .reduce((a, t) => a + t.amount, 0),
    Pending: transactions
      .filter((t) => t.status === "Pending")
      .reduce((a, t) => a + t.amount, 0),
  };

  // Subtotal for the CURRENT filtered selection
  const currentFilteredSubtotal = filtered.reduce((a, t) => a + t.amount, 0);

  // Stats cards configuration
  const totalRevenueAll = categorySubtotals.All;
  const isSpecificCategory = statusFilter !== "All";

  // Label and value for the primary revenue/subtotal card
  const primaryCardTitle =
    statusFilter === "All"
      ? "Total Revenue"
      : statusFilter === "Collected"
      ? "COD Collected Subtotal"
      : `${statusFilter} Subtotal`;

  const primaryCardValue =
    statusFilter === "All" ? totalRevenueAll : currentFilteredSubtotal;

  const stats = {
    totalRevenue: primaryCardValue,
    totalRefunds: categorySubtotals.Refunded,
    pending: transactions.filter((t) => t.status === "Pending").length,
    failed: transactions.filter((t) => t.status === "Failed").length,
  };

  // Export filtered transactions to CSV
  const handleExport = () => {
    const headers = ["Transaction ID", "Order ID", "Customer", "Amount (INR)", "Method", "Status", "Type", "Date"];
    const rows = filtered.map((t) => [
      t.id,
      t.orderId,
      `"${t.customer}"`,
      t.amount,
      t.method,
      t.status,
      t.type,
      formatDate(t.date),
    ]);

    // Append subtotal row
    rows.push(["", "", "SUBTOTAL:", currentFilteredSubtotal, "", `Category: ${statusFilter}`, "", ""]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Nutriexa_Payments_${statusFilter}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1a1a1a] dark:text-white tracking-tight flex items-center gap-2.5">
            <span>Payments & Transactions</span>
            {isSpecificCategory && (
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {statusFilter} Selected
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Transaction logs, refunds, and real-time revenue subtotals by category.
          </p>
        </div>

        {/* Live Subtotal Pill Banner */}
        <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-2.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
            ₹
          </div>
          <div>
            <div className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              {isSpecificCategory ? `${statusFilter} Category Subtotal` : "Active Total Revenue"}
            </div>
            <div className="text-lg font-black text-emerald-950 dark:text-emerald-200">
              ₹{primaryCardValue.toLocaleString("en-IN")}{" "}
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                ({filtered.length} items)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Stat Cards — Clickable to Filter Category */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {[
          {
            key: "revenue",
            targetStatus: "Success",
            label: primaryCardTitle,
            value: `₹${stats.totalRevenue.toLocaleString("en-IN")}`,
            subtext: isSpecificCategory ? `${filtered.length} orders in ${statusFilter}` : "Gross successful revenue",
            icon: <FiTrendingUp size={20} />,
            colorClass: "text-emerald-500",
            bgClass: "bg-emerald-50 dark:bg-emerald-950/40",
            isActive: statusFilter === "Success" || (statusFilter === "All" && !isSpecificCategory),
          },
          {
            key: "refunds",
            targetStatus: "Refunded",
            label: "Total Refunds",
            value: `₹${stats.totalRefunds.toLocaleString("en-IN")}`,
            subtext: `${categorySubtotals.Refunded > 0 ? "₹" + categorySubtotals.Refunded.toLocaleString() : "No"} returned funds`,
            icon: <FiTrendingDown size={20} />,
            colorClass: "text-indigo-500",
            bgClass: "bg-indigo-50 dark:bg-indigo-950/40",
            isActive: statusFilter === "Refunded",
          },
          {
            key: "pending",
            targetStatus: "Pending",
            label: "Pending COD Subtotal",
            value: `₹${categorySubtotals.Pending.toLocaleString("en-IN")}`,
            subtext: `${stats.pending} order awaiting delivery`,
            icon: <FiClock size={20} />,
            colorClass: "text-amber-500",
            bgClass: "bg-amber-50 dark:bg-amber-950/40",
            isActive: statusFilter === "Pending",
          },
          {
            key: "failed",
            targetStatus: "Failed",
            label: "Failed Payments Subtotal",
            value: `₹${categorySubtotals.Failed.toLocaleString("en-IN")}`,
            subtext: `${stats.failed} payment unsuccessful`,
            icon: <FiXCircle size={20} />,
            colorClass: "text-rose-500",
            bgClass: "bg-rose-50 dark:bg-rose-950/40",
            isActive: statusFilter === "Failed",
          },
        ].map((s) => (
          <div
            key={s.key}
            onClick={() => setStatusFilter((prev) => (prev === s.targetStatus ? "All" : s.targetStatus))}
            className={`rounded-xl p-4 border transition-all duration-200 cursor-pointer shadow-xs relative overflow-hidden group ${
              s.isActive
                ? "bg-white dark:bg-[#111722] border-emerald-500 ring-2 ring-emerald-500/20 shadow-md"
                : "bg-white dark:bg-white/5 border-gray-100 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20"
            }`}
          >
            {s.isActive && (
              <span className="absolute top-2 right-2 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-600 text-white">
                ACTIVE
              </span>
            )}
            <div className="flex gap-3.5 items-center">
              <div
                className={`w-11 h-11 ${s.bgClass} rounded-xl flex items-center justify-center ${s.colorClass} shrink-0 group-hover:scale-110 transition-transform`}
              >
                {s.icon}
              </div>
              <div className="min-w-0">
                <div className="text-xl font-extrabold text-gray-900 dark:text-white truncate">
                  {s.value}
                </div>
                <div className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate">
                  {s.label}
                </div>
                <div className="text-[10px] text-gray-400 dark:text-gray-500 truncate mt-0.5">
                  {s.subtext}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Category Status Pills */}
      <div>
        <div className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider flex items-center gap-1.5">
          <FiFilter size={13} />
          <span>Click Category to View Subtotal:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "All Status", value: "All", count: transactions.length, subtotal: categorySubtotals.All },
            { label: "Success", value: "Success", count: transactions.filter((t) => t.status === "Success").length, subtotal: categorySubtotals.Success },
            { label: "COD Collected", value: "Collected", count: transactions.filter((t) => t.status === "Collected").length, subtotal: categorySubtotals.Collected },
            { label: "Refunded", value: "Refunded", count: transactions.filter((t) => t.status === "Refunded").length, subtotal: categorySubtotals.Refunded },
            { label: "Failed", value: "Failed", count: transactions.filter((t) => t.status === "Failed").length, subtotal: categorySubtotals.Failed },
            { label: "Pending", value: "Pending", count: transactions.filter((t) => t.status === "Pending").length, subtotal: categorySubtotals.Pending },
          ].map((cat) => {
            const isSelected = statusFilter === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setStatusFilter(cat.value)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/20 scale-102"
                    : "bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10"
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isSelected
                      ? "bg-emerald-700 text-white"
                      : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {cat.count}
                </span>
                <span
                  className={`text-[11px] font-extrabold ${
                    isSelected ? "text-emerald-100" : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  ₹{cat.subtotal.toLocaleString("en-IN")}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters & Search Row */}
      <div className="bg-white dark:bg-[#111722] rounded-xl border border-gray-100 dark:border-white/10 shadow-xs p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <FiSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Search by transaction ID, customer, order..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 rounded-lg text-xs outline-none text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-emerald-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-200 outline-none cursor-pointer focus:border-emerald-500"
        >
          <option value="All">All Status</option>
          <option value="Success">Success (₹{categorySubtotals.Success.toLocaleString()})</option>
          <option value="Collected">COD Collected (₹{categorySubtotals.Collected.toLocaleString()})</option>
          <option value="Refunded">Refunded (₹{categorySubtotals.Refunded.toLocaleString()})</option>
          <option value="Failed">Failed (₹{categorySubtotals.Failed.toLocaleString()})</option>
          <option value="Pending">Pending (₹{categorySubtotals.Pending.toLocaleString()})</option>
        </select>

        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-200 outline-none cursor-pointer focus:border-emerald-500"
        >
          <option value="All">All Methods</option>
          <option value="Razorpay">Razorpay (Online)</option>
          <option value="COD">COD (Cash on Delivery)</option>
        </select>

        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 rounded-lg text-xs font-bold text-emerald-700 dark:text-emerald-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/15 transition-colors"
        >
          <FiDownload size={14} /> Export CSV
        </button>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-[#111722] rounded-xl border border-gray-100 dark:border-white/10 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-white/10 bg-gray-50/70 dark:bg-white/5">
                {["Transaction ID", "Order", "Customer", "Amount", "Method", "Status", "Type", "Date"].map((h) => (
                  <th key={h} className="px-4 py-3 font-bold uppercase tracking-wider text-[10.5px]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {filtered.map((t) => {
                const style = STATUS_STYLES[t.status] || STATUS_STYLES.Pending;
                return (
                  <tr
                    key={t.id}
                    className="hover:bg-gray-50/80 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-gray-900 dark:text-white text-xs">
                        {t.id}
                      </div>
                      {t.razorpayId && (
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                          {t.razorpayId}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-emerald-600 dark:text-emerald-400 font-bold">
                      {t.orderId}
                    </td>
                    <td className="px-4 py-3.5 text-gray-700 dark:text-gray-300 font-medium">
                      {t.customer}
                    </td>
                    <td className="px-4 py-3.5 font-black text-gray-900 dark:text-white">
                      ₹{t.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold ${
                          t.method === "COD"
                            ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                            : "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                        }`}
                      >
                        {t.method}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${style.bg} ${style.text} ${style.border}`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td
                      className={`px-4 py-3.5 font-semibold text-xs ${
                        t.type === "Refund"
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {t.type}
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400 text-xs">
                      {formatDate(t.date)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-12 text-center text-gray-400 text-xs">
              No transactions match the selected category or search filters.
            </div>
          )}

          {/* Subtotal Summary Footer */}
          {filtered.length > 0 && (
            <div className="p-4 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="text-gray-500 dark:text-gray-400 font-medium">
                Showing <strong className="text-gray-900 dark:text-white">{filtered.length}</strong> transactions for{" "}
                <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                  {statusFilter}
                </span>
              </span>

              <div className="flex items-center gap-2">
                <span className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-[11px]">
                  {statusFilter} Category Subtotal:
                </span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                  ₹{currentFilteredSubtotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
