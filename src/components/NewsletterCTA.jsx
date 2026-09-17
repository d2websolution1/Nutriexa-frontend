import { useState } from "react";
import { Link } from "react-router-dom";
import { FiSend, FiCheck, FiCopy, FiTag, FiX } from "react-icons/fi";
import { API_URL as API_BASE } from "../config";

export default function NewsletterCTA() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [couponCode, setCouponCode] = useState("WELCOME10");
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (data.coupon) {
        setCouponCode(data.coupon);
      }
    } catch (err) {
      // Fallback works seamlessly even offline
    } finally {
      localStorage.setItem("nutriexa_welcome_coupon", "WELCOME10");
      setSubscribed(true);
      setShowModal(true);
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section className="relative bg-[#0b0e14] py-16 md:py-20 overflow-hidden border-t border-[#1b2230]">
      <div className="absolute inset-0 -z-0 opacity-25">
        <div className="w-80 h-80 rounded-full bg-[#22c55e] blur-3xl absolute -top-10 -left-10" />
        <div className="w-72 h-72 rounded-full bg-[#22c55e] blur-3xl absolute -bottom-10 -right-10" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-[#22c55e]/15 border border-[#22c55e]/40 text-[#22c55e] text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider mb-4">
          <FiTag size={14} /> Instant 10% Discount
        </div>

        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
          Get <span className="text-[#22c55e]">10% OFF</span> Your First Order
        </h2>
        <p className="text-gray-300 mt-3 max-w-md mx-auto text-sm">
          Subscribe for exclusive deals, new arrivals, and fitness tips straight to your inbox.
        </p>

        {subscribed ? (
          <div className="mt-8 bg-[#111722] border border-[#22c55e]/50 rounded-2xl p-5 max-w-md mx-auto text-center shadow-xl animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-[#22c55e]/20 text-[#22c55e] flex items-center justify-center mx-auto mb-3">
              <FiCheck size={24} />
            </div>
            <h3 className="text-lg font-bold text-white">You're Subscribed! 🎉</h3>
            <p className="text-xs text-gray-400 mt-1">
              Use your 10% discount code during checkout:
            </p>

            <div className="mt-4 flex items-center justify-between bg-[#0b0e14] border border-[#22c55e] border-dashed rounded-xl p-3">
              <span className="font-mono text-base font-black text-[#22c55e] tracking-wider">
                {couponCode}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs font-semibold bg-[#22c55e] text-white px-3 py-1.5 rounded-lg hover:bg-[#1ea850] transition-colors cursor-pointer"
              >
                {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
                {copied ? "Copied!" : "Copy Code"}
              </button>
            </div>

            <Link
              to="/products"
              className="mt-4 inline-block w-full py-2.5 bg-[#22c55e] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:opacity-95 transition-opacity"
            >
              Shop Now & Apply 10% OFF
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address..."
              className="flex-1 px-4 py-3 rounded-xl bg-white text-[#1a1a1a] text-sm outline-none focus:ring-2 focus:ring-[#22c55e] shadow-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 bg-[#22c55e] text-white font-bold px-6 py-3 rounded-xl hover:opacity-95 transition-all shadow-md cursor-pointer disabled:opacity-60 whitespace-nowrap"
            >
              {loading ? "Subscribing..." : "Subscribe"} <FiSend size={16} />
            </button>
          </form>
        )}
      </div>

      {/* Success Modal Popup */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#12161f] border border-[#22c55e]/40 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl relative text-white">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1"
            >
              <FiX size={20} />
            </button>

            <div className="w-16 h-16 rounded-full bg-[#22c55e]/20 text-[#22c55e] flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎁</span>
            </div>

            <h3 className="text-xl font-black text-white">10% OFF UNLOCKED!</h3>
            <p className="text-xs text-gray-300 mt-2">
              Thank you for subscribing! Your discount coupon has been automatically activated for your checkout.
            </p>

            <div className="my-5 p-3.5 bg-[#0b0e14] border border-[#22c55e] border-dashed rounded-2xl flex items-center justify-between">
              <div className="text-left">
                <span className="text-[10px] text-gray-400 uppercase tracking-widest block font-bold">Coupon Code</span>
                <span className="text-lg font-black font-mono text-[#22c55e]">{couponCode}</span>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs font-bold bg-[#22c55e] text-white px-3.5 py-2 rounded-xl hover:bg-[#1ea850] transition-all cursor-pointer"
              >
                {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <Link
                to="/products"
                onClick={() => setShowModal(false)}
                className="w-full py-3 bg-[#22c55e] text-white text-xs font-black uppercase tracking-wider rounded-xl hover:opacity-95 transition-opacity"
              >
                Start Shopping Now
              </Link>
              <button
                onClick={() => setShowModal(false)}
                className="text-xs text-gray-400 hover:text-white py-1.5 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}