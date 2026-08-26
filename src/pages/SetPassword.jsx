import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { FiLock, FiEye, FiEyeOff, FiCheck, FiShield } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function SetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const email = location.state?.email || location.state?.identifier;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!email) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center max-w-sm">
          <p className="text-gray-600 mb-4 text-sm">No active verification session.</p>
          <Link
            to="/signup"
            className="inline-block bg-[#4CAF37] text-white text-xs font-bold px-5 py-2.5 rounded-lg hover:bg-[#439e30]"
          >
            Start Signup
          </Link>
        </div>
      </main>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/users/set-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to set password.");
        setLoading(false);
        return;
      }

      loginUser(data.user, data.token);
      navigate("/profile");
    } catch (err) {
      setError("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[85vh] flex items-center justify-center px-4 py-8 sm:py-16 bg-[#f7f8f6]">
      <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-[#4CAF37]/10 flex items-center justify-center mx-auto mb-4 text-[#4CAF37]">
            <FiShield size={26} />
          </div>
          <h1 className="text-2xl font-extrabold text-[#1a1a1a]">
            Set Account Password
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Email verified for <span className="font-semibold text-[#1a1a1a]">{email}</span>. Create a password to complete registration.
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
              New Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                className="w-full border border-gray-200 rounded-lg pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF37] focus:border-[#4CAF37]"
              />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#4CAF37]"
              >
                {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>

            {/* Strength meter */}
            {password.length > 0 && (
              <div className="mt-2 flex items-center gap-1.5">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      password.length >= level * 2
                        ? password.length >= 8
                          ? "bg-green-500"
                          : "bg-amber-400"
                        : "bg-gray-100"
                    }`}
                  />
                ))}
                <span className="text-[10px] text-gray-400 ml-1 font-medium">
                  {password.length < 6 ? "Weak" : password.length < 8 ? "Fair" : "Strong"}
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-[#1a1a1a] mb-1.5 block">
              Confirm Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                required
                className={`w-full border rounded-lg pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF37] ${
                  confirmPassword && password !== confirmPassword
                    ? "border-red-300"
                    : "border-gray-200 focus:border-[#4CAF37]"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((p) => !p)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#4CAF37]"
              >
                {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
              {confirmPassword && password === confirmPassword && (
                <FiCheck className="absolute right-10 top-1/2 -translate-y-1/2 text-green-500" size={16} />
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || password.length < 6 || password !== confirmPassword}
            className="w-full bg-[#4CAF37] text-white font-bold text-sm py-3 rounded-xl hover:bg-[#439e30] transition-colors disabled:opacity-60 shadow-sm mt-2"
          >
            {loading ? "Creating Account..." : "Complete Signup & Log In"}
          </button>
        </form>
      </div>
    </main>
  );
}