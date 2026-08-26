import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { FiShield, FiRefreshCw, FiArrowLeft, FiCheck, FiMail } from "react-icons/fi";

const API_BASE = import.meta.env.VITE_API_URL || "http://https://nutriexa-backend.onrender.com";

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || location.state?.identifier;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState("");
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  if (!email) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-[#f7f8f6]">
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center max-w-sm w-full">
          <p className="text-gray-600 mb-4 text-sm">No signup session found.</p>
          <Link
            to="/signup"
            className="inline-block bg-[#4CAF37] text-white text-xs font-bold px-6 py-2.5 rounded-lg hover:bg-[#439e30] transition-colors"
          >
            Go to Signup
          </Link>
        </div>
      </main>
    );
  }

  const handleOtpChange = (val, idx) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    setError("");

    if (val && idx < 5) {
      document.getElementById(`otp-box-${idx + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      document.getElementById(`otp-box-${idx - 1}`)?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      document.getElementById("otp-box-5")?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      setError("Please enter the complete 6-digit OTP code.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/users/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Verification failed. Please try again.");
        setLoading(false);
        return;
      }

      navigate("/set-password", { state: { email } });
    } catch (err) {
      setError("Unable to connect to server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setResending(true);
    setResendMsg("");
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/users/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to resend OTP.");
        return;
      }

      setResendMsg("A fresh 6-digit OTP code has been dispatched to your email!");
      setOtp(["", "", "", "", "", ""]);
      setTimer(30);
    } catch (err) {
      setError("Unable to connect to server.");
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="min-h-[85vh] flex items-center justify-center px-4 py-10 sm:py-16 bg-[#f7f8f6]">
      <div className="w-full max-w-md mx-auto">
        
        <Link
          to="/signup"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#4CAF37] mb-5 transition-colors"
        >
          <FiArrowLeft size={14} /> Back to Signup
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-[#4CAF37]/10 flex items-center justify-center mx-auto mb-4 text-[#4CAF37]">
            <FiMail size={26} />
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-[#1a1a1a]">
            Verify Your Email
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-2 leading-relaxed">
            We've sent a 6-digit verification code to your Gmail:
            <br />
            <span className="font-bold text-[#1a1a1a] text-sm mt-1 inline-block">
              {email}
            </span>
          </p>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-medium rounded-lg px-3.5 py-2.5 mt-4 text-left">
              {error}
            </div>
          )}

          {resendMsg && (
            <div className="bg-green-50 border border-green-100 text-green-700 text-xs font-medium rounded-lg px-3.5 py-2.5 mt-4 text-left">
              {resendMsg}
            </div>
          )}

          <form onSubmit={handleVerify} className="mt-6 space-y-6">
            <div>
              <div
                className="flex gap-2 sm:gap-2.5 justify-center"
                onPaste={handleOtpPaste}
              >
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-box-${idx}`}
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
              className="w-full bg-[#4CAF37] text-white font-bold text-sm py-3 rounded-xl hover:bg-[#439e30] transition-colors disabled:opacity-60 shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                "Verifying Code..."
              ) : (
                <>
                  Verify OTP & Continue <FiCheck size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-50 text-center">
            {timer > 0 ? (
              <p className="text-xs text-gray-400">
                Resend OTP in <span className="font-bold text-gray-700">{timer}s</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-xs text-[#4CAF37] font-bold hover:underline inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                {resending ? (
                  <>
                    <FiRefreshCw size={12} className="animate-spin" /> Sending OTP...
                  </>
                ) : (
                  "Didn't receive code? Resend OTP"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}