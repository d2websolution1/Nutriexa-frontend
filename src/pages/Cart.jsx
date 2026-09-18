import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiTrash2,
  FiMinus,
  FiPlus,
  FiShoppingCart,
  FiTag,
  FiCheck,
  FiX,
  FiArrowRight,
  FiCopy,
} from "react-icons/fi";
import { TbTicket, TbDiscount, TbTruckDelivery } from "react-icons/tb";
import { useCart } from "../context/CartContext";

const AVAILABLE_OFFERS = [
  {
    code: "WELCOME10",
    title: "10% OFF Welcome Bonus",
    description: "Get 10% instant discount on your order",
    type: "Percentage",
    value: 10,
    minOrder: 0,
    badge: "Most Popular",
    color: "emerald",
  },
  {
    code: "NUTRI15",
    title: "15% Mega Nutrition Deal",
    description: "Save 15% on orders above ₹2,499",
    type: "Percentage",
    value: 15,
    minOrder: 2499,
    badge: "Best Value",
    color: "blue",
  },
  {
    code: "FLAT200",
    title: "Flat ₹200 OFF",
    description: "Instant ₹200 savings on orders above ₹1,499",
    type: "Fixed",
    value: 200,
    minOrder: 1499,
    badge: "Instant Cash",
    color: "purple",
  },
  {
    code: "FREESHIP",
    title: "Free Express Shipping",
    description: "Free delivery on all orders above ₹1,999",
    type: "Shipping",
    value: 99,
    minOrder: 1999,
    badge: "Delivery Saver",
    color: "amber",
  },
];

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();
  const navigate = useNavigate();

  const [inputCoupon, setInputCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponMessage, setCouponMessage] = useState({ type: "", text: "" });
  const [copiedCode, setCopiedCode] = useState("");

  // Load previously saved coupon from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("nutriexa_coupon");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.code) {
          applyCouponLogic(parsed.code, false);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Recalculate discount whenever cartTotal changes
  useEffect(() => {
    if (appliedCoupon) {
      applyCouponLogic(appliedCoupon.code, false);
    }
  }, [cartTotal]);

  const applyCouponLogic = (rawCode, showToast = true) => {
    const code = rawCode.trim().toUpperCase();
    const offer = AVAILABLE_OFFERS.find((o) => o.code === code);

    if (!offer) {
      if (showToast) {
        setCouponMessage({
          type: "error",
          text: `Invalid coupon code "${code}". Please pick from the available offers below.`,
        });
      }
      return false;
    }

    if (offer.minOrder > 0 && cartTotal < offer.minOrder) {
      const diff = offer.minOrder - cartTotal;
      if (showToast) {
        setCouponMessage({
          type: "error",
          text: `Add ₹${diff.toLocaleString("en-IN")} more to your cart to use "${offer.code}".`,
        });
      }
      return false;
    }

    let calculatedDiscount = 0;
    if (offer.type === "Percentage") {
      calculatedDiscount = Math.round((cartTotal * offer.value) / 100);
    } else if (offer.type === "Fixed") {
      calculatedDiscount = Math.min(offer.value, cartTotal);
    } else if (offer.type === "Shipping") {
      calculatedDiscount = cartTotal >= 1999 ? 0 : 99;
    }

    setAppliedCoupon(offer);
    setDiscountAmount(calculatedDiscount);
    setInputCoupon(offer.code);

    // Save to localStorage for checkout page
    localStorage.setItem(
      "nutriexa_coupon",
      JSON.stringify({
        code: offer.code,
        type: offer.type,
        value: offer.value,
        discountAmount: calculatedDiscount,
      })
    );

    if (showToast) {
      setCouponMessage({
        type: "success",
        text: `Coupon "${offer.code}" applied! You saved ₹${calculatedDiscount.toLocaleString("en-IN")}.`,
      });
    }
    return true;
  };

  const handleManualApply = (e) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;
    applyCouponLogic(inputCoupon, true);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setInputCoupon("");
    localStorage.removeItem("nutriexa_coupon");
    setCouponMessage({
      type: "info",
      text: "Coupon removed.",
    });
    setTimeout(() => setCouponMessage({ type: "", text: "" }), 3000);
  };

  const copyCouponCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(""), 2000);
  };

  if (cartItems.length === 0) {
    return (
      <main className="max-w-3xl mx-auto px-4 md:px-10 py-20 text-center">
        <FiShoppingCart size={48} className="text-gray-300 mx-auto mb-4" />
        <h1 className="text-xl font-extrabold text-[#1a1a1a] dark:text-white">
          Your cart is empty
        </h1>
        <p className="text-gray-500 text-sm mt-2">
          Looks like you haven't added anything yet.
        </p>
        <Link
          to="/products"
          className="mt-6 inline-block bg-[#4CAF37] text-white font-semibold px-6 py-3 rounded-md hover:opacity-90 transition-opacity"
        >
          Continue Shopping
        </Link>
      </main>
    );
  }

  const baseShipping = cartTotal >= 1999 ? 0 : 99;
  const shippingFee = appliedCoupon?.type === "Shipping" ? 0 : baseShipping;
  const finalTotal = Math.max(0, cartTotal - discountAmount + shippingFee);

  return (
    <main className="max-w-6xl mx-auto px-4 md:px-10 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1a1a1a] dark:text-white tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Review your supplements and apply available discounts before checkout
          </p>
        </div>
        <Link
          to="/products"
          className="text-xs font-semibold text-[#4CAF37] hover:underline"
        >
          + Add more items
        </Link>
      </div>

      {/* Grid: Cart Items on left, Available Offers & Summary on right */}
      <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
        {/* Left Column: Cart Items + Available Offers Box */}
        <div className="space-y-6">
          {/* Cart Items List */}
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 bg-white dark:bg-[#111722] border border-gray-100 dark:border-gray-800 rounded-xl p-4 shadow-sm"
              >
                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800/60 rounded-lg flex items-center justify-center shrink-0 p-1">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#1a1a1a] dark:text-white leading-tight">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.variant}</p>
                  <p className="text-xs font-bold text-[#4CAF37] mt-1 sm:hidden">
                    ₹{item.price.toLocaleString("en-IN")} each
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5">
                  <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2.5 py-1.5 text-gray-600 dark:text-gray-300 hover:text-[#4CAF37] hover:bg-white dark:hover:bg-gray-700 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <FiMinus size={13} />
                    </button>
                    <span className="px-3 text-xs font-bold text-[#1a1a1a] dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2.5 py-1.5 text-gray-600 dark:text-gray-300 hover:text-[#4CAF37] hover:bg-white dark:hover:bg-gray-700 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <FiPlus size={13} />
                    </button>
                  </div>

                  <div className="min-w-[90px] text-right">
                    {item.mrp && item.mrp > item.price ? (
                      <div className="text-xs text-gray-400 line-through">₹{(item.mrp * item.quantity).toLocaleString("en-IN")}</div>
                    ) : null}
                    <div className="text-sm font-extrabold text-[#1a1a1a] dark:text-white">₹{(item.price * item.quantity).toLocaleString("en-IN")}</div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    title="Remove item"
                    aria-label="Remove item"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ===================================================================
              AVAILABLE OFFERS & DISCOUNT COUPONS SECTION
             =================================================================== */}
          <div className="bg-gradient-to-br from-[#f8faf7] to-[#eef4ea] dark:from-[#0d131f] dark:to-[#111a28] border border-[#4CAF37]/25 rounded-2xl p-5 md:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#4CAF37]/15 flex items-center justify-center text-[#4CAF37]">
                  <TbDiscount size={20} />
                </div>
                <div>
                  <h3 className="text-sm md:text-base font-extrabold text-[#1a1a1a] dark:text-white flex items-center gap-2">
                    Available Offers &amp; Coupons
                    <span className="text-[10px] bg-[#4CAF37] text-white font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                      Exclusive
                    </span>
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Click "Apply" on any offer or enter your promo code
                  </p>
                </div>
              </div>
            </div>

            {/* Manual Coupon Input Form */}
            <form onSubmit={handleManualApply} className="flex gap-2 mb-5">
              <div className="relative flex-1">
                <TbTicket
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={inputCoupon}
                  onChange={(e) => setInputCoupon(e.target.value.toUpperCase())}
                  placeholder="Enter Voucher or Coupon Code..."
                  className="w-full bg-white dark:bg-[#18202d] border border-gray-200 dark:border-gray-700 rounded-lg pl-9 pr-3 py-2 text-xs font-semibold uppercase tracking-wider text-[#1a1a1a] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#4CAF37] focus:border-[#4CAF37]"
                />
              </div>
              <button
                type="submit"
                className="bg-[#4CAF37] hover:bg-[#439e31] text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                Apply Code
              </button>
            </form>

            {/* Feedback Message */}
            {couponMessage.text && (
              <div
                className={`mb-4 text-xs font-semibold px-3 py-2 rounded-lg flex items-center justify-between ${
                  couponMessage.type === "success"
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                    : couponMessage.type === "error"
                    ? "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                <span>{couponMessage.text}</span>
                {appliedCoupon && (
                  <button
                    onClick={removeCoupon}
                    className="text-xs underline hover:opacity-80 ml-2 cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>
            )}

            {/* List of Available Voucher Cards */}
            <div className="grid sm:grid-cols-2 gap-3">
              {AVAILABLE_OFFERS.map((offer) => {
                const isApplied = appliedCoupon?.code === offer.code;
                const isEligible = offer.minOrder === 0 || cartTotal >= offer.minOrder;
                const needed = offer.minOrder - cartTotal;

                return (
                  <div
                    key={offer.code}
                    className={`relative rounded-xl border p-3.5 transition-all flex flex-col justify-between ${
                      isApplied
                        ? "bg-emerald-500/10 border-[#4CAF37] shadow-sm"
                        : "bg-white dark:bg-[#111722] border-gray-200 dark:border-gray-800 hover:border-[#4CAF37]/60"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        {/* Coupon Code Pill */}
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-extrabold text-xs tracking-wider bg-gray-100 dark:bg-gray-800 text-[#1a1a1a] dark:text-white border border-dashed border-gray-300 dark:border-gray-600 px-2 py-0.5 rounded">
                            {offer.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyCouponCode(offer.code)}
                            title="Copy code"
                            className="text-gray-400 hover:text-[#4CAF37] transition-colors p-0.5"
                          >
                            {copiedCode === offer.code ? (
                              <FiCheck size={12} className="text-[#4CAF37]" />
                            ) : (
                              <FiCopy size={12} />
                            )}
                          </button>
                        </div>

                        <span className="text-[10px] font-bold text-[#4CAF37] uppercase">
                          {offer.badge}
                        </span>
                      </div>

                      <p className="text-xs font-bold text-[#1a1a1a] dark:text-white">
                        {offer.title}
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                        {offer.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <span className="text-[10px] text-gray-400">
                        {offer.minOrder > 0
                          ? `Min order: ₹${offer.minOrder.toLocaleString("en-IN")}`
                          : "No minimum order"}
                      </span>

                      {isApplied ? (
                        <button
                          type="button"
                          onClick={removeCoupon}
                          className="text-[11px] font-bold text-red-600 hover:text-red-700 underline cursor-pointer"
                        >
                          Remove
                        </button>
                      ) : isEligible ? (
                        <button
                          type="button"
                          onClick={() => applyCouponLogic(offer.code, true)}
                          className="text-xs font-bold text-white bg-[#4CAF37] hover:bg-[#439e31] px-3 py-1 rounded-md transition-colors cursor-pointer"
                        >
                          APPLY
                        </button>
                      ) : (
                        <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">
                          Add ₹{needed.toLocaleString("en-IN")} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary with Real-Time Savings Breakdown */}
        <div className="bg-white dark:bg-[#111722] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm sticky top-28">
          <h2 className="text-base font-extrabold text-[#1a1a1a] dark:text-white mb-4 flex items-center justify-between">
            <span>Order Summary</span>
            <span className="text-xs text-gray-400 font-normal">
              {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
            </span>
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-600 dark:text-gray-300">
              <span>Subtotal</span>
              <span className="font-semibold text-[#1a1a1a] dark:text-white">
                ₹{cartTotal.toLocaleString("en-IN")}
              </span>
            </div>

            {/* Discount Line if Applied */}
            {discountAmount > 0 && (
              <div className="flex justify-between text-[#4CAF37] font-semibold bg-[#4CAF37]/10 px-2.5 py-1.5 rounded-lg">
                <span className="flex items-center gap-1.5 text-xs">
                  <FiTag size={13} />
                  Coupon ({appliedCoupon?.code})
                </span>
                <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
              </div>
            )}

            <div className="flex justify-between text-gray-600 dark:text-gray-300">
              <span className="flex items-center gap-1">
                <TbTruckDelivery size={16} className="text-gray-400" />
                Shipping
              </span>
              <span className="font-semibold">
                {shippingFee === 0 ? (
                  <span className="text-[#4CAF37] font-bold">FREE</span>
                ) : (
                  `₹${shippingFee}`
                )}
              </span>
            </div>

            {cartTotal < 1999 && (
              <p className="text-[11px] text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg">
                💡 Add ₹{(1999 - cartTotal).toLocaleString("en-IN")} more for <span className="font-semibold text-[#4CAF37]">FREE delivery</span>
              </p>
            )}

            <div className="border-t border-gray-100 dark:border-gray-800 pt-3 mt-3">
              <div className="flex justify-between items-baseline">
                <span className="text-base font-extrabold text-[#1a1a1a] dark:text-white">
                  Total
                </span>
                <div className="text-right">
                  <span className="text-xl font-black text-[#1a1a1a] dark:text-white">
                    ₹{finalTotal.toLocaleString("en-IN")}
                  </span>
                  <p className="text-[10px] text-gray-400">Inclusive of all taxes</p>
                </div>
              </div>

              {discountAmount > 0 && (
                <p className="mt-2 text-xs font-bold text-center text-[#4CAF37] bg-emerald-500/10 py-1.5 rounded-md">
                  🎉 You are saving ₹{discountAmount.toLocaleString("en-IN")} on this order!
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => navigate("/checkout")}
            className="w-full mt-6 bg-[#4CAF37] hover:bg-[#439e31] text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wide cursor-pointer"
          >
            Proceed to Checkout <FiArrowRight size={16} />
          </button>

          {/* Trust badges */}
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-2 text-[10px] text-gray-400 text-center">
            <span className="flex items-center justify-center gap-1">🔒 100% Secure Checkout</span>
            <span className="flex items-center justify-center gap-1">⚡ Fast Dispatch</span>
          </div>
        </div>
      </div>
    </main>
  );
}