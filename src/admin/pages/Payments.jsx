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
    <div style={{ padding: "24px", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#0f172a", margin: 0 }}>Payments</h1>
        <p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>
          Transaction logs, refunds, and payment gateway activity.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: <FiTrendingUp size={20} />, color: "#10b981", bg: "#ecfdf5" },
          { label: "Total Refunds", value: `₹${stats.totalRefunds.toLocaleString()}`, icon: <FiTrendingDown size={20} />, color: "#6366f1", bg: "#eef2ff" },
          { label: "Pending COD", value: stats.pending, icon: <FiClock size={20} />, color: "#f59e0b", bg: "#fffbeb" },
          { label: "Failed Payments", value: stats.failed, icon: <FiXCircle size={20} />, color: "#ef4444", bg: "#fef2f2" },
        ].map((s) => (
          <div key={s.label} style={{ background: "#fff", borderRadius: "12px", padding: "20px", border: "1px solid #e2e8f0", display: "flex", gap: "16px", alignItems: "center" }}>
            <div style={{ width: "44px", height: "44px", background: s.bg, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: s.color, flexShrink: 0 }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a" }}>{s.value}</div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: "#fff", borderRadius: "12px", padding: "16px 20px", border: "1px solid #e2e8f0", marginBottom: "20px", display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
          <FiSearch size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            placeholder="Search by transaction ID, customer, order..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "9px 12px 9px 36px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none" }}>
          <option value="All">All Status</option>
          <option value="Success">Success</option>
          <option value="Collected">COD Collected</option>
          <option value="Refunded">Refunded</option>
          <option value="Failed">Failed</option>
          <option value="Pending">Pending</option>
        </select>
        <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)}
          style={{ padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none" }}>
          <option value="All">All Methods</option>
          <option value="Razorpay">Razorpay</option>
          <option value="COD">COD</option>
        </select>
        <button style={{ padding: "9px 16px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", fontSize: "14px", cursor: "pointer", color: "#6366f1", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
          <FiDownload size={14} /> Export
        </button>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              {["Transaction ID", "Order", "Customer", "Amount", "Method", "Status", "Type", "Date"].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "13px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => {
              const style = STATUS_STYLES[t.status] || STATUS_STYLES.Pending;
              return (
                <tr key={t.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ fontWeight: 600, color: "#0f172a", fontSize: "13px" }}>{t.id}</div>
                    {t.razorpayId && <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>{t.razorpayId}</div>}
                  </td>
                  <td style={{ padding: "14px 16px", color: "#6366f1", fontWeight: 600 }}>{t.orderId}</td>
                  <td style={{ padding: "14px 16px", color: "#374151" }}>{t.customer}</td>
                  <td style={{ padding: "14px 16px", fontWeight: 700, color: "#0f172a" }}>₹{t.amount.toLocaleString()}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 500, background: t.method === "COD" ? "#f0fdf4" : "#eef2ff", color: t.method === "COD" ? "#16a34a" : "#6366f1" }}>
                      {t.method}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 500, background: style.bg, color: style.color, border: `1px solid ${style.border}` }}>
                      {t.status}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px", color: t.type === "Refund" ? "#6366f1" : "#374151", fontWeight: 500 }}>{t.type}</td>
                  <td style={{ padding: "14px 16px", color: "#64748b", fontSize: "13px" }}>{formatDate(t.date)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>No transactions found.</div>
        )}
      </div>
    </div>
  );
}
