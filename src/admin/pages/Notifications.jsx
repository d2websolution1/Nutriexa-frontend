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
  FiLayers,
  FiCheckCircle,
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
  order: {
    icon: <FiShoppingBag size={16} />,
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-950/60",
    label: "Orders",
  },
  user: {
    icon: <FiUserPlus size={16} />,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/60",
    label: "Customers",
  },
  stock: {
    icon: <FiAlertTriangle size={16} />,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/60",
    label: "Inventory",
  },
  review: {
    icon: <FiBell size={16} />,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/60",
    label: "Reviews",
  },
  payment: {
    icon: <FiMail size={16} />,
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-950/60",
    label: "Payments",
  },
};

function formatRelativeTime(iso) {
  if (!iso) return "recently";
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
    const matchRead =
      filterRead === "All"
        ? true
        : filterRead === "Unread"
        ? !n.isRead
        : n.isRead;
    return matchType && matchRead;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  function markRead(id) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
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

  const categoryCounts = {
    All: notifications.length,
    order: notifications.filter((n) => n.type === "order").length,
    user: notifications.filter((n) => n.type === "user").length,
    stock: notifications.filter((n) => n.type === "stock").length,
    review: notifications.filter((n) => n.type === "review").length,
    payment: notifications.filter((n) => n.type === "payment").length,
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1a1a1a] dark:text-white flex items-center gap-2.5">
            <span>Notifications</span>
            {unreadCount > 0 ? (
              <span className="bg-rose-500 text-white text-xs px-2.5 py-0.5 rounded-full font-bold shadow-xs animate-pulse">
                {unreadCount} unread
              </span>
            ) : (
              <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                All caught up ✓
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Order alerts, customer activities, inventory warnings, and system events.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer shadow-xs hover:bg-gray-50 dark:hover:bg-white/20 transition-all self-start sm:self-auto"
          >
            <FiCheck size={14} /> Mark All as Read
          </button>
        )}
      </div>

      {/* MODERN INTERACTIVE CATEGORY TABS (TASK 3 HIGHLIGHT & EFFECTS) */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Main Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-wrap">
            {[
              { id: "All", label: "All Types", icon: <FiLayers size={14} /> },
              { id: "order", label: "Orders", icon: <FiShoppingBag size={14} /> },
              { id: "user", label: "Customers", icon: <FiUserPlus size={14} /> },
              { id: "stock", label: "Inventory", icon: <FiAlertTriangle size={14} /> },
              { id: "review", label: "Reviews", icon: <FiBell size={14} /> },
              { id: "payment", label: "Payments", icon: <FiMail size={14} /> },
            ].map((tab) => {
              const isActive = filterType === tab.id;
              const count = categoryCounts[tab.id] || 0;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilterType(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/30 scale-102 ring-2 ring-indigo-400/30"
                      : "bg-white dark:bg-white/5 border border-gray-200/80 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 hover:scale-102"
                  }`}
                >
                  <span className={isActive ? "text-white" : "text-gray-400 dark:text-gray-400"}>
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                      isActive
                        ? "bg-indigo-700 text-white"
                        : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Status Toggle Pills */}
          <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-white/10 p-1 rounded-xl shrink-0 self-start sm:self-auto border border-gray-200/50 dark:border-white/10">
            {[
              { id: "All", label: "All" },
              { id: "Unread", label: `Unread (${unreadCount})` },
              { id: "Read", label: "Read" },
            ].map((st) => {
              const isSelected = filterRead === st.id;
              return (
                <button
                  key={st.id}
                  onClick={() => setFilterRead(st.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? "bg-white dark:bg-[#111722] text-gray-900 dark:text-white shadow-xs scale-102"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
                  }`}
                >
                  {st.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        {/* Notifications Feed */}
        <div>
          <div className="flex flex-col gap-3">
            {filtered.map((n) => {
              const conf = TYPE_CONFIG[n.type] || TYPE_CONFIG.order;
              return (
                <div
                  key={n.id}
                  className={`p-4 rounded-2xl border flex gap-3.5 items-start transition-all shadow-xs ${
                    n.isRead
                      ? "bg-white dark:bg-[#111722] border-gray-100 dark:border-white/10"
                      : "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/50 ring-1 ring-indigo-500/10"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${conf.bg} ${conf.color}`}
                  >
                    {conf.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                          {conf.label}
                        </span>
                        <h4
                          className={`text-sm ${
                            n.isRead
                              ? "font-semibold text-gray-800 dark:text-gray-200"
                              : "font-black text-gray-900 dark:text-white"
                          }`}
                        >
                          {n.title}
                        </h4>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
                        )}
                      </div>

                      <div className="text-[11px] font-medium text-gray-400 dark:text-gray-500 shrink-0">
                        {formatRelativeTime(n.timestamp)}
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                      {n.message}
                    </p>

                    {!n.isRead && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => markRead(n.id)}
                          className="px-3 py-1 border border-indigo-200 dark:border-indigo-700/60 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 cursor-pointer transition-colors"
                        >
                          ✓ Mark as Read
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => deleteNotification(n.id)}
                    className="text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-1.5 rounded-lg cursor-pointer transition-colors"
                    title="Delete notification"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="p-12 text-center text-gray-400 dark:text-gray-500 bg-white dark:bg-[#111722] rounded-2xl border border-gray-100 dark:border-white/10 text-xs">
                No notifications in this category.
              </div>
            )}
          </div>
        </div>

        {/* Broadcast Panel */}
        <div>
          <div className="bg-white dark:bg-[#111722] rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs p-5 sticky top-20">
            <h3 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
              <FiRadio size={16} className="text-indigo-600 dark:text-indigo-400" /> Broadcast Notification
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
              Send an instant promotional announcement or alert to your customers.
            </p>

            {broadcastSent && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold mb-4 flex items-center gap-2">
                <FiCheckCircle size={15} /> Broadcast message sent successfully!
              </div>
            )}

            <div className="mb-3.5">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Channel
              </label>
              <select
                value={broadcastChannel}
                onChange={(e) => setBroadcastChannel(e.target.value)}
                className="w-full border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 rounded-xl px-3 py-2 text-xs text-gray-800 dark:text-white outline-none cursor-pointer focus:border-indigo-500"
              >
                <option value="Email" className="bg-white dark:bg-[#111722] text-gray-800 dark:text-white">Email</option>
                <option value="SMS" className="bg-white dark:bg-[#111722] text-gray-800 dark:text-white">SMS</option>
                <option value="Push Notification" className="bg-white dark:bg-[#111722] text-gray-800 dark:text-white">Push Notification</option>
                <option value="All Channels" className="bg-white dark:bg-[#111722] text-gray-800 dark:text-white">All Channels</option>
              </select>
            </div>

            <div className="mb-3.5">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Subject / Title
              </label>
              <input
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="e.g. Flash Sale: 40% OFF Today!"
                className="w-full border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 rounded-xl px-3 py-2 text-xs text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:border-indigo-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Message
              </label>
              <textarea
                rows={4}
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Write your broadcast message here..."
                className="w-full border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 rounded-xl px-3 py-2 text-xs text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <button
              onClick={sendBroadcast}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <FiSend size={14} /> Send Broadcast
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
