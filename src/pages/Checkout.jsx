import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FiShield,
  FiCreditCard,
  FiTruck,
  FiCheckCircle,
  FiAlertCircle,
  FiLock,
  FiTag,
  FiX,
  FiArrowLeft,
  FiCheck,
} from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "   https://nutriexa-backend.onrender.com";

function RazorpayLogo({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fill="#3395FF"
        d="M22.436 0l-11.91 7.773-1.174 4.276 6.625-4.325-1.597 5.814-6.643 4.338-3.037 6.124h4.48l1.782-3.606 7.697-5.024 1.706-6.216 4.065-2.654L22.436 0zM1.564 24l5.96-12.022L12.5 8.71 8.272 24H1.564z"
      />
    </svg>
  );
}

// Helper to dynamically load Razorpay checkout script
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState("RAZORPAY"); // "RAZORPAY" | "COD"
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: "",
    email: user?.email || "",
    address: "",
    city: "",
    state: "Delhi",
    pincode: "",
  });

  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState(null);

  // Razorpay Demo Modal for dummy mode testing
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoOrderData, setDemoOrderData] = useState(null);

  // Calculate pricing
  const shipping = cartTotal >= 1999 || cartTotal === 0 ? 0 : 99;
  const subtotalAfterDiscount = Math.max(0, cartTotal - discountAmount);
  const total = subtotalAfterDiscount + (cartTotal > 0 ? shipping : 0);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || user.name || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  const validate = () => {
    if (!form.name.trim()) {
      setError("Please enter your full name.");
      return false;
    }
    if (!/^\d{10}$/.test(form.phone.trim())) {
      setError("Please enter a valid 10-digit mobile number.");
      return false;
    }
    if (!form.address.trim()) {
      setError("Please enter your complete delivery address.");
      return false;
    }
    if (!form.city.trim()) {
      setError("Please enter your city.");
      return false;
    }
    if (!/^\d{6}$/.test(form.pincode.trim())) {
      setError("Please enter a valid 6-digit PIN code.");
      return false;
    }
    return true;
  };

  // Apply Coupon code
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponError("");

    try {
      const res = await fetch(`${API_BASE}/api/coupons`);
      const coupons = await res.json();
      const codeUpper = couponCode.trim().toUpperCase();
      const match = Array.isArray(coupons)
        ? coupons.find((c) => c.code.toUpperCase() === codeUpper && c.status === "Active")
        : null;

      if (!match) {
        setCouponError("Invalid or expired coupon code.");
        return;
      }

      if (match.min_order && cartTotal < Number(match.min_order)) {
        setCouponError(`Minimum order value of ₹${match.min_order} required for this coupon.`);
        return;
      }

      let discount = 0;
      if (match.type === "Percentage") {
        discount = Math.round((cartTotal * Number(match.value)) / 100);
      } else {
        discount = Number(match.value);
      }

      discount = Math.min(discount, cartTotal);
      setDiscountAmount(discount);
      setAppliedCoupon(match);
      setCouponError("");
    } catch (err) {
      setCouponError("Could not validate coupon. Try again.");
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCode("");
    setCouponError("");
  };

  // Process Online Payment via Razorpay
  const handleRazorpayPayment = async () => {
    if (!validate()) return;
    setPlacing(true);
    setError(null);

    try {
      // 1. Fetch Razorpay key and create order on backend
      const orderRes = await fetch(`${API_BASE}/api/payment/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          currency: "INR",
          receipt: `rcpt_${Date.now()}`,
        }),
      });

      if (!orderRes.ok) {
        throw new Error("Failed to initialize payment gateway order.");
      }

      const orderData = await orderRes.json();
      const isScriptLoaded = await loadRazorpayScript();

      // If Razorpay SDK loaded and not in dummy fallback, launch live Razorpay popup
      if (isScriptLoaded && window.Razorpay && !orderData.isDummy) {
        const options = {
          key: orderData.key,
          amount: orderData.amount,
          currency: orderData.currency || "INR",
          name: "Nutriexa Nutrition",
          description: "Purchase Order Checkout",
          order_id: orderData.order_id,
          image: "/images/logo.png",
          prefill: {
            name: form.name,
            email: form.email || "",
            contact: form.phone,
          },
          theme: {
            color: "#4CAF37",
          },
          handler: async function (response) {
            await verifyAndFinalizePayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
          },
          modal: {
            ondismiss: function () {
              setPlacing(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (response) {
          setError(`Payment Failed: ${response.error.description || "Transaction declined."}`);
          setPlacing(false);
        });
        rzp.open();
      } else {
        // Dummy/Test simulation modal for seamless developer testing
        setDemoOrderData(orderData);
        setShowDemoModal(true);
        setPlacing(false);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to process payment. Please try again.");
      setPlacing(false);
    }
  };

  // Verify signature & store completed order in database
  const verifyAndFinalizePayment = async ({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  }) => {
    setPlacing(true);
    try {
      const payload = {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        customer_id: user?.id || null,
        customer_name: form.name,
        customer_email: form.email || null,
        customer_phone: form.phone,
        shipping_phone: form.phone,
        shipping_address: form.address,
        shipping_city: form.city,
        shipping_state: form.state,
        shipping_pincode: form.pincode,
        items: cartItems.map((item) => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        total_amount: total,
      };

      const res = await fetch(`${API_BASE}/api/payment/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Payment verification failed.");
      }

      clearCart();
      const trackingNumber = data.order?.order_number || data.order?.id;
      navigate(`/track-order?order=${encodeURIComponent(String(trackingNumber).replace("#", ""))}`);
    } catch (err) {
      setError(err.message || "Failed to verify and save order.");
    } finally {
      setPlacing(false);
      setShowDemoModal(false);
    }
  };

  // Process Cash on Delivery (COD) Checkout
  const handleCodOrder = async () => {
    if (!validate()) return;
    setPlacing(true);
    setError(null);

    try {
      const payload = {
        customer_id: user?.id || null,
        customer_name: form.name,
        customer_phone: form.phone,
        customer_email: form.email || null,
        shipping_phone: form.phone,
        shipping_address: form.address,
        shipping_city: form.city,
        shipping_state: form.state,
        shipping_pincode: form.pincode,
        payment_method: "COD",
        items: cartItems.map((item) => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        total_amount: total,
      };

      const res = await fetch(`${API_BASE}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to place order.");
      }

      clearCart();
      const trackingNumber = data.order_number || data.id;
      navigate(`/track-order?order=${encodeURIComponent(String(trackingNumber).replace("#", ""))}`);
    } catch (err) {
      setError(err.message || "Failed to place order.");
    } finally {
      setPlacing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <main className="max-w-3xl mx-auto px-4 md:px-10 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-[#f4f7f2] flex items-center justify-center mx-auto mb-4 text-[#4CAF37]">
          <FiTruck size={30} />
        </div>
        <h1 className="text-2xl font-extrabold text-[#1a1a1a]">Your Cart is Empty</h1>
        <p className="text-gray-500 text-sm mt-2 mb-6">
          Add some premium supplements to your cart to proceed with checkout.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-[#4CAF37] text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
        >
          <FiArrowLeft size={16} /> Return to Store
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-10">
      {/* Checkout header */}
      <div className="flex items-center justify-between pb-6 mb-8 border-b border-gray-100">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1a1a1a] tracking-tight">
            Checkout & Payment
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Complete your shipping details and select payment method
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full font-medium">
          <FiShield size={16} /> 256-Bit SSL Encrypted
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
          <FiAlertCircle className="shrink-0 mt-0.5" size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_380px] gap-8">
        {/* Left Column: Form + Payment Selector */}
        <div className="space-y-8">
          {/* Step 1: Shipping Details */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-2.5 mb-5">
              <span className="w-6 h-6 rounded-full bg-[#4CAF37] text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h2 className="text-base font-extrabold text-[#1a1a1a]">Shipping Address</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#4CAF37] focus:ring-1 focus:ring-[#4CAF37]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#4CAF37] focus:ring-1 focus:ring-[#4CAF37]"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="text-xs font-semibold text-gray-700 mb-1 block">Email Address (Optional)</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="For order receipt & tracking updates"
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#4CAF37] focus:ring-1 focus:ring-[#4CAF37]"
              />
            </div>

            <div className="mt-4">
              <label className="text-xs font-semibold text-gray-700 mb-1 block">Complete Address *</label>
              <textarea
                name="address"
                rows={2}
                value={form.address}
                onChange={handleChange}
                placeholder="Flat / House no, Building name, Street, Area, Landmark"
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#4CAF37] focus:ring-1 focus:ring-[#4CAF37]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">City *</label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="City"
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#4CAF37] focus:ring-1 focus:ring-[#4CAF37]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">State *</label>
                <input
                  type="text"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  placeholder="State"
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#4CAF37] focus:ring-1 focus:ring-[#4CAF37]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Pincode *</label>
                <input
                  type="text"
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  placeholder="6-digit PIN"
                  maxLength={6}
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#4CAF37] focus:ring-1 focus:ring-[#4CAF37]"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Payment Method */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-2.5 mb-5">
              <span className="w-6 h-6 rounded-full bg-[#4CAF37] text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h2 className="text-base font-extrabold text-[#1a1a1a]">Select Payment Method</h2>
            </div>

            <div className="space-y-3">
              {/* Option 1: Razorpay */}
              <label
                className={`relative flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "RAZORPAY"
                  ? "border-[#4CAF37] bg-[#4CAF37]/5 shadow-sm"
                  : "border-gray-100 hover:border-gray-200 bg-white"
                  }`}
              >
                <input
                  type="radio"
                  name="payment_choice"
                  checked={paymentMethod === "RAZORPAY"}
                  onChange={() => setPaymentMethod("RAZORPAY")}
                  className="mt-1 text-[#4CAF37] focus:ring-[#4CAF37] accent-[#4CAF37]"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-[#1a1a1a]">
                        Razorpay Secure Checkout
                      </span>
                      <span className="bg-[#4CAF37] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        RECOMMENDED
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <RazorpayLogo className="w-5 h-5" />
                      <span className="font-bold text-[#0c2340]">Razorpay</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Pay securely using UPI (GPay, PhonePe, Paytm), Debit/Credit Cards, NetBanking, and Wallets.
                  </p>
                </div>
              </label>

              {/* Option 2: Cash on Delivery */}
              <label
                className={`relative flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "COD"
                  ? "border-[#4CAF37] bg-[#4CAF37]/5 shadow-sm"
                  : "border-gray-100 hover:border-gray-200 bg-white"
                  }`}
              >
                <input
                  type="radio"
                  name="payment_choice"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                  className="mt-1 text-[#4CAF37] focus:ring-[#4CAF37] accent-[#4CAF37]"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-[#1a1a1a]">
                      Cash on Delivery (COD)
                    </span>
                    <FiTruck size={18} className="text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Pay with cash at your doorstep when your package is delivered.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Coupon */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-24">
            <h3 className="text-base font-extrabold text-[#1a1a1a] mb-4">Order Summary</h3>

            {/* Items scroll */}
            <div className="divide-y divide-gray-100 max-h-56 overflow-y-auto pr-1 mb-5">
              {cartItems.map((item) => (
                <div key={item.id} className="py-2.5 first:pt-0 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-9 h-9 object-contain shrink-0" />
                    )}
                    <div>
                      <p className="font-semibold text-gray-800 line-clamp-1">{item.name}</p>
                      <p className="text-gray-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-gray-900 shrink-0">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon Box */}
            <div className="mb-5 pt-3 border-t border-gray-100">
              {appliedCoupon ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-green-800 text-xs font-bold">
                    <FiTag size={15} />
                    <span>{appliedCoupon.code} Applied (-₹{discountAmount})</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-gray-400 hover:text-red-500 p-1"
                    title="Remove coupon"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter Coupon Code"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs uppercase font-medium outline-none focus:border-[#4CAF37]"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading || !couponCode.trim()}
                    className="bg-[#1a1a1a] text-white text-xs font-semibold px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-50"
                  >
                    {couponLoading ? "..." : "Apply"}
                  </button>
                </form>
              )}
              {couponError && <p className="text-[11px] text-red-500 mt-1.5">{couponError}</p>}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2.5 text-xs text-gray-600 border-t border-gray-100 pt-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{cartTotal.toLocaleString("en-IN")}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span>{shipping === 0 ? <strong className="text-green-600">FREE</strong> : `₹${shipping}`}</span>
              </div>

              <div className="flex justify-between items-baseline text-base font-extrabold text-[#1a1a1a] border-t border-gray-100 pt-3 mt-1">
                <span>Total Payable</span>
                <span className="text-xl text-[#4CAF37]">₹{total.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Action button */}
            <button
              onClick={paymentMethod === "RAZORPAY" ? handleRazorpayPayment : handleCodOrder}
              disabled={placing}
              className="w-full mt-6 bg-[#4CAF37] hover:bg-[#439e30] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-[#4CAF37]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {placing ? (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : paymentMethod === "RAZORPAY" ? (
                <>
                  <FiLock size={16} /> Pay ₹{total.toLocaleString("en-IN")} with Razorpay
                </>
              ) : (
                <>
                  <FiTruck size={16} /> Place COD Order (₹{total.toLocaleString("en-IN")})
                </>
              )}
            </button>

            <p className="text-[11px] text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
              <FiShield size={12} /> 100% Secure & Verified Payments
            </p>
          </div>
        </div>
      </div>

      {/* RAZORPAY TEST SIMULATOR MODAL (For Dummy/Offline Environments) */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100 relative">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <RazorpayLogo className="w-6 h-6" />
                <span className="font-extrabold text-[#0c2340]">Razorpay Simulation</span>
              </div>
              <button
                onClick={() => setShowDemoModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="bg-[#f7f9fa] rounded-xl p-4 mb-5 border border-gray-100">
              <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                <span>Amount Payable</span>
                <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                  Test API Mode
                </span>
              </div>
              <div className="text-2xl font-black text-[#0c2340]">
                ₹{total.toLocaleString("en-IN")}
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Razorpay dummy API is active. You can simulate instant payment success or test failure handling.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() =>
                  verifyAndFinalizePayment({
                    razorpay_order_id: demoOrderData?.order_id || `order_demo_${Date.now()}`,
                    razorpay_payment_id: `pay_demo_success_${Date.now()}`,
                    razorpay_signature: "mock_signature_approved",
                  })
                }
                disabled={placing}
                className="w-full bg-[#3395FF] hover:bg-[#287cd8] text-white text-sm font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <FiCheckCircle size={16} /> Simulate Success (Complete Payment)
              </button>

              <button
                onClick={() => {
                  setShowDemoModal(false);
                  setError("Payment failed: Simulated cancellation / invalid test card.");
                }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold py-2.5 px-4 rounded-xl transition-colors"
              >
                Simulate Payment Failure / Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}