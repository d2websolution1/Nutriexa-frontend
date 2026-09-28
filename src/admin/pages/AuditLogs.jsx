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
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1a1a1a] dark:text-white flex items-center gap-2.5">
            <FiActivity size={24} className="text-indigo-600 dark:text-indigo-400" /> Audit Logs
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Complete history of all admin actions, logins, and system events.
          </p>
        </div>
        <button className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-white/10 border border-gray-200/60 dark:border-white/10 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 cursor-pointer shadow-xs hover:bg-gray-50 dark:hover:bg-white/20 transition-colors self-start sm:self-auto">
          <FiDownload size={14} /> Export CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {[
          { label: "Total Logged Events", value: stats.total, color: "text-indigo-600 dark:text-indigo-400" },
          { label: "Events Today", value: stats.today, color: "text-emerald-600 dark:text-emerald-400" },
          { label: "Failed Login Attempts", value: stats.failed, color: "text-rose-600 dark:text-rose-400" },
          { label: "Active Admin Users", value: stats.admins, color: "text-amber-600 dark:text-amber-400" },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/10 shadow-xs">
            <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 shadow-xs p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            placeholder="Search logs by action, user, details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#f5f6f4] dark:bg-white/10 border border-gray-200/50 dark:border-white/10 rounded-lg text-sm outline-none text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2 bg-[#f5f6f4] dark:bg-white/10 border border-gray-200/50 dark:border-white/10 rounded-lg text-sm outline-none text-gray-700 dark:text-gray-200 cursor-pointer"
        >
          <option value="All" className="bg-white dark:bg-zinc-900 text-gray-800 dark:text-white">All Actions</option>
          {Object.keys(ACTION_CONFIG).map((a) => (
            <option key={a} value={a} className="bg-white dark:bg-zinc-900 text-gray-800 dark:text-white">
              {ACTION_CONFIG[a].label}
            </option>
          ))}
        </select>
        <select
          value={actorFilter}
          onChange={(e) => setActorFilter(e.target.value)}
          className="px-3 py-2 bg-[#f5f6f4] dark:bg-white/10 border border-gray-200/50 dark:border-white/10 rounded-lg text-sm outline-none text-gray-700 dark:text-gray-200 cursor-pointer"
        >
          <option value="All" className="bg-white dark:bg-zinc-900 text-gray-800 dark:text-white">All Users</option>
          {uniqueActors.map((a) => (
            <option key={a} value={a} className="bg-white dark:bg-zinc-900 text-gray-800 dark:text-white">
              {a}
            </option>
          ))}
        </select>
      </div>

      {/* Log Timeline Table */}
      <div className="bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-white/10 bg-[#fafbf9] dark:bg-white/5">
                {["Action", "Performed By", "Details", "IP Address", "Timestamp"].map((h) => (
                  <th key={h} className="px-4 py-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {filtered.map((log) => {
                const conf = ACTION_CONFIG[log.action] || ACTION_CONFIG.LOGIN;
                return (
                  <tr key={log.id} className="hover:bg-[#fafbf9] dark:hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div
                          style={{ background: conf.bg, color: conf.color }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        >
                          {conf.icon}
                        </div>
                        <span style={{ color: conf.color }} className="font-semibold text-xs">
                          {conf.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-gray-900 dark:text-white text-xs">{log.actorName}</div>
                      <div className="text-[11px] text-gray-400 dark:text-gray-500">{log.actor}</div>
                    </td>
                    <td className="px-4 py-3.5 text-gray-700 dark:text-gray-300 max-w-sm text-xs leading-relaxed">
                      {log.details}
                    </td>
                    <td className="px-4 py-3.5">
                      <code className="text-[11px] text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded font-mono">
                        {log.ip}
                      </code>
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                      {formatDateTime(log.timestamp)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-gray-400 text-xs">No log entries found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
