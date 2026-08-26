  import { useEffect, useState, useCallback } from "react";
  import { FiEye, FiSearch, FiX } from "react-icons/fi";

  const STATUS_STYLES = {
    Delivered: "bg-green-100 text-green-700",
    Shipped: "bg-blue-100 text-blue-700",
    Pending: "bg-yellow-100 text-yellow-700",
    Cancelled: "bg-red-100 text-red-700",
  };

  const TABS = ["All", "Pending", "Shipped", "Delivered", "Cancelled"];
  const STATUS_OPTIONS = ["Pending", "Shipped", "Delivered", "Cancelled"];
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  function formatDate(isoString) {
    return new Date(isoString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  export default function Orders() {
    const [activeTab, setActiveTab] = useState("All");
    const [search, setSearch] = useState("");
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderDetailLoading, setOrderDetailLoading] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);

    const getToken = () => localStorage.getItem("adminToken");

    const fetchOrders = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (activeTab !== "All") params.set("status", activeTab);
        if (search) params.set("search", search);

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
    }, [activeTab, search]);

    useEffect(() => {
      const timeout = setTimeout(fetchOrders, 300); // debounce search
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
    setUpdatingId(id);
    try {
      const res = await fetch(`${API_BASE}/api/orders/${id}/status`, {
        method: "PUT",   // <-- PATCH se PUT kiya
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
        if (!res.ok) throw new Error("Failed to update status.");

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

    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1a1a1a]">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage customer orders.</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-3 p-4 border-b border-gray-100">
            <div className="flex gap-2 flex-wrap">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    activeTab === tab
                      ? "bg-[#4CAF37] text-white"
                      : "bg-[#f5f6f4] text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 bg-[#f5f6f4] rounded-md px-3 py-2 w-full sm:w-64">
              <FiSearch className="text-gray-400" size={16} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search order ID or customer..."
                className="bg-transparent text-sm outline-none w-full placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100 bg-[#fafbf9]">
                  <th className="px-4 py-3 font-medium">Order ID</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Items</th>
                  <th className="px-4 py-3 font-medium">Payment</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-gray-400 text-sm">
                      Loading orders...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-red-500 text-sm">
                      {error}
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-gray-500 text-sm">
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-gray-50 last:border-0 hover:bg-[#fafbf9]"
                    >
                      <td className="px-4 py-3 font-medium text-[#1a1a1a]">
                        {order.order_number}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{order.customer_name}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{order.item_count}</td>
                      <td className="px-4 py-3 text-gray-600">{order.payment_method}</td>
                      <td className="px-4 py-3 text-gray-600">
                        ₹{Number(order.total_amount).toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={order.status}
                          disabled={updatingId === order.id}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          className={`px-2 py-1 rounded-full text-xs font-semibold border-0 outline-none cursor-pointer disabled:opacity-50 ${STATUS_STYLES[order.status]}`}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s} className="bg-white text-gray-700">
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => viewOrder(order.id)}
                          className="p-2 rounded-md text-gray-500 hover:text-[#4CAF37] hover:bg-[#4CAF37]/10"
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

        {/* Order detail modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setSelectedOrder(null)}
            />
            <div className="relative bg-white rounded-xl w-full max-w-lg p-6 z-10">
              <button
                onClick={() => setSelectedOrder(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-[#1a1a1a]"
              >
                <FiX size={20} />
              </button>

              {orderDetailLoading ? (
                <p className="text-sm text-gray-500 py-8 text-center">
                  Loading order details...
                </p>
              ) : (
                <>
                  <h2 className="text-lg font-extrabold text-[#1a1a1a]">
                    {selectedOrder.order_number}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedOrder.customer_name}
                    {selectedOrder.customer_email && ` · ${selectedOrder.customer_email}`}
                  </p>

                  <div className="flex items-center gap-2 mt-3">
                    <select
                      value={selectedOrder.status}
                      disabled={updatingId === selectedOrder.id}
                      onChange={(e) => updateStatus(selectedOrder.id, e.target.value)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold border-0 outline-none cursor-pointer disabled:opacity-50 ${STATUS_STYLES[selectedOrder.status]}`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s} className="bg-white text-gray-700">
                          {s}
                        </option>
                      ))}
                    </select>
                    <span className="text-xs text-gray-500">
                      {selectedOrder.payment_method}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDate(selectedOrder.created_at)}
                    </span>
                  </div>

                  <div className="mt-5 border-t border-gray-100 pt-4 space-y-3">
                    {selectedOrder.items?.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <div>
                          <p className="font-medium text-[#1a1a1a]">{item.product_name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <span className="font-semibold text-[#1a1a1a]">
                          ₹{Number(item.price * item.quantity).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
                    <span className="text-sm font-bold text-[#1a1a1a]">Total</span>
                    <span className="text-base font-extrabold text-[#1a1a1a]">
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