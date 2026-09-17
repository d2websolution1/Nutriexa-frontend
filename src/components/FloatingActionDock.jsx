import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaWhatsapp,
} from "react-icons/fa";
import {
  FiMessageSquare,
  FiX,
  FiSend,
  FiStar,
  FiBriefcase,
  FiCheckCircle,
  FiChevronUp,
  FiChevronDown,
  FiSmile,
} from "react-icons/fi";
import { TbMessageChatbot, TbTruckDelivery, TbTag, TbShieldCheck } from "react-icons/tb";
import { API_URL as API_BASE } from "../config";

export default function FloatingActionDock() {
  const [chatOpen, setChatOpen] = useState(false);
  const [distributorOpen, setDistributorOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [dockExpanded, setDockExpanded] = useState(true);

  // Chatbot state
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "👋 Hi there! Welcome to Nutriexa. I'm your AI Fitness & Order Assistant. How can I help you today?",
      time: "Just now",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Distributor modal state
  const [distForm, setDistForm] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    company_name: "",
    message: "",
  });
  const [distSubmitting, setDistSubmitting] = useState(false);
  const [distSuccess, setDistSuccess] = useState(false);

  // Feedback modal state
  const [feedbackForm, setFeedbackForm] = useState({
    name: "",
    email: "",
    rating: 5,
    category: "Product Quality",
    feedback: "",
  });
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Chat message send handler
  const handleSendChat = (customText) => {
    const textToSend = customText || chatInput.trim();
    if (!textToSend) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!customText) setChatInput("");
    setIsTyping(true);

    setTimeout(() => {
      let reply = "Thank you for asking! For personalized supplement stacks or bulk inquiries, you can also chat with our specialist directly via WhatsApp or click 'Become a Distributor'.";
      const lower = textToSend.toLowerCase();

      if (lower.includes("track") || lower.includes("order") || lower.includes("status")) {
        reply = "You can track your live shipment anytime on our Track Order page with your Order ID or phone number: Click on 'Track Order' in the top header menu!";
      } else if (lower.includes("discount") || lower.includes("coupon") || lower.includes("offer") || lower.includes("10%")) {
        reply = "🎉 Use coupon code WELCOME10 at checkout to get an instant 10% OFF your entire first order!";
      } else if (lower.includes("distributor") || lower.includes("dealership") || lower.includes("wholesale")) {
        reply = "We are currently expanding our official distribution network! Click on 'Become a Distributor' on the right side dock to submit your dealership inquiry.";
      } else if (lower.includes("creatine")) {
        reply = "Our 100% Pure Micronized Creatine Monohydrate supports explosive power, muscle hydration, and faster ATP replenishment. Check it out under the Creatine category!";
      } else if (lower.includes("whey") || lower.includes("protein")) {
        reply = "Our Nutriexa Premium 100% Whey Protein provides 24g of high-grade bioavailable protein per scoop with zero added sugars. Available in chocolate, vanilla, and strawberry flavors!";
      } else if (lower.includes("genuine") || lower.includes("authentic") || lower.includes("fake")) {
        reply = "Every single Nutriexa product comes with a unique scratch QR security code. You can verify your batch number on our Authenticator page for 100% authenticity guarantee!";
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setIsTyping(false);
    }, 600);
  };

  // Submit Distributor Inquiry
  const handleDistributorSubmit = async (e) => {
    e.preventDefault();
    if (!distForm.name || !distForm.phone) return;
    setDistSubmitting(true);
    try {
      await fetch(`${API_BASE}/api/distributor/inquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(distForm),
      });
    } catch (err) {
      // offline fallback
    } finally {
      setDistSubmitting(false);
      setDistSuccess(true);
      setTimeout(() => {
        setDistSuccess(false);
        setDistributorOpen(false);
        setDistForm({ name: "", phone: "", email: "", city: "", company_name: "", message: "" });
      }, 2500);
    }
  };

  // Submit Feedback
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackForm.feedback.trim()) return;
    setFeedbackSubmitting(true);
    try {
      await fetch(`${API_BASE}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedbackForm),
      });
    } catch (err) {
      // offline fallback
    } finally {
      setFeedbackSubmitting(false);
      setFeedbackSuccess(true);
      setTimeout(() => {
        setFeedbackSuccess(false);
        setFeedbackOpen(false);
        setFeedbackForm({ name: "", email: "", rating: 5, category: "Product Quality", feedback: "" });
      }, 2500);
    }
  };

  return (
    <>
      {/* Floating Action Dock (Right Side) */}
      <aside aria-label="Quick Actions" className="fixed right-3 sm:right-5 bottom-6 z-40 flex flex-col items-end gap-2.5 select-none print:hidden">
        {/* Toggle Collapse Button */}
        <button
          type="button"
          onClick={() => setDockExpanded((prev) => !prev)}
          className="w-7 h-7 rounded-full bg-gray-800/80 hover:bg-gray-700 text-gray-300 flex items-center justify-center shadow-md transition-all cursor-pointer text-xs mb-1"
          title={dockExpanded ? "Collapse shortcuts" : "Expand shortcuts"}
          aria-label={dockExpanded ? "Collapse shortcuts" : "Expand shortcuts"}
        >
          {dockExpanded ? <FiChevronDown size={14} /> : <FiChevronUp size={14} />}
        </button>

        {dockExpanded && (
          <div className="flex flex-col items-end gap-2.5 animate-fadeIn">
            {/* 1. Become a Distributor Floating Tab */}
            <button
              type="button"
              onClick={() => {
                setDistributorOpen(true);
                setChatOpen(false);
              }}
              className="flex items-center gap-2 bg-[#121722] hover:bg-[#1a2232] text-white border border-[#22c55e]/40 hover:border-[#22c55e] px-3.5 py-2 rounded-full shadow-xl transition-all cursor-pointer text-xs font-bold group hover:scale-105"
            >
              <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
              <FiBriefcase size={14} className="text-[#22c55e]" />
              <span className="whitespace-nowrap">Become a Distributor</span>
            </button>

            {/* 2. Feedback Floating Tab */}
            <button
              type="button"
              onClick={() => {
                setFeedbackOpen(true);
                setChatOpen(false);
              }}
              className="flex items-center gap-2 bg-[#121722] hover:bg-[#1a2232] text-white border border-gray-700 hover:border-amber-400 px-3.5 py-2 rounded-full shadow-xl transition-all cursor-pointer text-xs font-semibold group hover:scale-105"
            >
              <FiSmile size={14} className="text-amber-400" />
              <span className="whitespace-nowrap">Feedback</span>
            </button>

            {/* 3. WhatsApp Floating Button */}
            <a
              href="https://wa.me/919717323824?text=Hello%20Nutriexa%20Team%2C%20I%20have%20an%20inquiry%20regarding%20products."
              target="_blank"
              rel="noopener noreferrer"
              className="w-13 h-13 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center shadow-2xl transition-all cursor-pointer hover:scale-110 relative group"
              title="Chat with us on WhatsApp"
            >
              <FaWhatsapp size={28} />
              <span className="absolute right-full mr-3 bg-gray-900 text-white text-xs px-2.5 py-1 rounded-md shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-medium">
                WhatsApp Us
              </span>
            </a>

            {/* 4. AI BotChat Floating Button */}
            <button
              type="button"
              onClick={() => {
                setChatOpen((prev) => !prev);
                setDistributorOpen(false);
              }}
              className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#166534] to-[#22c55e] text-white flex items-center justify-center shadow-2xl transition-all cursor-pointer hover:scale-110 relative group border-2 border-white/20"
              title="Open AI Bot Chat"
            >
              {chatOpen ? <FiX size={26} /> : <TbMessageChatbot size={28} />}
              {!chatOpen && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 border-2 border-[#121722] rounded-full" />
              )}
              <span className="absolute right-full mr-3 bg-gray-900 text-white text-xs px-2.5 py-1 rounded-md shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-medium">
                BotChat Help
              </span>
            </button>
          </div>
        )}
      </aside>

      {/* =========================================================================
          BOTCHAT DRAWER / POPUP
         ========================================================================= */}
      {chatOpen && (
        <div className="fixed right-3 sm:right-6 bottom-24 z-50 w-[92vw] sm:w-[380px] max-h-[550px] h-[520px] bg-[#111722] text-white border border-[#22c55e]/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-[#0b0e14] via-[#121722] to-[#15231c] px-5 py-4 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#22c55e]/20 border border-[#22c55e]/40 flex items-center justify-center text-[#22c55e]">
                <TbMessageChatbot size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">Nutriexa AI Bot</h4>
                  <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-ping" />
                </div>
                <p className="text-[10px] text-gray-400">Online • Instant 24/7 Support</p>
              </div>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Chat Quick Action Chips */}
          <div className="px-4 py-2.5 bg-[#0b0e14]/60 border-b border-gray-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
            <button
              onClick={() => handleSendChat("Track my order")}
              className="shrink-0 bg-white/5 hover:bg-[#22c55e]/20 border border-gray-700 hover:border-[#22c55e] text-gray-200 px-2.5 py-1 rounded-full transition-colors flex items-center gap-1"
            >
              <TbTruckDelivery size={12} className="text-[#22c55e]" /> Track Order
            </button>
            <button
              onClick={() => handleSendChat("Show active discount coupon")}
              className="shrink-0 bg-white/5 hover:bg-[#22c55e]/20 border border-gray-700 hover:border-[#22c55e] text-gray-200 px-2.5 py-1 rounded-full transition-colors flex items-center gap-1"
            >
              <TbTag size={12} className="text-[#22c55e]" /> 10% Discount
            </button>
            <button
              onClick={() => {
                setChatOpen(false);
                setDistributorOpen(true);
              }}
              className="shrink-0 bg-white/5 hover:bg-[#22c55e]/20 border border-gray-700 hover:border-[#22c55e] text-gray-200 px-2.5 py-1 rounded-full transition-colors flex items-center gap-1"
            >
              <FiBriefcase size={12} className="text-[#22c55e]" /> Distributor
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-[#22c55e] text-white rounded-tr-none shadow-md font-medium"
                      : "bg-[#18202d] text-gray-200 border border-gray-800 rounded-tl-none"
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-gray-500 mt-1 px-1">{msg.time}</span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-[#18202d] border border-gray-800 rounded-2xl px-3 py-2 w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-bounce [animation-delay:0.4s]" />
              </div>
            )}
          </div>

          {/* Chat Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendChat();
            }}
            className="p-3 bg-[#0b0e14] border-t border-gray-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask about products, orders, creatine..."
              className="flex-1 bg-[#18202d] border border-gray-700 focus:border-[#22c55e] rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-400 outline-none focus:ring-1 focus:ring-[#22c55e]"
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="bg-[#22c55e] text-white p-2.5 rounded-xl hover:bg-[#1ea850] transition-colors disabled:opacity-40 cursor-pointer"
            >
              <FiSend size={15} />
            </button>
          </form>
        </div>
      )}

      {/* =========================================================================
          BECOME A DISTRIBUTOR MODAL
         ========================================================================= */}
      {distributorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#111722] text-white border border-[#22c55e]/40 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setDistributorOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg"
            >
              <FiX size={22} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-[#22c55e]/20 border border-[#22c55e]/40 flex items-center justify-center text-[#22c55e]">
                <FiBriefcase size={22} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Become a Nutriexa Distributor</h3>
                <p className="text-xs text-gray-400">Partner with India's fastest growing fitness nutrition brand</p>
              </div>
            </div>

            {distSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-[#22c55e]/20 text-[#22c55e] flex items-center justify-center mx-auto mb-3">
                  <FiCheckCircle size={36} />
                </div>
                <h4 className="text-lg font-bold text-white">Inquiry Submitted Successfully!</h4>
                <p className="text-xs text-gray-300 mt-2 max-w-sm mx-auto">
                  Thank you for your interest! Our head of dealership & wholesale will reach out to you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleDistributorSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={distForm.name}
                      onChange={(e) => setDistForm({ ...distForm, name: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-[#18202d] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#22c55e]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={distForm.phone}
                      onChange={(e) => setDistForm({ ...distForm, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full bg-[#18202d] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#22c55e]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={distForm.email}
                      onChange={(e) => setDistForm({ ...distForm, email: e.target.value })}
                      placeholder="rahul@example.com"
                      className="w-full bg-[#18202d] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#22c55e]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">City / State</label>
                    <input
                      type="text"
                      value={distForm.city}
                      onChange={(e) => setDistForm({ ...distForm, city: e.target.value })}
                      placeholder="e.g. Mumbai, Maharashtra"
                      className="w-full bg-[#18202d] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#22c55e]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Company / Store Name</label>
                  <input
                    type="text"
                    value={distForm.company_name}
                    onChange={(e) => setDistForm({ ...distForm, company_name: e.target.value })}
                    placeholder="e.g. FitZone Supplements & Gym"
                    className="w-full bg-[#18202d] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#22c55e]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Message / Expected Volume</label>
                  <textarea
                    rows={3}
                    value={distForm.message}
                    onChange={(e) => setDistForm({ ...distForm, message: e.target.value })}
                    placeholder="Tell us about your distribution experience or monthly retail requirements..."
                    className="w-full bg-[#18202d] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#22c55e]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={distSubmitting}
                    className="w-full py-3 bg-[#22c55e] text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#1ea850] transition-colors cursor-pointer shadow-lg disabled:opacity-60"
                  >
                    {distSubmitting ? "Submitting Inquiry..." : "Submit Dealership Inquiry"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          FEEDBACK MODAL
         ========================================================================= */}
      {feedbackOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#111722] text-white border border-gray-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setFeedbackOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1"
            >
              <FiX size={22} />
            </button>

            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-400 flex items-center justify-center mx-auto mb-2">
                <FiSmile size={26} />
              </div>
              <h3 className="text-lg font-bold text-white">We Value Your Feedback</h3>
              <p className="text-xs text-gray-400">Help us make your Nutriexa experience even better</p>
            </div>

            {feedbackSuccess ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-full bg-[#22c55e]/20 text-[#22c55e] flex items-center justify-center mx-auto mb-3">
                  <FiCheckCircle size={32} />
                </div>
                <h4 className="text-base font-bold text-white">Thank You For Your Feedback!</h4>
                <p className="text-xs text-gray-300 mt-1">Your review helps us maintain 100% excellence.</p>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                {/* Star Rating */}
                <div className="flex flex-col items-center gap-1.5 pb-2">
                  <span className="text-xs text-gray-300 font-semibold">Your Overall Rating</span>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                        className="text-2xl text-amber-400 hover:scale-125 transition-transform cursor-pointer"
                      >
                        <FiStar
                          className={star <= feedbackForm.rating ? "fill-amber-400 text-amber-400" : "text-gray-600"}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Feedback Category</label>
                  <select
                    value={feedbackForm.category}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, category: e.target.value })}
                    className="w-full bg-[#18202d] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#22c55e]"
                  >
                    <option value="Product Quality">Product Quality & Taste</option>
                    <option value="Delivery Speed">Packaging & Delivery</option>
                    <option value="Website Experience">Website Experience</option>
                    <option value="Customer Support">Customer Support</option>
                    <option value="Other">Other Suggestion</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Your Comments *</label>
                  <textarea
                    rows={3}
                    required
                    value={feedbackForm.feedback}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, feedback: e.target.value })}
                    placeholder="Share what you loved or how we can improve..."
                    className="w-full bg-[#18202d] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#22c55e]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={feedbackSubmitting}
                  className="w-full py-2.5 bg-[#22c55e] text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#1ea850] transition-colors cursor-pointer shadow-md disabled:opacity-60"
                >
                  {feedbackSubmitting ? "Submitting..." : "Submit Feedback"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
