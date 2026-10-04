import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FiPackage, FiCalendar, FiTruck, FiCheckCircle, FiClock, FiMapPin, FiCreditCard, FiShoppingBag } from "react-icons/fi";
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

function formatDateTime(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

// Build product image URL the same way the rest of the site does
function buildImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path}`;
}

// Calculate a default estimated delivery date (3-4 days from order)
function getDefaultEstimatedDelivery(orderCreatedAt) {
  if (!orderCreatedAt) return null;
  const orderDate = new Date(orderCreatedAt);
  const deliveryDate = new Date(orderDate);
  deliveryDate.setDate(orderDate.getDate() + 4); // 4 days from order
  return deliveryDate.toISOString();
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

  // Determine estimated delivery date to display
  const estimatedDelivery = order
    ? order.estimated_delivery || getDefaultEstimatedDelivery(order.created_at)
    : null;

  // Check if delivery date is from admin or auto-calculated
  const isAdminSetDelivery = order?.estimated_delivery ? true : false;

  return (
    <main className="max-w-3xl mx-auto px-4 md:px-10 py-16 text-center">
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
        <div className="mt-10 text-left space-y-5">
          {/* Order Header Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
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

            {/* Estimated Delivery Date */}
            {estimatedDelivery && order.status !== "Delivered" && order.status !== "Cancelled" && (
              <div className="flex items-center gap-2.5 mb-6 p-3.5 bg-green-50 rounded-xl border border-green-100">
                <div className="w-9 h-9 rounded-full bg-[#4CAF37]/15 flex items-center justify-center shrink-0">
                  <FiCalendar className="text-[#4CAF37]" size={17} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">
                    {isAdminSetDelivery ? "Estimated Delivery Date" : "Expected Delivery (Approx.)"}
                  </p>
                  <p className="text-sm font-extrabold text-[#1a1a1a]">
                    {formatDate(estimatedDelivery)}
                  </p>
                  {!isAdminSetDelivery && (
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Usually delivers within 3-4 business days
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Delivered confirmation */}
            {order.status === "Delivered" && (
              <div className="flex items-center gap-2.5 mb-6 p-3.5 bg-green-50 rounded-xl border border-green-100">
                <div className="w-9 h-9 rounded-full bg-[#4CAF37]/15 flex items-center justify-center shrink-0">
                  <FiCheckCircle className="text-[#4CAF37]" size={17} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Delivered On</p>
                  <p className="text-sm font-extrabold text-[#1a1a1a]">
                    {formatDate(order.updated_at || order.created_at)}
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

            {/* Payment & Order Date info */}
            <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <FiCreditCard size={14} className="text-gray-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400 font-medium">Payment</p>
                  <p className="font-semibold text-gray-700">
                    {order.payment_method === "Prepaid" ? "Online (Prepaid)" : order.payment_method || "Online"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FiClock size={14} className="text-gray-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400 font-medium">Order Date</p>
                  <p className="font-semibold text-gray-700">{formatDate(order.created_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FiShoppingBag size={14} className="text-gray-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400 font-medium">Total</p>
                  <p className="font-bold text-[#1a1a1a]">
                    ₹{Number(order.total_amount || 0).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Ordered Products Card */}
          {order.items && order.items.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-extrabold text-[#1a1a1a] flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                <FiShoppingBag size={15} className="text-[#4CAF37]" />
                Ordered Products ({order.items.length} {order.items.length === 1 ? "item" : "items"})
              </h3>

              <div className="divide-y divide-gray-50">
                {order.items.map((item, idx) => {
                  // Try product_image first, then parse images JSON for first image
                  let imgUrl = buildImageUrl(item.product_image);
                  if (!imgUrl && item.product_images) {
                    try {
                      const imgs = typeof item.product_images === "string"
                        ? JSON.parse(item.product_images)
                        : item.product_images;
                      if (Array.isArray(imgs) && imgs.length > 0) {
                        imgUrl = buildImageUrl(imgs[0]);
                      }
                    } catch {
                      // ignore parse errors
                    }
                  }

                  return (
                    <div
                      key={item.id || idx}
                      className="py-3.5 first:pt-0 last:pb-0 flex items-center gap-4"
                    >
                      {/* Product Image */}
                      <div className="w-16 h-16 rounded-xl border border-gray-100 bg-[#f9faf8] flex items-center justify-center overflow-hidden shrink-0">
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={item.product_name}
                            className="w-full h-full object-contain p-1"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.parentElement.innerHTML = `<span class="text-[#4CAF37] text-lg font-bold">${(item.product_name || "P").charAt(0)}</span>`;
                            }}
                          />
                        ) : (
                          <span className="text-[#4CAF37] text-lg font-bold">
                            {(item.product_name || "P").charAt(0)}
                          </span>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#1a1a1a] truncate">{item.product_name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500">
                            Qty: <span className="font-semibold text-gray-700">{item.quantity}</span>
                          </span>
                          <span className="text-xs text-gray-400">×</span>
                          <span className="text-xs text-gray-500">
                            ₹{Number(item.price).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>

                      {/* Item Total */}
                      <div className="text-right shrink-0">
                        <p className="text-sm font-extrabold text-[#1a1a1a]">
                          ₹{(Number(item.price) * Number(item.quantity)).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Total */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Order Total
                </span>
                <span className="text-lg font-extrabold text-[#4CAF37]">
                  ₹{Number(order.total_amount || 0).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          )}

          {/* Shipping Address Card */}
          {(order.shipping_address || order.shipping_city) && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-extrabold text-[#1a1a1a] flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
                <FiMapPin size={15} className="text-[#4CAF37]" />
                Delivery Address
              </h3>
              <div className="text-sm text-gray-700 leading-relaxed space-y-0.5">
                {order.customer_name && (
                  <p className="font-semibold text-[#1a1a1a]">{order.customer_name}</p>
                )}
                {order.shipping_address && <p>{order.shipping_address}</p>}
                <p>
                  {[order.shipping_city, order.shipping_state, order.shipping_pincode]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                {order.shipping_phone && (
                  <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                    📞 {order.shipping_phone}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}