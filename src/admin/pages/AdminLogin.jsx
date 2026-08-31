import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield } from "react-icons/fi";
import { API_URL } from "../../config";
import { useAuth } from "../../context/AuthContext";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { loginAdmin } = useAuth();
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

    if (!form.email || !form.password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });


      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid email or password.");
        setLoading(false);
        return;
      }

      loginAdmin(data.admin, data.token);
      navigate("/admin");
    } catch (err) {
      setError("Unable to connect to server. Please make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative glows */}
      <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#4CAF37]/20 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-[#4CAF37]/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <svg width="56" height="56" viewBox="0 0 56 56" className="shrink-0">
            <circle
              cx="28" cy="28" r="25.5" fill="none" stroke="#fff"
              strokeWidth="1.4" strokeDasharray="130 30" strokeLinecap="round"
              transform="rotate(-20 28 28)"
            />
            <text x="28" y="37" textAnchor="middle" fontFamily="Arial" fontWeight="800" fontSize="24">
              <tspan fill="#8a8a8a">N</tspan>
              <tspan fill="#4CAF37">X</tspan>
            </text>
          </svg>
          <div className="text-center">
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              NUTRI<span className="text-[#4CAF37]">EXA</span>
            </h1>
            <p className="text-[10px] tracking-[0.2em] text-gray-400 mt-1">
              ADMIN PANEL
            </p>
          </div>
        </div>

        {/* Login card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center gap-2 mb-1.5">
            <FiShield className="text-[#4CAF37]" size={20} />
            <h2 className="text-lg font-extrabold text-[#1a1a1a]">Admin Login</h2>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Sign in to manage your store dashboard.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-medium rounded-md px-3.5 py-2.5 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#1a1a1a] mb-1.5 block">
                Email Address
              </label>
              <div className="relative">
                <FiMail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="admin@nutriexa.com"
                  autoComplete="username"
                  className="w-full border border-gray-200 rounded-md pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF37]"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-[#1a1a1a] mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <FiLock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full border border-gray-200 rounded-md pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF37]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#4CAF37]"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-1.5 text-gray-600 cursor-pointer">
                <input type="checkbox" className="accent-[#4CAF37]" />
                Remember me
              </label>
              <button
                type="button"
                className="text-[#4CAF37] font-semibold hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4CAF37] text-white font-semibold text-sm py-2.5 rounded-md hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          &copy; {new Date().getFullYear()} Nutriexa. Admin access is restricted to authorized personnel only.
        </p>
      </div>
    </div>
  );
}