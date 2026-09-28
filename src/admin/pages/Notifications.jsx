import { useState } from "react";
import {
  FiBell,
  FiShoppingBag,
  FiUserPlus,
  FiAlertTriangle,
  FiMail,
  FiMessageSquare,
  FiSend,
  FiCheck,
  FiTrash2,
  FiFilter,
  FiRefreshCw,
  FiRadio,
} from "react-icons/fi";

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    type: "order",
    title: "New Order Received",
    message: "Order #ORD-1045 placed by Rahul Sharma for ₹2,499.",
    isRead: false,
    timestamp: "2024-05-18T10:30:00Z",
  },
  {
    id: 2,
    type: "user",
    title: "New Customer Registered",
    message: "Priya Singh (priya@example.com) just created an account.",
    isRead: false,
    timestamp: "2024-05-17T14:20:00Z",
  },
  {
    id: 3,
    type: "stock",
    title: "Low Stock Alert",
    message: "Nitro Tech Whey Protein (Chocolate) is low on stock — only 3 units left.",
    isRead: true,
    timestamp: "2024-05-16T09:15:00Z",
  },
  {
    id: 4,
    type: "order",
    title: "Order Cancelled",
    message: "Order #ORD-1040 was cancelled by customer Deepika Nair.",
    isRead: true,
    timestamp: "2024-05-15T16:00:00Z",
  },
  {
    id: 5,
    type: "review",
    title: "New Review Pending",
    message: "Vikram Kumar left a 5-star review on Omega-3 Fish Oil — needs approval.",
    isRead: false,
    timestamp: "2024-05-15T11:30:00Z",
  },
  {
    id: 6,
    type: "payment",
    title: "Payment Failed",
    message: "Order #ORD-1041 payment of ₹4,500 failed via Razorpay.",
    isRead: true,
    timestamp: "2024-05-15T11:20:00Z",
  },
  {
    id: 7,
    type: "stock",
    title: "Out of Stock",
    message: "Mass Gainer Pro (Vanilla) is now completely out of stock.",
    isRead: false,
    timestamp: "2024-05-14T08:45:00Z",
  },
];

const TYPE_CONFIG = {
  order: { icon: <FiShoppingBag size={16} />, color: "#6366f1", bg: "#eef2ff", label: "Order" },
  user: { icon: <FiUserPlus size={16} />, color: "#10b981", bg: "#ecfdf5", label: "Customer" },
  stock: { icon: <FiAlertTriangle size={16} />, color: "#f59e0b", bg: "#fffbeb", label: "Inventory" },
  review: { icon: <FiBell size={16} />, color: "#8b5cf6", bg: "#f5f3ff", label: "Review" },
  payment: { icon: <FiMail size={16} />, color: "#ef4444", bg: "#fef2f2", label: "Payment" },
};

function formatRelativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [filterType, setFilterType] = useState("All");
  const [filterRead, setFilterRead] = useState("All");

  // Broadcast notification state
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastChannel, setBroadcastChannel] = useState("Email");
  const [broadcastSent, setBroadcastSent] = useState(false);

  const filtered = notifications.filter((n) => {
    const matchType = filterType === "All" || n.type === filterType;
    const matchRead = filterRead === "All" || (filterRead === "Unread" ? !n.isRead : n.isRead);
    return matchType && matchRead;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  function markRead(id) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  function deleteNotification(id) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  function sendBroadcast() {
    if (!broadcastTitle || !broadcastMessage) return;
    setBroadcastSent(true);
    setBroadcastTitle("");
    setBroadcastMessage("");
    setTimeout(() => setBroadcastSent(false), 3000);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1a1a1a] dark:text-white flex items-center gap-2.5">
            Notifications
            {unreadCount > 0 && (
              <span className="bg-rose-500 text-white text-xs px-2.5 py-0.5 rounded-full font-bold">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Order alerts, stock warnings, and system events.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-white/10 border border-gray-200/60 dark:border-white/10 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 cursor-pointer shadow-xs hover:bg-gray-50 dark:hover:bg-white/20 transition-colors self-start sm:self-auto"
          >
            <FiCheck size={14} /> Mark All Read
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        {/* Notifications Feed */}
        <div>
          {/* Filters */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-white/10 border border-gray-200/60 dark:border-white/10 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-200 cursor-pointer shadow-xs outline-none"
            >
              <option value="All" className="bg-white dark:bg-zinc-900 text-gray-800 dark:text-white">All Types</option>
              <option value="order" className="bg-white dark:bg-zinc-900 text-gray-800 dark:text-white">Orders</option>
              <option value="user" className="bg-white dark:bg-zinc-900 text-gray-800 dark:text-white">Customers</option>
              <option value="stock" className="bg-white dark:bg-zinc-900 text-gray-800 dark:text-white">Inventory</option>
              <option value="review" className="bg-white dark:bg-zinc-900 text-gray-800 dark:text-white">Reviews</option>
              <option value="payment" className="bg-white dark:bg-zinc-900 text-gray-800 dark:text-white">Payments</option>
            </select>
            <select
              value={filterRead}
              onChange={(e) => setFilterRead(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-white/10 border border-gray-200/60 dark:border-white/10 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-200 cursor-pointer shadow-xs outline-none"
            >
              <option value="All" className="bg-white dark:bg-zinc-900 text-gray-800 dark:text-white">All</option>
              <option value="Unread" className="bg-white dark:bg-zinc-900 text-gray-800 dark:text-white">Unread Only</option>
              <option value="Read" className="bg-white dark:bg-zinc-900 text-gray-800 dark:text-white">Read</option>
            </select>
          </div>

          {/* Notification list */}
          <div className="flex flex-col gap-2.5">
            {filtered.map((n) => {
              const conf = TYPE_CONFIG[n.type] || TYPE_CONFIG.order;
              return (
                <div
                  key={n.id}
                  className={`p-4 rounded-xl border flex gap-3.5 items-start transition-all shadow-2xs ${
                    n.isRead
                      ? "bg-white dark:bg-white/5 border-gray-100 dark:border-white/10"
                      : "bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200/70 dark:border-indigo-800/40"
                  }`}
                >
                  <div
                    style={{ background: conf.bg, color: conf.color }}
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  >
                    {conf.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <div
                        className={`text-sm ${
                          n.isRead
                            ? "font-semibold text-gray-800 dark:text-gray-200"
                            : "font-extrabold text-gray-900 dark:text-white"
                        }`}
                      >
                        {n.title}
                      </div>
                      <div className="text-[11px] text-gray-400 shrink-0 ml-2">
                        {formatRelativeTime(n.timestamp)}
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                      {n.message}
                    </div>
                    {!n.isRead && (
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => markRead(n.id)}
                          className="px-2.5 py-1 border border-indigo-200 dark:border-indigo-700/50 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 cursor-pointer"
                        >
                          Mark as Read
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => deleteNotification(n.id)}
                    className="text-gray-400 hover:text-rose-500 p-1 cursor-pointer transition-colors"
                    title="Delete notification"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="p-10 text-center text-gray-400 dark:text-gray-500 bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 text-xs">
                No notifications found.
              </div>
            )}
          </div>
        </div>

        {/* Broadcast Panel */}
        <div>
          <div className="bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 shadow-xs p-5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
              <FiRadio size={16} className="text-indigo-600 dark:text-indigo-400" /> Broadcast Notification
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
              Send a promotional or important message to all customers.
            </p>

            {broadcastSent && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 rounded-lg text-xs font-bold mb-4">
                ✓ Broadcast sent successfully!
              </div>
            )}

            <div className="mb-3.5">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Channel
              </label>
              <select
                value={broadcastChannel}
                onChange={(e) => setBroadcastChannel(e.target.value)}
                className="w-full border border-gray-200 dark:border-white/10 bg-[#f5f6f4] dark:bg-white/10 rounded-lg px-3 py-2 text-xs text-gray-800 dark:text-white outline-none cursor-pointer"
              >
                <option value="Email" className="bg-white dark:bg-zinc-900 text-gray-800 dark:text-white">Email</option>
                <option value="SMS" className="bg-white dark:bg-zinc-900 text-gray-800 dark:text-white">SMS</option>
                <option value="Push Notification" className="bg-white dark:bg-zinc-900 text-gray-800 dark:text-white">Push Notification</option>
                <option value="All Channels" className="bg-white dark:bg-zinc-900 text-gray-800 dark:text-white">All Channels</option>
              </select>
            </div>

            <div className="mb-3.5">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Subject / Title
              </label>
              <input
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="e.g. Flash Sale: 40% OFF Today!"
                className="w-full border border-gray-200 dark:border-white/10 bg-[#f5f6f4] dark:bg-white/10 rounded-lg px-3 py-2 text-xs text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:border-indigo-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Message
              </label>
              <textarea
                rows={4}
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Write your broadcast message here..."
                className="w-full border border-gray-200 dark:border-white/10 bg-[#f5f6f4] dark:bg-white/10 rounded-lg px-3 py-2 text-xs text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:border-indigo-500 resize-none font-inherit"
              />
            </div>

            <button
              onClick={sendBroadcast}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <FiSend size={14} /> Send Broadcast
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
