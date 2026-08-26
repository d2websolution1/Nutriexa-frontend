import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiShield,
  FiArrowLeft,
  FiCheck,
  FiRefreshCw,
  FiArrowRight,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "   https://nutriexa-backend.onrender.com";

const STEPS = ["Enter Email", "Verify OTP", "New Password"];

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [step, setStep] = useState(1); // 1 = email, 2 = OTP, 3 = new password, 4 = success
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  /* ─── STEP 1: Send OTP ─── */
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/users/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to send reset code.");
        return;
      }

      setTimer(30);
      setStep(2);
    } catch {
      setError("Could not connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ─── Resend OTP ─── */
  const handleResend = async () => {
    if (timer > 0) return;
    setResending(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/users/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      setOtp(["", "", "", "", "", ""]);
      setTimer(30);
    } catch {
      setError("Failed to resend OTP.");
    } finally {
      setResending(false);
    }
  };

  /* ─── OTP input box handlers ─── */
  const handleOtpChange = (val, idx) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    setError("");
    if (val && idx < 5) {
      document.getElementById(`reset-otp-${idx + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      document.getElementById(`reset-otp-${idx - 1}`)?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      document.getElementById("reset-otp-5")?.focus();
    }
  };

  /* ─── STEP 2: Verify OTP ─── */
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    const code = otp.join("");
    if (code.length < 6) return setError("Please enter the complete 6-digit OTP.");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/users/verify-reset-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Invalid OTP code.");
        return;
      }
      setStep(3);
    } catch {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ─── STEP 3: Reset Password ─── */
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 6) return setError("Password must be at least 6 characters.");
    if (newPassword !== confirmPassword) return setError("Passwords do not match.");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/users/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otp.join(""),
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to reset password.");
        return;
      }

      // Auto-login the user
      if (data.token && data.user) {
        loginUser(data.user, data.token);
      }
      setStep(4);
    } catch {
      setError("Reset failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[85vh] flex items-center justify-center px-4 py-8 sm:py-16 bg-[#f7f8f6]">
      <div className="w-full max-w-md mx-auto">

        {step !== 4 && (
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#4CAF37] mb-5 transition-colors"
          >
            <FiArrowLeft size={14} /> Back to Login
          </Link>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">

          {/* ── SUCCESS SCREEN ── */}
          {step === 4 ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4 text-[#4CAF37]">
                <FiCheck size={32} strokeWidth={2.5} />
              </div>
              <h1 className="text-2xl font-extrabold text-[#1a1a1a]">Password Reset Successful!</h1>
              <p className="text-sm text-gray-500 mt-2 mb-6">
                Your password has been updated and you are now automatically logged in.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate("/")}
                  className="w-full bg-[#4CAF37] text-white font-bold text-sm py-3 rounded-xl hover:bg-[#439e30] transition-colors shadow-sm"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={() => navigate("/profile")}
                  className="w-full bg-gray-100 text-[#1a1a1a] font-bold text-sm py-3 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Go to My Account
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full bg-[#4CAF37]/10 flex items-center justify-center mx-auto mb-3 text-[#4CAF37]">
                  <FiShield size={22} />
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#1a1a1a]">Forgot Password?</h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  {step === 1 && "Enter your registered email to receive a password reset OTP."}
                  {step === 2 && `Enter the 6-digit OTP sent to ${email}`}
                  {step === 3 && "Create a new secure password for your account."}
                </p>
              </div>

              {/* Step indicator */}
              <div className="flex items-center gap-1.5 mb-6">
                {STEPS.map((label, i) => (
                  <div key={label} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`h-1.5 w-full rounded-full transition-colors duration-300 ${
                        i + 1 <= step ? "bg-[#4CAF37]" : "bg-gray-100"
                      }`}
                    />
                    <span
                      className={`text-[10px] font-semibold ${
                        i + 1 === step ? "text-[#4CAF37]" : "text-gray-400"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-medium rounded-lg px-3.5 py-2.5 mb-4">
                  {error}
                </div>
              )}

              {/* ── STEP 1: Identification via Email ── */}
              {step === 1 && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-[#1a1a1a] mb-1.5 block">
                      Registered Email Address
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(""); }}
                        placeholder="you@gmail.com"
                        autoFocus
                        required
                        className="w-full border border-gray-200 rounded-lg pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF37] focus:border-[#4CAF37]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#4CAF37] text-white font-bold text-sm py-3 rounded-xl hover:bg-[#439e30] transition-colors disabled:opacity-60 shadow-sm flex items-center justify-center gap-2"
                  >
                    {loading ? "Sending Reset OTP..." : <>Send Reset OTP <FiArrowRight size={15} /></>}
                  </button>
                </form>
              )}

              {/* ── STEP 2: OTP Verification ── */}
              {step === 2 && (
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div>
                    <label className="text-xs font-semibold text-[#1a1a1a] mb-3 block text-center">
                      Enter 6-digit OTP Code
                    </label>
                    <div
                      className="flex gap-2 sm:gap-2.5 justify-center"
                      onPaste={handleOtpPaste}
                    >
                      {otp.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`reset-otp-${idx}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(e.target.value, idx)}
                          onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                          autoFocus={idx === 0}
                          className="w-11 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4CAF37] focus:border-[#4CAF37] transition-all bg-gray-50 text-[#1a1a1a]"
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.join("").length < 6}
                    className="w-full bg-[#4CAF37] text-white font-bold text-sm py-3 rounded-xl hover:bg-[#439e30] transition-colors disabled:opacity-60 shadow-sm"
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
                  </button>

                  <div className="text-center pt-2">
                    {timer > 0 ? (
                      <p className="text-xs text-gray-400">
                        Resend code in <span className="font-bold text-gray-700">{timer}s</span>
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={resending}
                        className="text-xs text-[#4CAF37] font-bold hover:underline inline-flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {resending ? (
                          <><FiRefreshCw size={12} className="animate-spin" /> Sending...</>
                        ) : (
                          "Didn't receive code? Resend OTP"
                        )}
                      </button>
                    )}
                  </div>
                </form>
              )}

              {/* ── STEP 3: Set New Password ── */}
              {step === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-[#1a1a1a] mb-1.5 block">
                      New Password
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type={showPass ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => { setNewPassword(e.target.value); setError(""); }}
                        placeholder="Minimum 6 characters"
                        autoFocus
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

                    {newPassword.length > 0 && (
                      <div className="mt-2 flex items-center gap-1.5">
                        {[1, 2, 3, 4].map((n) => (
                          <div
                            key={n}
                            className={`h-1.5 flex-1 rounded-full transition-colors ${
                              newPassword.length >= n * 2
                                ? newPassword.length >= 8
                                  ? "bg-green-500"
                                  : "bg-amber-400"
                                : "bg-gray-100"
                            }`}
                          />
                        ))}
                        <span className="text-[10px] text-gray-400 ml-1 font-medium">
                          {newPassword.length < 6 ? "Weak" : newPassword.length < 8 ? "Fair" : "Strong"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#1a1a1a] mb-1.5 block">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type={showConfirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                        placeholder="Re-enter new password"
                        required
                        className={`w-full border rounded-lg pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF37] ${
                          confirmPassword && newPassword !== confirmPassword
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
                      {confirmPassword && newPassword === confirmPassword && (
                        <FiCheck className="absolute right-10 top-1/2 -translate-y-1/2 text-green-500" size={16} />
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || newPassword.length < 6 || newPassword !== confirmPassword}
                    className="w-full bg-[#4CAF37] text-white font-bold text-sm py-3 rounded-xl hover:bg-[#439e30] transition-colors disabled:opacity-60 shadow-sm mt-2"
                  >
                    {loading ? "Updating Password..." : "Reset Password & Log In"}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
