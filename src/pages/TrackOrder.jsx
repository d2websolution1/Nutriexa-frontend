import { useState } from "react";
import { useSearchParams } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "   https://nutriexa-backend.onrender.com";
const STEPS = ["Order Placed", "Processing", "Shipped", "Delivered"];

// maps order status -> how many steps are completed
const STATUS_STEP_INDEX = {
  Pending: 0,
  Shipped: 2,
  Delivered: 3,
  Cancelled: -1,
};

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get("order") || "");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const currentStep = order ? STATUS_STEP_INDEX[order.status] ?? 0 : -1;

  return (
    <main className="max-w-2xl mx-auto px-4 md:px-10 py-16 text-center">
      <h1 className="text-2xl font-extrabold text-[#1a1a1a]">Track Your Order</h1>
      <p className="text-gray-500 text-sm mt-2">Apna Order ID daal ke live status dekho.</p>

      <form onSubmit={trackOrder} className="mt-8 flex gap-2 max-w-md mx-auto">
        <input
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="e.g. NX6279"
          className="flex-1 border border-gray-200 rounded-md px-4 py-3 text-sm outline-none focus:border-[#4CAF37]"
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
        <div className="mt-12">
          <p className="text-sm text-gray-500">Order #{order.order_number}</p>

          {order.status === "Cancelled" ? (
            <p className="mt-6 text-red-600 font-semibold">This order was cancelled.</p>
          ) : (
            <div className="flex items-center justify-between mt-10 relative">
              <div className="absolute top-3 left-0 right-0 h-0.5 bg-gray-200" />
              <div
                className="absolute top-3 left-0 h-0.5 bg-[#4CAF37] transition-all"
                style={{
                  width: `${(currentStep / (STEPS.length - 1)) * 100}%`,
                }}
              />
              {STEPS.map((label, i) => (
                <div key={label} className="relative z-10 flex flex-col items-center flex-1">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      i <= currentStep
                        ? "bg-[#4CAF37] text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span
                    className={`text-xs mt-2 ${
                      i <= currentStep ? "text-[#1a1a1a] font-medium" : "text-gray-400"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}