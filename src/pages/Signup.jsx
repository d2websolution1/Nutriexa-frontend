import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiArrowRight, FiShield } from "react-icons/fi";

const API_BASE = import.meta.env.VITE_API_URL || "   https://nutriexa-backend.onrender.com";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!form.email.trim() || !form.email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Signup failed. Please try again.");
        setLoading(false);
        return;
      }

      navigate("/verify-otp", {
        state: {
          email: form.email.trim().toLowerCase(),
          testOtp: data.testOtp,
        },
      });
    } catch (err) {
      setError("Unable to connect to server. Please check your backend connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[85vh] flex items-center justify-center px-4 py-8 sm:py-16 bg-[#f7f8f6]">
      <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-[#4CAF37]/10 flex items-center justify-center mx-auto mb-3 text-[#4CAF37]">
            <FiShield size={22} />
          </div>
          <h1 className="text-2xl font-extrabold text-[#1a1a1a]">
            Create Nutriexa Account
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Sign up with your email to receive a 6-digit verification code.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-medium rounded-lg px-3.5 py-2.5 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="text-xs font-semibold text-[#1a1a1a] mb-1.5 block">
              Full Name *
            </label>
            <div className="relative">
              <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Rahul Sharma"
                required
                className="w-full border border-gray-200 rounded-lg pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF37] focus:border-[#4CAF37]"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="text-xs font-semibold text-[#1a1a1a] mb-1.5 block">
              Email Address (for OTP) *
            </label>
            <div className="relative">
              <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@gmail.com"
                required
                className="w-full border border-gray-200 rounded-lg pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF37] focus:border-[#4CAF37]"
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">We will send a 6-digit OTP code to your Gmail</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4CAF37] text-white font-bold text-sm py-3 rounded-xl hover:bg-[#439e30] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 shadow-sm mt-2"
          >
            {loading ? (
              "Sending Verification OTP..."
            ) : (
              <>
                Continue & Get OTP <FiArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="text-[#4CAF37] font-bold hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}