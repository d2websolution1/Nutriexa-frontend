import { useState } from "react";
import {
  FiActivity,
  FiSearch,
  FiFilter,
  FiDownload,
  FiUser,
  FiShoppingBag,
  FiSettings,
  FiBox,
  FiLayers,
  FiShield,
  FiTag,
  FiLogIn,
  FiLogOut,
  FiEdit2,
  FiTrash2,
  FiPlusCircle,
  FiAlertCircle,
} from "react-icons/fi";

const ACTION_CONFIG = {
  LOGIN: { icon: <FiLogIn size={14} />, color: "#10b981", bg: "#ecfdf5", label: "Login" },
  LOGOUT: { icon: <FiLogOut size={14} />, color: "#94a3b8", bg: "#f1f5f9", label: "Logout" },
  CREATE_PRODUCT: { icon: <FiPlusCircle size={14} />, color: "#6366f1", bg: "#eef2ff", label: "Created Product" },
  UPDATE_PRODUCT: { icon: <FiEdit2 size={14} />, color: "#f59e0b", bg: "#fffbeb", label: "Updated Product" },
  DELETE_PRODUCT: { icon: <FiTrash2 size={14} />, color: "#ef4444", bg: "#fef2f2", label: "Deleted Product" },
  UPDATE_ORDER: { icon: <FiShoppingBag size={14} />, color: "#6366f1", bg: "#eef2ff", label: "Updated Order" },
  CREATE_STAFF: { icon: <FiUser size={14} />, color: "#8b5cf6", bg: "#f5f3ff", label: "Created Staff" },
  UPDATE_SETTINGS: { icon: <FiSettings size={14} />, color: "#06b6d4", bg: "#ecfeff", label: "Updated Settings" },
  CREATE_CATEGORY: { icon: <FiLayers size={14} />, color: "#10b981", bg: "#ecfdf5", label: "Created Category" },
  CREATE_COUPON: { icon: <FiTag size={14} />, color: "#f59e0b", bg: "#fffbeb", label: "Created Coupon" },
  FAILED_LOGIN: { icon: <FiAlertCircle size={14} />, color: "#ef4444", bg: "#fef2f2", label: "Failed Login" },
};

const MOCK_LOGS = [
  {
    id: 1,
    action: "UPDATE_ORDER",
    actor: "admin@nutriexa.com",
    actorName: "Super Admin",
    details: "Changed status of Order #ORD-1045 from 'Pending' to 'Processing'.",
    ip: "192.168.1.101",
    timestamp: "2024-05-18T10:35:00Z",
  },
  {
    id: 2,
    action: "CREATE_PRODUCT",
    actor: "manager@nutriexa.com",
    actorName: "Store Manager",
    details: "Created new product 'Creatine Monohydrate 500g' (SKU: NX-CREA-0012).",
    ip: "192.168.1.105",
    timestamp: "2024-05-18T10:10:00Z",
  },
  {
    id: 3,
    action: "LOGIN",
    actor: "admin@nutriexa.com",
    actorName: "Super Admin",
    details: "Successful admin login.",
    ip: "192.168.1.101",
    timestamp: "2024-05-18T09:58:00Z",
  },
  {
    id: 4,
    action: "DELETE_PRODUCT",
    actor: "admin@nutriexa.com",
    actorName: "Super Admin",
    details: "Deleted product 'Old Pre-Workout Formula' (SKU: NX-PRWO-0003).",
    ip: "192.168.1.101",
    timestamp: "2024-05-17T17:30:00Z",
  },
  {
    id: 5,
    action: "CREATE_STAFF",
    actor: "admin@nutriexa.com",
    actorName: "Super Admin",
    details: "Created new staff account for 'Ravi Kumar' with role Manager.",
    ip: "192.168.1.101",
    timestamp: "2024-05-17T15:15:00Z",
  },
  {
    id: 6,
    action: "UPDATE_PRODUCT",
    actor: "manager@nutriexa.com",
    actorName: "Store Manager",
    details: "Updated price of 'Nitro Tech Whey Protein' from ₹2,299 to ₹2,499.",
    ip: "192.168.1.105",
    timestamp: "2024-05-17T14:45:00Z",
  },
  {
    id: 7,
    action: "CREATE_COUPON",
    actor: "admin@nutriexa.com",
    actorName: "Super Admin",
    details: "Created discount coupon 'SUMMER20' with 20% off.",
    ip: "192.168.1.101",
    timestamp: "2024-05-17T12:00:00Z",
  },
  {
    id: 8,
    action: "FAILED_LOGIN",
    actor: "unknown@test.com",
    actorName: "Unknown",
    details: "Failed login attempt with email unknown@test.com.",
    ip: "45.33.12.87",
    timestamp: "2024-05-17T08:22:00Z",
  },
  {
    id: 9,
    action: "UPDATE_SETTINGS",
    actor: "admin@nutriexa.com",
    actorName: "Super Admin",
    details: "Updated free shipping threshold from ₹799 to ₹999.",
    ip: "192.168.1.101",
    timestamp: "2024-05-16T16:40:00Z",
  },
  {
    id: 10,
    action: "CREATE_CATEGORY",
    actor: "manager@nutriexa.com",
    actorName: "Store Manager",
    details: "Created new category 'Fat Burners' with slug 'fat-burners'.",
    ip: "192.168.1.105",
    timestamp: "2024-05-16T11:05:00Z",
  },
  {
    id: 11,
    action: "LOGOUT",
    actor: "manager@nutriexa.com",
    actorName: "Store Manager",
    details: "Admin logged out.",
    ip: "192.168.1.105",
    timestamp: "2024-05-15T18:00:00Z",
  },
  {
    id: 12,
    action: "UPDATE_ORDER",
    actor: "sales@nutriexa.com",
    actorName: "Sales Staff",
    details: "Changed status of Order #ORD-1039 from 'Processing' to 'Shipped'.",
    ip: "192.168.1.110",
    timestamp: "2024-05-14T13:30:00Z",
  },
];

function formatDateTime(iso) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

export default function AuditLogs() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("All");
  const [actorFilter, setActorFilter] = useState("All");

  const uniqueActors = [...new Set(MOCK_LOGS.map((l) => l.actor))];

  const filtered = MOCK_LOGS.filter((l) => {
    const q = search.toLowerCase();
    const matchSearch =
      l.details.toLowerCase().includes(q) ||
      l.actor.toLowerCase().includes(q) ||
      l.actorName.toLowerCase().includes(q);
    const matchAction = actionFilter === "All" || l.action === actionFilter;
    const matchActor = actorFilter === "All" || l.actor === actorFilter;
    return matchSearch && matchAction && matchActor;
  });

  const stats = {
    total: MOCK_LOGS.length,
    today: MOCK_LOGS.filter((l) => new Date(l.timestamp).toDateString() === new Date("2024-05-18").toDateString()).length,
    failed: MOCK_LOGS.filter((l) => l.action === "FAILED_LOGIN").length,
    admins: uniqueActors.length,
  };

  return (
    <div style={{ padding: "24px", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
            <FiActivity size={22} style={{ color: "#6366f1" }} /> Audit Logs
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>
            Complete history of all admin actions, logins, and system events.
          </p>
        </div>
        <button style={{ padding: "10px 18px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", fontWeight: 600, fontSize: "13px", cursor: "pointer", color: "#6366f1", display: "flex", alignItems: "center", gap: "6px" }}>
          <FiDownload size={14} /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Total Logged Events", value: stats.total, color: "#6366f1" },
          { label: "Events Today", value: stats.today, color: "#10b981" },
          { label: "Failed Login Attempts", value: stats.failed, color: "#ef4444" },
          { label: "Active Admin Users", value: stats.admins, color: "#f59e0b" },
        ].map((s) => (
          <div key={s.label} style={{ background: "#fff", borderRadius: "12px", padding: "20px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: "28px", fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: "#fff", borderRadius: "12px", padding: "16px 20px", border: "1px solid #e2e8f0", marginBottom: "20px", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
          <FiSearch size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "9px 12px 9px 36px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
          />
        </div>
        <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}
          style={{ padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none" }}>
          <option value="All">All Actions</option>
          {Object.keys(ACTION_CONFIG).map((a) => (
            <option key={a} value={a}>{ACTION_CONFIG[a].label}</option>
          ))}
        </select>
        <select value={actorFilter} onChange={(e) => setActorFilter(e.target.value)}
          style={{ padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none" }}>
          <option value="All">All Users</option>
          {uniqueActors.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {/* Log Timeline */}
      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              {["Action", "Performed By", "Details", "IP Address", "Timestamp"].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "13px" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((log) => {
              const conf = ACTION_CONFIG[log.action] || ACTION_CONFIG.LOGIN;
              return (
                <tr key={log.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "30px", height: "30px", background: conf.bg, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: conf.color, flexShrink: 0 }}>
                        {conf.icon}
                      </div>
                      <span style={{ fontWeight: 600, fontSize: "13px", color: conf.color }}>{conf.label}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ fontWeight: 600, color: "#0f172a", fontSize: "13px" }}>{log.actorName}</div>
                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>{log.actor}</div>
                  </td>
                  <td style={{ padding: "14px 16px", color: "#374151", fontSize: "13px", maxWidth: "320px", lineHeight: "1.5" }}>
                    {log.details}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <code style={{ fontSize: "12px", color: "#64748b", background: "#f1f5f9", padding: "3px 8px", borderRadius: "5px" }}>
                      {log.ip}
                    </code>
                  </td>
                  <td style={{ padding: "14px 16px", color: "#64748b", fontSize: "12px", whiteSpace: "nowrap" }}>
                    {formatDateTime(log.timestamp)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>No log entries found.</div>
        )}
      </div>
    </div>
  );
}
