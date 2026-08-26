import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiPackage,
  FiTruck,
  FiClock,
  FiCheckCircle,
  FiChevronRight,
  FiShoppingBag,
  FiArrowRight,
  FiLogIn,
  FiSearch,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const STATUS_COLORS = {
  Delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Shipped: "bg-blue-50 text-blue-700 border-blue-200",
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Cancelled: "bg-red-50 text-red-700 border-red-200",
};

export default function MyOrders() {
  const { user, isUserAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [trackInput, setTrackInput] = useState("");

  const token = localStorage.getItem("userToken");

  useEffect(() => {
    if (!token || token === "null" || token === "undefined") {
      setNeedsAuth(true);
      setLoading(false);
      return;
    }

    const fetchMyOrders = async () => {
      setLoading(true);
      setError(null);
      setNeedsAuth(false);

      try {
        const res = await fetch(`${API_BASE}/api/users/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          if (res.status === 401 || data.requireAuth) {
            setNeedsAuth(true);
            return;
          }
          throw new Error(data.message || "Failed to load your orders.");
        }

        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Could not retrieve order history.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, [token]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (trackInput.trim()) {
      navigate(`/track-order?order=${encodeURIComponent(trackInput.trim().replace("#", ""))}`);
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-4 md:px-8 py-10 min-h-[75vh]">
      {/* Header breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
        <Link to="/" className="hover:text-[#4CAF37]">Home</Link>
        <FiChevronRight size={12} />
        <span className="text-[#1a1a1a] font-medium">My Orders</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1a1a1a] tracking-tight">
            Order History
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track and view details of your past purchases
          </p>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-[#4CAF37] text-white text-xs font-semibold px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity w-fit shadow-sm"
        >
          <FiShoppingBag size={15} /> Continue Shopping
        </Link>
      </div>

      {/* Case 1: Not Logged In Prompt */}
      {needsAuth ? (
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-10 sm:p-14 text-center shadow-sm max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#4CAF37]/10 flex items-center justify-center mx-auto mb-4 text-[#4CAF37]">
              <FiLogIn size={28} />
            </div>
            <h2 className="text-xl font-bold text-[#1a1a1a]">Please Log In to View Orders</h2>
            <p className="text-sm text-gray-500 mt-2 mb-6 leading-relaxed">
              Log in to your Nutriexa account to check order statuses, invoices, and live delivery updates.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#4CAF37] hover:bg-[#439e30] text-white font-bold text-sm px-6 py-2.5 rounded-lg transition-colors shadow-sm"
              >
                <FiLogIn size={16} /> Log In Now
              </Link>
              <Link
                to="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-[#1a1a1a] font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors"
              >
                Create Account
              </Link>
            </div>
          </div>

          {/* Quick Track Order Option for Guest Checkout */}
          <div className="bg-[#fafbf9] border border-gray-100 rounded-2xl p-6 sm:p-8 max-w-lg mx-auto text-center">
            <h3 className="text-sm font-bold text-[#1a1a1a] flex items-center justify-center gap-2">
              <FiTruck className="text-[#4CAF37]" size={18} /> Looking for a guest order?
            </h3>
            <p className="text-xs text-gray-500 mt-1 mb-4">
              Enter your Order Number to check real-time delivery status without logging in.
            </p>
            <form onSubmit={handleTrackSubmit} className="flex gap-2">
              <input
                type="text"
                value={trackInput}
                onChange={(e) => setTrackInput(e.target.value)}
                placeholder="e.g. NX2906"
                className="flex-1 border border-gray-200 rounded-lg px-3.5 py-2 text-xs outline-none focus:border-[#4CAF37] bg-white uppercase"
              />
              <button
                type="submit"
                disabled={!trackInput.trim()}
                className="bg-[#1a1a1a] hover:bg-[#333] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-40"
              >
                Track
              </button>
            </form>
          </div>
        </div>
      ) : loading ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center shadow-sm">
          <div className="w-10 h-10 border-3 border-[#4CAF37] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500 font-medium">Fetching your order history...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-6 text-center">
          <p className="font-semibold mb-1">Unable to load orders</p>
          <p className="text-xs mb-3">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-xs bg-red-600 text-white font-semibold px-4 py-1.5 rounded-md hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center shadow-sm max-w-lg mx-auto">
          <div className="w-20 h-20 rounded-full bg-[#f4f7f2] flex items-center justify-center mx-auto mb-5 text-[#4CAF37]">
            <FiPackage size={36} />
          </div>
          <h3 className="text-lg font-bold text-[#1a1a1a]">No orders placed yet</h3>
          <p className="text-sm text-gray-500 mt-2 mb-6 leading-relaxed">
            You haven't ordered any supplements or nutrition essentials yet. Explore our top products and start your fitness journey!
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-[#4CAF37] text-white font-semibold text-sm px-6 py-3 rounded-lg hover:opacity-90 transition-all shadow-md"
          >
            Browse Products <FiArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const statusClass =
              STATUS_COLORS[order.status] || "bg-gray-100 text-gray-700 border-gray-200";

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Order Top Bar */}
                <div className="bg-[#fafbf9] px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-extrabold text-sm text-[#1a1a1a]">
                      Order {order.order_number}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusClass}`}
                    >
                      {order.status}
                    </span>
                    {order.payment_status && (
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          order.payment_status === "Paid"
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {order.payment_status === "Paid" ? "✓ Paid Online" : "COD Pending"}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 flex items-center gap-1.5">
                    <FiClock size={13} />
                    <span>{formatDate(order.created_at)}</span>
                  </div>
                </div>

                {/* Items and Details */}
                <div className="p-6">
                  <div className="divide-y divide-gray-100">
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#f7f8f6] border border-gray-100 flex items-center justify-center text-xs font-bold text-[#4CAF37] shrink-0">
                              {item.quantity}x
                            </div>
                            <div>
                              <p className="text-sm font-bold text-[#1a1a1a] line-clamp-1">
                                {item.product_name}
                              </p>
                              <p className="text-xs text-gray-500">
                                ₹{Number(item.price).toLocaleString("en-IN")} each
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-extrabold text-[#1a1a1a] shrink-0">
                            ₹{(Number(item.price) * Number(item.quantity)).toLocaleString("en-IN")}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500 py-2">Order items details recorded.</p>
                    )}
                  </div>

                  {/* Order Footer & Actions */}
                  <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Payment:</span>
                      <span className="text-xs font-bold text-gray-700 uppercase">
                        {order.payment_method === "Prepaid" ? "Razorpay (Online)" : "Cash on Delivery"}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-xs text-gray-500 block">Total Amount</span>
                        <span className="text-base font-extrabold text-[#1a1a1a]">
                          ₹{Number(order.total_amount).toLocaleString("en-IN")}
                        </span>
                      </div>

                      <Link
                        to={`/track-order?order=${encodeURIComponent(order.order_number.replace("#", ""))}`}
                        className="inline-flex items-center gap-1.5 bg-[#4CAF37]/10 text-[#4CAF37] hover:bg-[#4CAF37] hover:text-white transition-colors text-xs font-bold px-4 py-2.5 rounded-lg border border-[#4CAF37]/20"
                      >
                        <FiTruck size={14} /> Track Order
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
