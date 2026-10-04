import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FiPackage, FiCalendar, FiTruck, FiCheckCircle, FiClock } from "react-icons/fi";
import { API_URL as API_BASE } from "../config";

const STEPS = ["Order Placed", "Processing", "Shipped", "Delivered"];

// maps order status -> how many steps are completed
const STATUS_STEP_INDEX = {
  Pending: 0,
  Processing: 1,
  Shipped: 2,
  Delivered: 3,
  Cancelled: -1,
};

const STEP_ICONS = [FiPackage, FiClock, FiTruck, FiCheckCircle];

function formatDate(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get("order") || "");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [autoTracked, setAutoTracked] = useState(false);

  const trackOrder = async (e) => {
    e?.preventDefault();
    if (!orderId.trim()) return;
    setLoading(true);
    setError(null);
    setOrder(null);
    try {
      const res = await fetch(
        `${API_BASE}/api/orders/track/${encodeURIComponent(orderId.trim())}`
      );
      if (!res.ok) throw new Error("Order not found. Check your Order ID.");
      const data = await res.json();
      setOrder(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Auto-track if order ID is in URL
  if (searchParams.get("order") && !autoTracked && !order && !loading) {
    setAutoTracked(true);
    trackOrder();
  }

  const currentStep = order ? STATUS_STEP_INDEX[order.status] ?? 0 : -1;

  return (
    <main className="max-w-2xl mx-auto px-4 md:px-10 py-16 text-center">
      <h1 className="text-2xl font-extrabold text-[#1a1a1a]">Track Your Order</h1>
      <p className="text-gray-500 text-sm mt-2">Enter your Order ID to see live delivery status.</p>

      <form onSubmit={trackOrder} className="mt-8 flex gap-2 max-w-md mx-auto">
        <input
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="e.g. NX6279"
          className="flex-1 border border-gray-200 rounded-md px-4 py-3 text-base outline-none focus:border-[#4CAF37]"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-[#4CAF37] text-white font-semibold px-6 py-3 rounded-md hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "..." : "Track"}
        </button>
      </form>

      {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

      {order && (
        <div className="mt-10 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-left">
          {/* Order header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Order ID</p>
              <p className="text-lg font-extrabold text-[#1a1a1a]">{order.order_number}</p>
              {order.customer_name && (
                <p className="text-sm text-gray-500 mt-0.5">{order.customer_name}</p>
              )}
            </div>
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                order.status === "Delivered"
                  ? "bg-green-100 text-green-700"
                  : order.status === "Cancelled"
                  ? "bg-red-100 text-red-700"
                  : order.status === "Shipped"
                  ? "bg-blue-100 text-blue-700"
                  : order.status === "Processing"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {order.status}
            </span>
          </div>

          {/* Estimated delivery date - only shown when admin sets it */}
          {order.estimated_delivery && (
            <div className="flex items-center gap-2.5 mb-6 p-3 bg-green-50 rounded-xl border border-green-100">
              <FiCalendar className="text-[#4CAF37] shrink-0" size={18} />
              <div>
                <p className="text-xs text-gray-500 font-medium">Estimated Delivery Date</p>
                <p className="text-sm font-extrabold text-[#1a1a1a]">
                  {formatDate(order.estimated_delivery)}
                </p>
              </div>
            </div>
          )}

          {order.status === "Cancelled" ? (
            <p className="mt-2 text-red-600 font-semibold text-center py-4">
              This order was cancelled.
            </p>
          ) : (
            <div className="mt-4">
              {/* Progress steps */}
              <div className="flex items-start justify-between relative">
                {/* Background line */}
                <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0" />
                {/* Active progress line */}
                <div
                  className="absolute top-4 left-0 h-0.5 bg-[#4CAF37] transition-all duration-700 z-0"
                  style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                />
                {STEPS.map((label, i) => {
                  const Icon = STEP_ICONS[i];
                  const isCompleted = i <= currentStep;
                  const isCurrent = i === currentStep;
                  return (
                    <div key={label} className="relative z-10 flex flex-col items-center flex-1">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          isCompleted
                            ? "bg-[#4CAF37] text-white shadow-md"
                            : "bg-gray-100 text-gray-400"
                        } ${isCurrent ? "ring-2 ring-[#4CAF37] ring-offset-2" : ""}`}
                      >
                        <Icon size={14} />
                      </div>
                      <span
                        className={`text-[11px] mt-2 font-semibold text-center leading-tight px-0.5 ${
                          isCompleted ? "text-[#1a1a1a]" : "text-gray-400"
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Payment info */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>
              Payment:{" "}
              <span className="font-semibold text-gray-700">
                {order.payment_method || "Online"}
              </span>
            </span>
            <span>
              Total:{" "}
              <span className="font-bold text-[#1a1a1a]">
                ₹{Number(order.total_amount || 0).toLocaleString("en-IN")}
              </span>
            </span>
          </div>
        </div>
      )}
    </main>
  );
}