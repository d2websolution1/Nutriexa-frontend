import { useState } from "react";
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
} from "react-icons/fi";

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
  Success: { bg: "#ecfdf5", color: "#10b981", border: "#d1fae5" },
  Collected: { bg: "#ecfdf5", color: "#10b981", border: "#d1fae5" },
  Refunded: { bg: "#eef2ff", color: "#6366f1", border: "#c7d2fe" },
  Failed: { bg: "#fef2f2", color: "#ef4444", border: "#fee2e2" },
  Pending: { bg: "#fffbeb", color: "#f59e0b", border: "#fde68a" },
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function Payments() {
  const [transactions] = useState(MOCK_TRANSACTIONS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [methodFilter, setMethodFilter] = useState("All");

  const filtered = transactions.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch = t.id.toLowerCase().includes(q) || t.customer.toLowerCase().includes(q) || t.orderId.toLowerCase().includes(q);
    const matchStatus = statusFilter === "All" || t.status === statusFilter;
    const matchMethod = methodFilter === "All" || t.method === methodFilter;
    return matchSearch && matchStatus && matchMethod;
  });

  const stats = {
    totalRevenue: transactions.filter((t) => t.status === "Success" || t.status === "Collected").reduce((a, t) => a + t.amount, 0),
    totalRefunds: transactions.filter((t) => t.status === "Refunded").reduce((a, t) => a + t.amount, 0),
    pending: transactions.filter((t) => t.status === "Pending").length,
    failed: transactions.filter((t) => t.status === "Failed").length,
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#1a1a1a] dark:text-white tracking-tight">Payments</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Transaction logs, refunds, and payment gateway activity.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {[
          { label: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: <FiTrendingUp size={20} />, colorClass: "text-emerald-500", bgClass: "bg-emerald-50" },
          { label: "Total Refunds", value: `₹${stats.totalRefunds.toLocaleString()}`, icon: <FiTrendingDown size={20} />, colorClass: "text-indigo-500", bgClass: "bg-indigo-50" },
          { label: "Pending COD", value: stats.pending, icon: <FiClock size={20} />, colorClass: "text-amber-500", bgClass: "bg-amber-50" },
          { label: "Failed Payments", value: stats.failed, icon: <FiXCircle size={20} />, colorClass: "text-rose-500", bgClass: "bg-rose-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/10 shadow-xs flex gap-4 items-center">
            <div className={`w-11 h-11 ${s.bgClass} rounded-xl flex items-center justify-center ${s.colorClass} shrink-0`}>
              {s.icon}
            </div>
            <div>
              <div className="text-xl font-extrabold text-gray-900 dark:text-white">{s.value}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 shadow-xs p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Search by transaction ID, customer, order..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#f5f6f4] dark:bg-white/10 border border-gray-200/50 dark:border-white/10 rounded-lg text-sm outline-none text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-[#f5f6f4] dark:bg-white/10 border border-gray-200/50 dark:border-white/10 rounded-lg text-sm outline-none text-gray-700 dark:text-gray-200 cursor-pointer"
        >
          <option value="All">All Status</option>
          <option value="Success">Success</option>
          <option value="Collected">COD Collected</option>
          <option value="Refunded">Refunded</option>
          <option value="Failed">Failed</option>
          <option value="Pending">Pending</option>
        </select>
        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="px-3 py-2 bg-[#f5f6f4] dark:bg-white/10 border border-gray-200/50 dark:border-white/10 rounded-lg text-sm outline-none text-gray-700 dark:text-gray-200 cursor-pointer"
        >
          <option value="All">All Methods</option>
          <option value="Razorpay">Razorpay</option>
          <option value="COD">COD</option>
        </select>
        <button className="flex items-center gap-1.5 px-3.5 py-2 bg-[#f5f6f4] dark:bg-white/10 border border-gray-200/50 dark:border-white/10 rounded-lg text-sm font-semibold text-indigo-600 dark:text-indigo-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/20 transition-colors">
          <FiDownload size={14} /> Export
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-white/10 bg-[#fafbf9] dark:bg-white/5">
                {["Transaction ID", "Order", "Customer", "Amount", "Method", "Status", "Type", "Date"].map((h) => (
                  <th key={h} className="px-4 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {filtered.map((t) => {
                const style = STATUS_STYLES[t.status] || STATUS_STYLES.Pending;
                return (
                  <tr key={t.id} className="hover:bg-[#fafbf9] dark:hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-gray-900 dark:text-white text-xs">{t.id}</div>
                      {t.razorpayId && <div className="text-[10px] text-gray-400 mt-0.5">{t.razorpayId}</div>}
                    </td>
                    <td className="px-4 py-3.5 text-indigo-600 dark:text-indigo-400 font-semibold">{t.orderId}</td>
                    <td className="px-4 py-3.5 text-gray-700 dark:text-gray-300">{t.customer}</td>
                    <td className="px-4 py-3.5 font-bold text-gray-900 dark:text-white">₹{t.amount.toLocaleString()}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold ${t.method === "COD" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-indigo-50 text-indigo-700 border border-indigo-200"}`}>
                        {t.method}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, background: style.bg, color: style.color, border: `1px solid ${style.border}` }}>
                        {t.status}
                      </span>
                    </td>
                    <td className={`px-4 py-3.5 font-semibold text-xs ${t.type === "Refund" ? "text-indigo-600 dark:text-indigo-400" : "text-gray-700 dark:text-gray-300"}`}>{t.type}</td>
                    <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400 text-xs">{formatDate(t.date)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-gray-400 text-xs">No transactions found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
