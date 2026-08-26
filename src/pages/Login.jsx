import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiShield } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Login() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }

    if (!form.password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.needsVerification) {
          navigate("/verify-otp", { state: { email: data.email || form.email.trim().toLowerCase() } });
          return;
        }
        if (data.needsPassword) {
          navigate("/set-password", { state: { email: data.email || form.email.trim().toLowerCase() } });
          return;
        }
        setError(data.message || "Invalid email or password.");
        setLoading(false);
        return;
      }

      loginUser(data.user, data.token);
      navigate("/profile");
    } catch (err) {
      setError("Unable to connect to server. Please ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[85vh] flex items-center justify-center px-4 py-8 sm:py-16 bg-[#f7f8f6]">
      <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-[#4CAF37]/10 flex items-center justify-center mx-auto mb-3 text-[#4CAF37]">
            <FiShield size={22} />
          </div>
          <h1 className="text-2xl font-extrabold text-[#1a1a1a]">Welcome Back</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Login with your registered email address
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-medium rounded-lg px-3.5 py-2.5 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#1a1a1a] mb-1.5 block">
              Email Address
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
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#1a1a1a]">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-[#4CAF37] font-semibold hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full border border-gray-200 rounded-lg pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF37] focus:border-[#4CAF37]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#4CAF37]"
              >
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4CAF37] text-white font-bold text-sm py-3 rounded-xl hover:bg-[#439e30] transition-colors disabled:opacity-60 shadow-sm flex items-center justify-center gap-2 mt-2"
          >
            {loading ? "Signing in..." : <>Sign In <FiArrowRight size={16} /></>}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            Don't have an account?{" "}
            <Link to="/signup" className="text-[#4CAF37] font-bold hover:underline">
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}