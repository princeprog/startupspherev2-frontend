import { useState, useEffect } from "react";
import { toast } from "react-toastify";

export default function DashboardVerification({
  setVerificationModal,
  startupId,
  contactEmail,
  resetForm,
  onVerifySuccess,
}) {
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [cooldown, setCooldown] = useState(0); // seconds

  // Cooldown timer effect
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    } else if (cooldown === 0 && isCodeSent) {
      // Timer finished → allow resend
      setIsCodeSent(false);
    }
    return () => clearTimeout(timer);
  }, [cooldown, isCodeSent]);

  const handleSendCode = async () => {
    if (isSendingCode || isCodeSent || cooldown > 0) return;

    setIsSendingCode(true);
    setError("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/startups/send-verification-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ startupId, email: contactEmail }),
          credentials: "include",
        }
      );

      if (response.ok) {
        toast.success("Verification code sent! Check your inbox.");
        setIsCodeSent(true);
        setCooldown(60); // 60-second cooldown
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || "Failed to send code. Try again later.");
      }
    } catch (error) {
      console.error("Error sending verification code:", error);
      toast.error("Network error. Please check your connection.");
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      setError("Please enter the verification code.");
      toast.error("Verification code is required.");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/startups/verify-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            startupId,
            email: contactEmail,
            code: verificationCode.trim(),
          }),
          credentials: "include",
        }
      );

      if (response.ok) {
        toast.success("Email verified successfully!");
        setVerificationModal(false);
        onVerifySuccess(startupId);
      } else {
        const errorData = await response.json().catch(() => ({}));
        const msg = errorData.error || errorData.message || "Invalid code";
        toast.error(msg);
        setError(msg);
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Verification failed. Please try again.");
      setError("Verification failed.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    setVerificationModal(false);
    resetForm?.();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto overflow-hidden">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Verify Your Email</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            A 6-digit verification code has been sent to:
            <br />
            <span className="font-semibold text-indigo-600">{contactEmail}</span>
          </p>

          {/* Success Message */}
          {isCodeSent && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-sm text-green-800 font-medium">
                Code sent successfully!
              </p>
              <p className="text-xs text-green-700 mt-1">
                Check your inbox and spam folder.
              </p>
            </div>
          )}

          {/* Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter 6-digit Code
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              maxLength="6"
              className="w-full px-5 py-4 text-center text-2xl font-mono tracking-widest bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              disabled={isVerifying}
            />
            {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleClose}
              className="px-6 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>

            {/* Resend Button with Cooldown */}
            <button
              onClick={handleSendCode}
              disabled={isSendingCode || isCodeSent || cooldown > 0}
              className={`px-6 py-3 rounded-xl font-medium transition flex items-center justify-center ${
                cooldown > 0
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : isSendingCode
                  ? "bg-indigo-500 text-white"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md"
              }`}
            >
              {isSendingCode ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending...
                </>
              ) : cooldown > 0 ? (
                `Resend in ${cooldown}s`
              ) : (
                "Send Code"
              )}
            </button>

            {/* Verify Button */}
            <button
              onClick={handleVerify}
              disabled={isVerifying || !verificationCode.trim()}
              className="px-8 py-3 bg-[#1D3557] text-white rounded-xl font-medium hover:bg-[#162c44] disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md flex items-center justify-center"
            >
              {isVerifying ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </button>
          </div>

          {/* Footer Note */}
          <p className="text-xs text-gray-500 text-center mt-6">
            Didn't receive the code? Check your spam folder or try resending after the timer.
          </p>
        </div>
      </div>
    </div>
  );
}