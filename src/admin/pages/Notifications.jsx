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
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
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
    <div style={{ padding: "24px", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
            Notifications
            {unreadCount > 0 && (
              <span style={{ padding: "2px 10px", background: "#ef4444", color: "#fff", borderRadius: "20px", fontSize: "13px", fontWeight: 700 }}>
                {unreadCount}
              </span>
            )}
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>
            Order alerts, stock warnings, and system events.
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead}
            style={{ padding: "9px 18px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", fontWeight: 600, fontSize: "13px", cursor: "pointer", color: "#6366f1", display: "flex", alignItems: "center", gap: "6px" }}>
            <FiCheck size={14} /> Mark All Read
          </button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "20px" }}>
        {/* Notifications Feed */}
        <div>
          {/* Filters */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
              style={{ padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", background: "#fff" }}>
              <option value="All">All Types</option>
              <option value="order">Orders</option>
              <option value="user">Customers</option>
              <option value="stock">Inventory</option>
              <option value="review">Reviews</option>
              <option value="payment">Payments</option>
            </select>
            <select value={filterRead} onChange={(e) => setFilterRead(e.target.value)}
              style={{ padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", background: "#fff" }}>
              <option value="All">All</option>
              <option value="Unread">Unread Only</option>
              <option value="Read">Read</option>
            </select>
          </div>

          {/* Notification list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {filtered.map((n) => {
              const conf = TYPE_CONFIG[n.type] || TYPE_CONFIG.order;
              return (
                <div key={n.id} style={{
                  background: n.isRead ? "#fff" : "#fafbff",
                  borderRadius: "12px",
                  border: `1px solid ${n.isRead ? "#e2e8f0" : "#c7d2fe"}`,
                  padding: "16px",
                  display: "flex",
                  gap: "14px",
                  alignItems: "flex-start",
                  transition: "all 0.15s"
                }}>
                  <div style={{ width: "38px", height: "38px", background: conf.bg, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: conf.color, flexShrink: 0 }}>
                    {conf.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontWeight: n.isRead ? 500 : 700, color: "#0f172a", fontSize: "14px" }}>{n.title}</div>
                      <div style={{ fontSize: "12px", color: "#94a3b8", flexShrink: 0, marginLeft: "8px" }}>{formatRelativeTime(n.timestamp)}</div>
                    </div>
                    <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px", lineHeight: "1.5" }}>{n.message}</div>
                    {!n.isRead && (
                      <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                        <button onClick={() => markRead(n.id)}
                          style={{ padding: "4px 12px", border: "1px solid #c7d2fe", borderRadius: "6px", background: "#eef2ff", color: "#6366f1", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                          Mark as Read
                        </button>
                      </div>
                    )}
                  </div>
                  <button onClick={() => deleteNotification(n.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: "4px" }}>
                    <FiTrash2 size={14} />
                  </button>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8", background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                No notifications found.
              </div>
            )}
          </div>
        </div>

        {/* Broadcast Panel */}
        <div>
          <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "24px" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
              <FiRadio size={16} style={{ color: "#6366f1" }} /> Broadcast Notification
            </h3>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px", lineHeight: "1.5" }}>
              Send a promotional or important message to all customers.
            </p>

            {broadcastSent && (
              <div style={{ padding: "10px 14px", background: "#ecfdf5", color: "#10b981", borderRadius: "8px", fontSize: "13px", fontWeight: 600, marginBottom: "16px" }}>
                ✓ Broadcast sent successfully!
              </div>
            )}

            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Channel</label>
              <select value={broadcastChannel} onChange={(e) => setBroadcastChannel(e.target.value)}
                style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none" }}>
                <option>Email</option>
                <option>SMS</option>
                <option>Push Notification</option>
                <option>All Channels</option>
              </select>
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Subject / Title</label>
              <input
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="e.g. Flash Sale: 40% OFF Today!"
                style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Message</label>
              <textarea
                rows={4}
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Write your broadcast message here..."
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }}
              />
            </div>

            <button onClick={sendBroadcast}
              style={{ width: "100%", padding: "11px", background: "#6366f1", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <FiSend size={15} /> Send Broadcast
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
